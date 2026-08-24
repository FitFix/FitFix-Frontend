import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import SkeletonOverlay from '../components/SkeletonOverlay';
import { analyzeFrame, createWorkoutSession } from '../api/workout';
import exerciseRules from '../engine/ExerciseLogic';

export default function CameraWorkoutScreen({ route, navigation }) {
  const { exerciseId = 'bicep_curl' } = route.params || {};
  const rule = exerciseRules[exerciseId] || exerciseRules.bicep_curl;

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('front');
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState({ message: 'Position yourself in frame', color: '#00E5FF' });
  const [keypoints, setKeypoints] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saving, setSaving] = useState(false);

  const cameraRef = useRef(null);

  // Auto-request permission
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  // Frame Capture Interval (~350ms per snapshot to Render gRPC backend)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (cameraRef.current && !isProcessing) {
        try {
          setIsProcessing(true);
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.4,
            base64: true,
            skipProcessing: true
          });

          if (photo?.base64) {
            const res = await analyzeFrame(exerciseId, photo.base64);
            if (res) {
              if (res.reps != null) setReps(res.reps);
              if (res.keypoints) setKeypoints(res.keypoints);
              if (res.feedback) {
                setFeedback({
                  message: res.feedback.message || 'Good Form',
                  color: res.feedback.color || '#00E5FF'
                });
              }
            }
          }
        } catch (err) {
          // Silent frame drop to avoid crashing loop
        } finally {
          setIsProcessing(false);
        }
      }
    }, 350);

    return () => clearInterval(interval);
  }, [exerciseId, isProcessing]);

  const handleFinish = async () => {
    try {
      setSaving(true);
      await createWorkoutSession({
        exerciseId,
        reps,
        maxDepthAngle: 90,
        avgSpeed: 1.2
      });
      Alert.alert('Workout Saved! 🎉', `Completed ${reps} reps of ${rule.name}`, [
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
      >
        {/* SVG Pose Overlay */}
        <SkeletonOverlay keypoints={keypoints} width={640} height={480} />

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

        {/* Bottom Rep Counter & Finish Action */}
        <View style={styles.bottomBar}>
          <View style={styles.repBox}>
            <Text style={styles.repVal}>{reps}</Text>
            <Text style={styles.repLabel}>REPS</Text>
          </View>
          <TouchableOpacity onPress={handleFinish} disabled={saving} style={styles.finishBtn}>
            {saving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.finishText}>Finish Workout</Text>
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
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
