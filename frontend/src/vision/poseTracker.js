// On-device landmark tracking with MediaPipe Tasks (WebAssembly + WebGL).
//
// Why on-device: the old pipeline sent every frame to the server (upload →
// Render → gRPC → Python → back), so each frame cost a full network round
// trip (150–400 ms just to reach Render) and frames were processed one at a
// time — roughly 2–6 fps. Running the model in the browser removes the
// network entirely: inference takes milliseconds on the user's GPU, every
// camera frame is processed, and no video leaves the device.
//
// Why VIDEO mode: the landmarker tracks the person between frames instead of
// re-detecting from scratch, which is both faster and much steadier.

const WASM_BASE = '/mediapipe/wasm'; // copied from node_modules by scripts/copy-mediapipe-wasm.mjs

const MODEL_URLS = {
  full: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
  lite: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
  hand: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
};

// If the full model averages slower than this per frame (can't keep ~25 fps),
// TRY the lite model. Keep lite only if it is clearly faster: on many GPUs the
// per-frame cost is mostly fixed overhead (GPU sync/readback), so lite is
// barely faster (measured on Intel Iris Xe: full 48.5 ms vs lite 45.3 ms) and
// would just cost accuracy.
const SLOW_FRAME_MS = 40;
const WARMUP_FRAMES = 30;
const MIN_SPEEDUP = 0.8; // lite must take <= 80% of full's time to be kept

let visionModule = null;
let filesetPromise = null;

async function loadVision() {
  // Imported lazily so the ~MBs of MediaPipe JS only load on the workout page.
  if (!visionModule) visionModule = await import('@mediapipe/tasks-vision');
  return visionModule;
}

async function loadFileset() {
  const { FilesetResolver } = await loadVision();
  if (!filesetPromise) {
    filesetPromise = FilesetResolver.forVisionTasks(WASM_BASE).catch((err) => {
      filesetPromise = null; // allow a retry later
      throw err;
    });
  }
  return filesetPromise;
}

const commonOptions = (delegate, modelPath) => ({
  baseOptions: { modelAssetPath: modelPath, delegate },
  // Each landmarker gets its own canvas for its WebGL context.
  canvas: document.createElement('canvas'),
  runningMode: 'VIDEO'
});

/**
 * Wraps a MediaPipe landmarker with: strictly increasing timestamps (required
 * by VIDEO mode), inference timing, and error isolation.
 */
function wrap(landmarker) {
  let lastTs = 0;
  let avgMs = 0;
  let frames = 0;
  return {
    landmarker,
    detect(source, nowMs) {
      const ts = nowMs > lastTs ? nowMs : lastTs + 1;
      lastTs = ts;
      const t0 = performance.now();
      let result;
      try {
        result = landmarker.detectForVideo(source, ts);
      } catch (err) {
        console.warn('[pose] detectForVideo failed:', err?.message || err);
        return { result: null, inferenceMs: 0 };
      }
      const ms = performance.now() - t0;
      frames += 1;
      avgMs = frames === 1 ? ms : avgMs * 0.9 + ms * 0.1; // EMA
      return { result, inferenceMs: ms };
    },
    get avgMs() { return avgMs; },
    get frames() { return frames; },
    close() { try { landmarker.close(); } catch { /* already closed */ } }
  };
}

/**
 * Create a body-pose tracker. Tries GPU + full model, then CPU + lite.
 * Resolves to { detect(video, nowMs) -> { landmarks, worldLandmarks, inferenceMs } | null, info, close() }.
 */
export async function createPoseTracker({ onInfoChange } = {}) {
  const { PoseLandmarker } = await loadVision();
  const fileset = await loadFileset();

  const make = (delegate, model) =>
    PoseLandmarker.createFromOptions(fileset, {
      ...commonOptions(delegate, MODEL_URLS[model]),
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputSegmentationMasks: false
    });

  const attempts = [
    { delegate: 'GPU', model: 'full' },
    { delegate: 'CPU', model: 'lite' }
  ];
  let current = null;
  let info = null;
  let lastError = null;
  for (const attempt of attempts) {
    try {
      current = wrap(await make(attempt.delegate, attempt.model));
      info = { ...attempt };
      break;
    } catch (err) {
      lastError = err;
      console.warn(`[pose] ${attempt.delegate}/${attempt.model} unavailable:`, err?.message || err);
    }
  }
  if (!current) throw lastError || new Error('Pose landmarker could not be created');

  let closed = false;
  // Lite-model trial: 'idle' → 'loading' → 'trial' → 'done' (kept or reverted).
  let trialState = 'idle';
  let fullTracker = null;
  let fullAvgMs = 0;

  const setCurrent = (tracker, model) => {
    current = tracker;
    info = { ...info, model };
    onInfoChange && onInfoChange({ ...info });
  };

  const maybeSwitchModel = () => {
    if (trialState === 'idle') {
      if (info.model !== 'full' || current.frames < WARMUP_FRAMES || current.avgMs <= SLOW_FRAME_MS) return;
      trialState = 'loading';
      fullTracker = current;
      fullAvgMs = current.avgMs;
      make(info.delegate, 'lite')
        .then((lm) => {
          if (closed) { lm.close(); return; }
          trialState = 'trial';
          setCurrent(wrap(lm), 'lite');
        })
        .catch((err) => {
          trialState = 'done';
          console.warn('[pose] lite model unavailable:', err?.message || err);
        });
    } else if (trialState === 'trial' && current.frames >= WARMUP_FRAMES) {
      trialState = 'done';
      if (current.avgMs <= fullAvgMs * MIN_SPEEDUP) {
        fullTracker.close(); // lite is meaningfully faster on this device: keep it
      } else {
        const lite = current; // not worth the accuracy loss: go back to full
        setCurrent(fullTracker, 'full');
        lite.close();
      }
      fullTracker = null;
    }
  };

  return {
    get info() { return { ...info, avgInferenceMs: current.avgMs }; },
    detect(video, nowMs) {
      if (closed) return null;
      const { result, inferenceMs } = current.detect(video, nowMs);
      maybeSwitchModel();
      if (!result) return null;
      return {
        landmarks: result.landmarks && result.landmarks[0] ? result.landmarks[0] : null,
        worldLandmarks: result.worldLandmarks && result.worldLandmarks[0] ? result.worldLandmarks[0] : null,
        inferenceMs
      };
    },
    close() {
      closed = true;
      current.close();
      if (fullTracker && fullTracker !== current) fullTracker.close();
    }
  };
}

/**
 * Create a hand tracker (up to 2 hands). Tries GPU, then CPU.
 * detect() resolves to { hands: [{ landmarks, handedness }], inferenceMs } | null.
 */
export async function createHandTracker() {
  const { HandLandmarker } = await loadVision();
  const fileset = await loadFileset();

  let current = null;
  let info = null;
  let lastError = null;
  for (const delegate of ['GPU', 'CPU']) {
    try {
      current = wrap(await HandLandmarker.createFromOptions(fileset, {
        ...commonOptions(delegate, MODEL_URLS.hand),
        numHands: 2
      }));
      info = { delegate, model: 'hand' };
      break;
    } catch (err) {
      lastError = err;
      console.warn(`[hands] ${delegate} unavailable:`, err?.message || err);
    }
  }
  if (!current) throw lastError || new Error('Hand landmarker could not be created');

  let closed = false;
  return {
    get info() { return { ...info, avgInferenceMs: current.avgMs }; },
    detect(video, nowMs) {
      if (closed) return null;
      const { result, inferenceMs } = current.detect(video, nowMs);
      if (!result) return null;
      const hands = (result.landmarks || []).map((landmarks, i) => ({
        landmarks,
        handedness: result.handedness?.[i]?.[0]?.categoryName || 'Unknown'
      }));
      return { hands, inferenceMs };
    },
    close() {
      closed = true;
      current.close();
    }
  };
}
