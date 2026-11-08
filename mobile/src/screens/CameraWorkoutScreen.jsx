import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import SkeletonOverlay from '../components/SkeletonOverlay';
import { analyzeFrame, createWorkoutSession } from '../api/workout';
import exerciseRules from '../engine/ExerciseLogic';
import { createWorkoutTracker } from '../engine/workoutTracker';

const FRAME_INTERVAL_MS = 350;

// Pick the smallest "WxH" picture size whose short side is still >= 360px:
// plenty for pose detection and a small upload. Falls back to the largest
// parseable size; returns undefined if the device reports none.
function choosePictureSize(sizes = []) {
  const parsed = sizes
    .map((s) => {
      const m = /^(\d+)x(\d+)$/.exec(s);
      return m ? { s, w: Number(m[1]), h: Number(m[2]) } : null;
    })
    .filter(Boolean);
  if (!parsed.length) return undefined;
  const bigEnough = parsed
    .filter((p) => Math.min(p.w, p.h) >= 360)
    .sort((a, b) => a.w * a.h - b.w * b.h);
  if (bigEnough.length) return bigEnough[0].s;
  return parsed.sort((a, b) => b.w * b.h - a.w * a.h)[0].s;
}

export default function CameraWorkoutScreen({ route, navigation }) {
  const { exerciseId = 'bicep_curl' } = route.params || {};
  const rule = exerciseRules[exerciseId] || exerciseRules.bicep_curl;
  const isHold = rule.type === 'hold';

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('front');
  const [cameraReady, setCameraReady] = useState(false);
  const [pictureSize, setPictureSize] = useState(undefined);
  const [reps, setReps] = useState(0);
  const [holdSeconds, setHoldSeconds] = useState(0);
  const [feedback, setFeedback] = useState({ message: 'Position yourself in frame', color: '#00E5FF' });
  const [keypoints, setKeypoints] = useState([]);
  // Keypoints come back in the captured photo's pixel space.
  const [frameSize, setFrameSize] = useState({ width: 480, height: 640 });
  const [saving, setSaving] = useState(false);

  const cameraRef = useRef(null);
  const busyRef = useRef(false);
  const trackerRef = useRef(null);
  if (trackerRef.current === null) trackerRef.current = createWorkoutTracker(rule);

  // Auto-request permission
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleCameraReady = async () => {
    setCameraReady(true);
    try {
      const sizes = await cameraRef.current?.getAvailablePictureSizesAsync();
      const chosen = choosePictureSize(sizes);
      if (chosen) setPictureSize(chosen);
    } catch {
      // Keep the default size; the backend downsizes large frames anyway.
    }
  };

  // Capture + analyse loop. Only one frame is in flight at a time (busyRef),
  // and the interval isn't torn down on every state change.
  useEffect(() => {
    if (!cameraReady) return undefined;
    let active = true;

    const interval = setInterval(async () => {
      if (!active || busyRef.current || !cameraRef.current) return;
      busyRef.current = true;
      try {
        // skipProcessing must stay false: when true, Expo ignores `quality`
        // (full-size JPEG, far over the upload limit) and skips rotation.
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.4,
          base64: true,
          skipProcessing: false,
          shutterSound: false
        });
        if (!active || !photo?.base64) return;

        const res = await analyzeFrame(exerciseId, photo.base64);
        if (!active || !res) return;

        if (photo.width && photo.height) setFrameSize({ width: photo.width, height: photo.height });
        const fb = res.feedback
          ? { message: res.feedback.message || 'Good Form', color: res.feedback.color || '#00E5FF' }
          : null;
        if (fb) setFeedback(fb);

        const tracker = trackerRef.current;
        if (res.success && Array.isArray(res.keypoints)) {
          setKeypoints(res.keypoints);
          tracker.update({
            angle: res.angle,
            measured: res.measured !== false,
            goodForm: !!fb && (fb.color === 'green' || fb.color === '#00E5FF'),
            now: Date.now()
          });
        } else {
          setKeypoints([]);
          tracker.pause(); // nobody in frame — don't credit hold time
        }
        setReps(tracker.reps);
        setHoldSeconds(tracker.holdSeconds);
      } catch (err) {
        // Drop this frame and try the next one, but leave a trace for debugging.
        console.warn('Frame analysis failed:', err?.message || err);
      } finally {
        busyRef.current = false;
      }
    }, FRAME_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [exerciseId, cameraReady]);

  const handleFinish = async () => {
    // reps (seconds for holds), deepest angle reached, avg seconds per rep
    const { reps: savedReps, maxDepthAngle, avgSpeed } = trackerRef.current.summary();
    try {
      setSaving(true);
      await createWorkoutSession({ exerciseId, reps: savedReps, maxDepthAngle, avgSpeed });
      const done = isHold ? `Held ${savedReps}s of ${rule.name}` : `Completed ${savedReps} reps of ${rule.name}`;
      Alert.alert('Workout Saved! 🎉', done, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save session');
    } finally {
      setSaving(false);
    }
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Camera access required for AI pose detection</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permBtn}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        pictureSize={pictureSize}
        onCameraReady={handleCameraReady}
      />

      {/* Overlays are siblings of CameraView (absolutely positioned), as in the Expo docs. */}
      {/* SVG pose overlay. Photos aren't mirrored but the front preview is, so flip to match. */}
      <SkeletonOverlay
        keypoints={keypoints}
        width={frameSize.width}
        height={frameSize.height}
        mirrored={facing === 'front'}
      />

      {/* Top Control Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.exerciseName}>{rule.name}</Text>
        <TouchableOpacity onPress={() => setFacing(f => f === 'front' ? 'back' : 'front')} style={styles.iconCircle}>
          <RefreshCw size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Feedback Banner */}
      <View style={[styles.feedbackBanner, { borderColor: feedback.color }]}>
        <Text style={[styles.feedbackText, { color: feedback.color }]}>{feedback.message}</Text>
      </View>

      {/* Bottom Rep / Hold Counter & Finish Action */}
      <View style={styles.bottomBar}>
        <View style={styles.repBox}>
          <Text style={styles.repVal}>{isHold ? `${Math.floor(holdSeconds)}s` : reps}</Text>
          <Text style={styles.repLabel}>{isHold ? 'HOLD' : 'REPS'}</Text>
        </View>
        <TouchableOpacity onPress={handleFinish} disabled={saving} style={styles.finishBtn}>
          {saving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.finishText}>Finish Workout</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#0A0A0C', justifyContent: 'center', alignItems: 'center', padding: 20 },
  permText: { color: '#FFF', fontSize: 16, textAlign: 'center', marginBottom: 16 },
  permBtn: { backgroundColor: '#00E5FF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  permBtnText: { color: '#000', fontWeight: '800' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  exerciseName: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  feedbackBanner: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  feedbackText: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  repBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderColor: '#00E5FF',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center'
  },
  repVal: { color: '#00E5FF', fontSize: 32, fontWeight: '900' },
  repLabel: { color: '#9CA3AF', fontSize: 10, fontWeight: '700' },
  finishBtn: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16
  },
  finishText: { color: '#000', fontSize: 16, fontWeight: '900' }
});
