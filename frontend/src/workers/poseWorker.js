self.onmessage = async (e) => {
  const { type, imageFrame } = e.data;
  
  if (type === 'INIT') {
    // Initialize onnxruntime-web session here
    // const session = await ort.InferenceSession.create('path_to_yolo11.onnx');
    self.postMessage({ type: 'INIT_DONE' });
  } else if (type === 'PREDICT') {
    // Mock processing delay
    // In production, run inference using onnxruntime-web
    // mock keypoints representing [x, y, confidence]
    const mockKeypoints = [
      // 17 body points (standard COCO pose)
      { x: 100, y: 100, score: 0.9, name: 'nose' },
      { x: 105, y: 95, score: 0.9, name: 'left_eye' },
      { x: 95, y: 95, score: 0.9, name: 'right_eye' },
      { x: 120, y: 150, score: 0.9, name: 'left_shoulder' },
      { x: 80, y: 150, score: 0.9, name: 'right_shoulder' },
      { x: 130, y: 200, score: 0.8, name: 'left_elbow' },
      { x: 70, y: 200, score: 0.8, name: 'right_elbow' },
      { x: 120, y: 250, score: 0.9, name: 'left_wrist' },
      { x: 80, y: 250, score: 0.9, name: 'right_wrist' },
      { x: 110, y: 300, score: 0.9, name: 'left_hip' },
      { x: 90, y: 300, score: 0.9, name: 'right_hip' },
      { x: 110, y: 400, score: 0.9, name: 'left_knee' },
      { x: 90, y: 400, score: 0.9, name: 'right_knee' },
      { x: 110, y: 500, score: 0.9, name: 'left_ankle' },
      { x: 90, y: 500, score: 0.9, name: 'right_ankle' },
      
      // Equipment points (placeholder for the custom model's extra classes)
      { x: 125, y: 255, score: 0.85, name: 'dumbbell' },
      { x: 75, y: 255, score: 0.85, name: 'kettlebell' },
      { x: 0, y: 0, score: 0.1, name: 'weight_plates' } // Not detected
    ];
    
    // Randomize slightly to simulate movement
    const jittered = mockKeypoints.map(kp => ({
      ...kp,
      x: kp.x + (Math.random() - 0.5) * 5,
      y: kp.y + (Math.random() - 0.5) * 5
    }));
    
    setTimeout(() => {
      self.postMessage({ type: 'PREDICT_RESULT', keypoints: jittered });
    }, 33);
  }
};
