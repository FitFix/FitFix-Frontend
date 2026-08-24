import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

const COCO_CONNECTIONS = [
  ['left_ear', 'left_eye'], ['right_ear', 'right_eye'], ['left_eye', 'nose'], ['right_eye', 'nose'],
  ['left_shoulder', 'right_shoulder'], ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'], ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'], ['left_hip', 'right_hip'], ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'], ['right_hip', 'right_knee'], ['right_knee', 'right_ankle']
];

export default function SkeletonOverlay({ keypoints = [], width, height }) {
  if (!keypoints || keypoints.length === 0) return null;

  const kpMap = {};
  keypoints.forEach((kp) => {
    if (kp.name && kp.score > 0.3) {
      kpMap[kp.name] = kp;
    }
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg height="100%" width="100%" viewBox={`0 0 ${width || 640} ${height || 480}`}>
        {/* Draw Bones */}
        {COCO_CONNECTIONS.map(([p1, p2], idx) => {
          const k1 = kpMap[p1];
          const k2 = kpMap[p2];
          if (!k1 || !k2) return null;
          return (
            <Line
              key={idx}
              x1={k1.x}
              y1={k1.y}
              x2={k2.x}
              y2={k2.y}
              stroke="#00E5FF"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}

        {/* Draw Keypoint Joints */}
        {keypoints.map((kp, idx) => {
          if (!kp.x || !kp.y || (kp.score != null && kp.score < 0.3)) return null;
          return (
            <Circle
              key={idx}
              cx={kp.x}
              cy={kp.y}
              r="5"
              fill="#00E5FF"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          );
        })}
      </Svg>
    </View>
  );
}
