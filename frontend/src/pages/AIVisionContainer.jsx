import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import exerciseRules from '../engine/ExerciseLogic';
import { createWorkoutTracker } from '../engine/workoutTracker';
import { createPoseTracker, createHandTracker } from '../vision/poseTracker';
import { measureExercise } from '../vision/poseMath';
import { OneEuroFilter } from '../vision/oneEuroFilter';
import { prepareCanvas, drawPose, drawHands } from '../vision/drawLandmarks';
import { X, Camera, Video, VideoOff, Cpu, Cloud, SwitchCamera } from 'lucide-react';
import { API_BASE_URL } from '../config';

// Cloud fallback frames are sent at this width; height follows the camera's aspect ratio.
const CAPTURE_WIDTH = 320;
// The tracking loop runs every camera frame; React state (text on screen) is
// refreshed at most this often so rendering never slows tracking down.
const UI_UPDATE_MS = 100;

const isGoodForm = (fb) => !!fb && (fb.color === 'green' || fb.color === '#00E5FF');
const sameStatus = (a, b) => !!a && !!b && a.message === b.message && a.color === b.color;

export default function AIVisionContainer() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const captureCanvasRef = useRef(null);
  // Size (px) of the last frame sent to the cloud — its keypoints come back in this space.
  const frameSizeRef = useRef({ width: CAPTURE_WIDTH, height: 240 });

  const [exercise] = useState(exerciseRules[exerciseId]);
  const isHold = !!exercise && exercise.type === 'hold';
  const isHands = !!exercise && exercise.type === 'detect';

  const trackerRef = useRef(null);
  if (trackerRef.current === null) trackerRef.current = createWorkoutTracker(exercise);
  const visionRef = useRef(null); // on-device landmarker
  const showSkeletonRef = useRef(true);

  const [reps, setReps] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [formStatus, setFormStatus] = useState({ message: 'Click "Start Camera" to begin', color: 'gray' });
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  // 'user' = front (selfie) camera, 'environment' = rear camera (sharper; for a propped-up phone)
  const [facing, setFacing] = useState('user');
  const [holdSeconds, setHoldSeconds] = useState(0);
  // 'loading' → model downloading; 'ready' → on-device tracking; 'cloud' → server fallback
  const [engineStatus, setEngineStatus] = useState('loading');
  const [engineInfo, setEngineInfo] = useState(null);
  const [perf, setPerf] = useState({ fps: 0, inferenceMs: 0 });

  useEffect(() => {
    if (!exercise) navigate('/exercises');
  }, [exercise, navigate]);

  // Start loading the on-device model as soon as the page opens, so it's
  // usually ready by the time the camera is. Falls back to cloud analysis if
  // the browser can't run it (no WebAssembly/WebGL, blocked download, ...).
  useEffect(() => {
    if (!exercise) return undefined;
    let cancelled = false;
    const create = exercise.type === 'detect' ? createHandTracker : createPoseTracker;
    create({ onInfoChange: (info) => { if (!cancelled) setEngineInfo(info); } })
      .then((tracker) => {
        if (cancelled) { tracker.close(); return; }
        visionRef.current = tracker;
        setEngineInfo(tracker.info);
        setEngineStatus('ready');
      })
      .catch((err) => {
        console.warn('[vision] on-device tracking unavailable, using cloud analysis:', err?.message || err);
        if (!cancelled) setEngineStatus('cloud');
      });
    return () => {
      cancelled = true;
      if (visionRef.current) {
        visionRef.current.close();
        visionRef.current = null;
      }
    };
  }, [exercise]);

  useEffect(() => {
    showSkeletonRef.current = showSkeleton;
    if (!showSkeleton && canvasRef.current) {
      const c = canvasRef.current;
      c.getContext('2d').clearRect(0, 0, c.width, c.height);
    }
  }, [showSkeleton]);

  const startCamera = async (facingMode = facing) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
      });
      const switching = !!streamRef.current; // flipping front/rear while already running
      if (switching) streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      // Only on first start: when switching, the tracking loop keeps the live
      // message current (overwriting it here would leave a stale prompt).
      if (!switching) setFormStatus({ message: 'Position yourself in frame', color: '#00E5FF' });
    } catch (err) {
      console.error('Camera access denied or error', err);
      setFormStatus({ message: 'Camera access required', color: 'red' });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const c = canvasRef.current;
      c.getContext('2d').clearRect(0, 0, c.width, c.height);
    }
    setIsCameraActive(false);
    trackerRef.current.pause(); // so the paused gap isn't counted as hold time
    setFormStatus({ message: 'Camera stopped', color: 'gray' });
  };

  const switchCamera = () => {
    const next = facing === 'user' ? 'environment' : 'user';
    setFacing(next);
    trackerRef.current.pause(); // the scene changes; don't credit hold time across it
    startCamera(next);
  };

  // Phones: keep the screen awake while the camera runs (otherwise it locks
  // mid-set), and pause tracking when the user switches away so time away
  // isn't counted. The wake lock is released whenever the page is hidden, so
  // it's re-requested when the user comes back.
  useEffect(() => {
    if (!isCameraActive) return undefined;
    let lock = null;
    let released = false;
    const requestLock = async () => {
      if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
      try {
        lock = await navigator.wakeLock.request('screen');
        if (released) lock.release().catch(() => {});
      } catch {
        // Not allowed (e.g. battery saver) — the workout still works.
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') requestLock();
      else trackerRef.current.pause();
    };
    requestLock();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisibility);
      if (lock) lock.release().catch(() => {});
    };
  }, [isCameraActive]);

  /* ------------------------------------------------------------------
   * On-device tracking loop: one inference per NEW camera frame.
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (!exercise || !isCameraActive || engineStatus !== 'ready') return undefined;
    const video = videoRef.current;
    if (!video) return undefined;

    const workout = trackerRef.current;
    // Smooths the angle: steady when holding still, near-zero lag when moving fast.
    const filter = new OneEuroFilter({ minCutoff: 1.5, beta: 0.02 });
    const useFrameCallback = typeof video.requestVideoFrameCallback === 'function';
    let stopped = false;
    let handle = null;
    let lastVideoTime = -1;
    let side = null;
    let lastUi = 0;
    let lastReps = -1;
    let lastStatus = null;
    let fpsFrames = 0;
    let fpsSince = performance.now();
    let fps = 0;

    const pushUi = (now, angle, feedback) => {
      // Rep count updates immediately so the counter never feels late.
      if (workout.reps !== lastReps) { lastReps = workout.reps; setReps(workout.reps); }
      if (now - lastUi < UI_UPDATE_MS) return;
      lastUi = now;
      setCurrentAngle(angle);
      if (!sameStatus(feedback, lastStatus)) { lastStatus = feedback; setFormStatus(feedback); }
      setHoldSeconds(workout.holdSeconds);
      const info = visionRef.current ? visionRef.current.info : null;
      setPerf({ fps, inferenceMs: info ? Math.round(info.avgInferenceMs) : 0 });
    };

    const processFrame = (now) => {
      const vision = visionRef.current;
      if (!vision) return;
      const out = vision.detect(video, now);

      fpsFrames += 1;
      if (now - fpsSince >= 1000) {
        fps = Math.round((fpsFrames * 1000) / (now - fpsSince));
        fpsFrames = 0;
        fpsSince = now;
      }
      const ctx = showSkeletonRef.current ? prepareCanvas(canvasRef.current, video.videoWidth, video.videoHeight) : null;

      if (exercise.type === 'detect') {
        const hands = out ? out.hands : [];
        if (ctx) drawHands(ctx, hands);
        pushUi(now, hands.length, exercise.formCorrection(hands.length));
        return;
      }

      if (!out || !out.landmarks) {
        workout.pause();
        filter.reset();
        pushUi(now, 0, { message: 'Position yourself in frame', color: 'yellow' });
        return;
      }

      const pose = {
        image: out.landmarks,
        world: out.worldLandmarks,
        aspect: video.videoWidth / video.videoHeight
      };
      const m = measureExercise(exercise, pose, side);
      if (m.side !== side) { side = m.side; filter.reset(); }

      let angle = 0;
      let feedback;
      if (m.measured) {
        angle = Math.round(filter.filter(m.angle, now));
        feedback = exercise.formCorrection(angle, m.ctx);
      } else {
        filter.reset();
        feedback = { message: 'Align joints with camera', color: 'yellow' };
      }
      workout.update({ angle, measured: m.measured, goodForm: isGoodForm(feedback), now });
      if (ctx) drawPose(ctx, out.landmarks, exercise.targetJoints.map((j) => `${m.side}_${j}`));
      pushUi(now, angle, feedback);
    };

    const onFrame = () => {
      if (stopped) return;
      // Only process frames the camera actually delivered (no duplicate work).
      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        processFrame(performance.now());
      }
      handle = useFrameCallback ? video.requestVideoFrameCallback(onFrame) : requestAnimationFrame(onFrame);
    };
    handle = useFrameCallback ? video.requestVideoFrameCallback(onFrame) : requestAnimationFrame(onFrame);

    return () => {
      stopped = true;
      if (handle != null) {
        if (useFrameCallback) video.cancelVideoFrameCallback(handle);
        else cancelAnimationFrame(handle);
      }
      workout.pause();
    };
  }, [exercise, isCameraActive, engineStatus]);

  /* ------------------------------------------------------------------
   * Cloud fallback: send downscaled frames to the backend (old pipeline).
   * Only used when the browser can't run the on-device model.
   * ------------------------------------------------------------------ */
  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null;
    // Keep the camera's real aspect ratio so angles aren't distorted.
    const width = CAPTURE_WIDTH;
    const height = Math.round((CAPTURE_WIDTH * video.videoHeight) / video.videoWidth);
    if (!captureCanvasRef.current) captureCanvasRef.current = document.createElement('canvas');
    const canvas = captureCanvasRef.current;
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(video, 0, 0, width, height);
    frameSizeRef.current = { width, height };
    return canvas.toDataURL('image/jpeg', 0.45);
  };

  const drawCloudPose = useCallback((keypoints) => {
    const { width, height } = frameSizeRef.current;
    const ctx = prepareCanvas(canvasRef.current, width, height);
    if (!ctx) return;
    const connections = [
      ['left_shoulder', 'right_shoulder'], ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'], ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'], ['left_hip', 'right_hip'], ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'], ['right_hip', 'right_knee'], ['right_knee', 'right_ankle']
    ];
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    connections.forEach(([p1Name, p2Name]) => {
      const p1 = keypoints.find(k => k.name === p1Name);
      const p2 = keypoints.find(k => k.name === p2Name);
      if (p1 && p2 && p1.score > 0.3 && p2.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });
    ctx.fillStyle = '#FFFFFF';
    keypoints.forEach(kp => {
      if (kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, []);

  useEffect(() => {
    if (!exercise || !isCameraActive || engineStatus !== 'cloud') return undefined;
    let active = true;
    const workout = trackerRef.current;

    const runCloudLoop = async () => {
      if (!active) return;
      const frame = captureFrame();
      if (frame) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE_URL}/api/ai/exercises/${exerciseId}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ image: frame })
          });
          if (res.ok && active) {
            const data = await res.json();
            if (exercise.type === 'detect') {
              setCurrentAngle(data.count);
              setFormStatus(data.feedback);
              if (showSkeletonRef.current) {
                const { width, height } = frameSizeRef.current;
                const ctx = prepareCanvas(canvasRef.current, width, height);
                drawHands(ctx, data.hands || []);
              }
            } else if (data.success && data.keypoints) {
              setCurrentAngle(data.angle);
              setFormStatus(data.feedback);
              workout.update({
                angle: data.angle,
                measured: data.measured !== false,
                goodForm: isGoodForm(data.feedback),
                now: performance.now()
              });
              setReps(workout.reps);
              setHoldSeconds(workout.holdSeconds);
              if (showSkeletonRef.current) drawCloudPose(data.keypoints);
            } else {
              workout.pause(); // nobody in frame — don't credit hold time
              setFormStatus(data.feedback || { message: 'Position yourself in frame', color: 'yellow' });
            }
          }
        } catch (err) {
          console.error('Cloud analysis error:', err);
        }
      }
      if (active) requestAnimationFrame(runCloudLoop);
    };
    requestAnimationFrame(runCloudLoop);

    return () => {
      active = false;
    };
  }, [exercise, exerciseId, isCameraActive, engineStatus, drawCloudPose]);

  // Clean up camera stream tracks ONLY on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFinishWorkout = async () => {
    stopCamera();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // reps (seconds for holds), deepest angle reached, avg seconds per rep
      const { reps: savedReps, maxDepthAngle, avgSpeed } = trackerRef.current.summary();
      const res = await fetch(`${API_BASE_URL}/api/workouts/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ exerciseId, reps: savedReps, maxDepthAngle, avgSpeed })
      });

      if (!res.ok) console.error('Failed to save workout session');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving session:', err);
      navigate('/dashboard');
    }
  };

  if (!exercise) return null;

  const shownStatus = isCameraActive && engineStatus === 'loading'
    ? { message: 'Loading AI model…', color: '#00E5FF' }
    : formStatus;

  // Mirror only the front camera (selfie view); the rear camera shows the scene as-is.
  const mirror = facing === 'user' ? 'scaleX(-1)' : 'none';

  const engineLabel = engineStatus === 'ready' && engineInfo
    ? `On-device · ${engineInfo.delegate}${engineInfo.model === 'hand' ? '' : ` · ${engineInfo.model} model`}`
    : engineStatus === 'cloud'
      ? 'Cloud analysis'
      : 'Loading AI model…';

  return (
    // h-dvh: on phones, 100vh is taller than the visible area when the browser
    // toolbar is showing, which would push the stats panel off-screen.
    <div className="relative w-full h-dvh bg-black overflow-hidden flex justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ transform: mirror }}
        className={`absolute inset-0 w-full h-full object-cover opacity-80 ${!isCameraActive ? 'hidden' : ''}`}
      />

      {!isCameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d] p-4 text-center z-0">
          <div className="w-24 h-24 rounded-full bg-accent/5 flex items-center justify-center mb-6 border border-accent/20">
            <Video size={48} className="text-accent animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Camera Access Required</h3>
          <p className="text-gray-400 max-w-sm mb-8">
            Start the camera for real-time pose tracking. Tracking runs on your device — your video never leaves it.
          </p>
          <button
            onClick={() => startCamera()}
            className="px-8 py-4 bg-accent text-black font-black rounded-2xl glow-accent-hover hover:scale-105 transition-all text-lg shadow-[0_0_20px_rgba(0,229,255,0.3)]"
          >
            Start Camera
          </button>
          <p className="text-xs text-gray-500 mt-4">{engineLabel}</p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={CAPTURE_WIDTH}
        height={240}
        style={{ transform: mirror }}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${(!showSkeleton || !isCameraActive) && 'hidden'}`}
      />

      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-linear-to-b from-black/80 to-transparent z-10">
        <button
          onClick={() => {
            stopCamera();
            navigate('/exercises');
          }}
          className="p-2 bg-gray-900/60 rounded-full text-white backdrop-blur-md"
        >
          <X size={24} />
        </button>
        <h2 className="text-lg sm:text-xl font-bold tracking-wider truncate px-2">{exercise.name}</h2>

        <div className="flex gap-2">
          {isCameraActive && (
            <>
              <button
                onClick={switchCamera}
                className="p-2 bg-gray-900/60 rounded-full text-white backdrop-blur-md"
                title="Switch front / rear camera"
                aria-label="Switch front or rear camera"
              >
                <SwitchCamera size={24} />
              </button>
              <button
                onClick={() => setShowSkeleton(!showSkeleton)}
                className={`p-2 rounded-full backdrop-blur-md transition-colors ${showSkeleton ? 'bg-accent/80 text-black' : 'bg-gray-900/60 text-white'}`}
                title="Toggle Skeleton Overlay"
              >
                <Camera size={24} />
              </button>
              <button
                onClick={stopCamera}
                className="p-2 bg-red-600/80 rounded-full text-white backdrop-blur-md hover:bg-red-700 transition-colors"
                title="Turn Camera Off"
              >
                <VideoOff size={24} />
              </button>
            </>
          )}
        </div>
      </div>

      {isCameraActive && (
        // Own row under the top bar so it never squeezes the title on a phone.
        <p
          className="absolute top-[4.5rem] left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 whitespace-nowrap text-[11px] text-gray-300 bg-black/50 px-2 py-0.5 rounded-full tabular-nums"
          title="Where pose tracking runs and how fast"
        >
          {engineStatus === 'cloud' ? <Cloud size={12} /> : <Cpu size={12} />}
          {engineLabel}
          {engineStatus === 'ready' && perf.fps > 0 && ` · ${perf.inferenceMs} ms · ${perf.fps} fps`}
        </p>
      )}

      {isCameraActive && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 sm:w-72 bg-black/75 backdrop-blur-md border border-gray-800 p-4 rounded-2xl z-10 flex flex-col gap-3">
          <div className="flex gap-2">
            {isHold ? (
              <div className="flex-1 text-center p-2 bg-gray-900/50 rounded-xl border border-gray-800">
                <p className="text-gray-400 text-xs font-semibold mb-0.5">HOLD</p>
                <p className="text-3xl font-black text-white">{Math.floor(holdSeconds)}<span className="text-lg">s</span></p>
              </div>
            ) : !isHands ? (
              <div className="flex-1 text-center p-2 bg-gray-900/50 rounded-xl border border-gray-800">
                <p className="text-gray-400 text-xs font-semibold mb-0.5">REPS</p>
                <p className="text-3xl font-black text-white">{reps}</p>
              </div>
            ) : null}
            <div className="flex-1 text-center p-2 bg-gray-900/50 rounded-xl border border-gray-800">
              <p className="text-gray-400 text-xs font-semibold mb-0.5">{isHands ? 'HANDS' : 'ANGLE'}</p>
              <p className="text-3xl font-black text-accent">{currentAngle}{isHands ? '' : '°'}</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl text-center font-bold text-sm border shadow-inner" style={{ backgroundColor: `${shownStatus.color}15`, color: shownStatus.color, borderColor: `${shownStatus.color}40` }}>
            {shownStatus.message}
          </div>

          <button
            onClick={handleFinishWorkout}
            className="w-full py-2.5 bg-accent hover:bg-accent/90 text-black font-extrabold rounded-xl transition-all text-sm text-center shadow-lg shadow-accent/10 hover:scale-[1.02]"
          >
            Finish & Save Session
          </button>
        </div>
      )}
    </div>
  );
}
