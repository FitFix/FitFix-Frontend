import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { exerciseRules } from '../engine/ExerciseLogic';
import { calculateAngle } from '../engine/RepCounterEngine';
import { Activity, X, Camera } from 'lucide-react';

export default function AIVisionContainer() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const workerRef = useRef(null);
  
  const [exercise] = useState(exerciseRules[exerciseId]);
  const [reps, setReps] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [formStatus, setFormStatus] = useState({ message: 'Initializing...', color: 'gray' });
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const [repState, setRepState] = useState('down');

  useEffect(() => {
    if (!exercise) {
      navigate('/exercises');
      return;
    }

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied or error", err);
        setFormStatus({ message: 'Camera access required', color: 'red' });
      }
    };

    workerRef.current = new Worker(new URL('../workers/poseWorker.js', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = (e) => {
      const { type, keypoints } = e.data;
      if (type === 'INIT_DONE') {
        setIsReady(true);
        setFormStatus({ message: 'Ready', color: '#00E5FF' });
      } else if (type === 'PREDICT_RESULT') {
        processKeypoints(keypoints);
        if (showSkeleton) drawSkeleton(keypoints);
        
        requestAnimationFrame(() => {
          if (workerRef.current && isReady) {
            workerRef.current.postMessage({ type: 'PREDICT' });
          }
        });
      }
    };

    initCamera();
    workerRef.current.postMessage({ type: 'INIT' });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [exerciseId]);

  useEffect(() => {
    if (isReady && videoRef.current) {
      videoRef.current.onloadeddata = () => {
        workerRef.current.postMessage({ type: 'PREDICT' });
      };
    }
  }, [isReady]);

  const processKeypoints = (keypoints) => {
    const findPoint = (name) => keypoints.find(k => k.name === name);
    
    let a, b, c;
    if (exerciseId === 'bicep_curl') {
      a = findPoint('left_shoulder');
      b = findPoint('left_elbow');
      c = findPoint('left_wrist');
    } else if (exerciseId === 'squat') {
      a = findPoint('left_hip');
      b = findPoint('left_knee');
      c = findPoint('left_ankle');
    }

    if (a && b && c && a.score > 0.5 && b.score > 0.5 && c.score > 0.5) {
      const angle = calculateAngle(a, b, c);
      setCurrentAngle(Math.round(angle));
      
      const status = exercise.formCorrection(angle);
      setFormStatus(status);

      const { min, max } = exercise.thresholds;
      if (angle < min + 20 && repState === 'down') {
        setRepState('up');
      } else if (angle > max - 20 && repState === 'up') {
        setReps(r => r + 1);
        setRepState('down');
      }
    } else {
      setFormStatus({ message: 'Position yourself in frame', color: 'yellow' });
    }
  };

  const drawSkeleton = (keypoints) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const connections = [
      ['left_shoulder', 'right_shoulder'], ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'], ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'], ['left_hip', 'right_hip'], ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'], ['right_hip', 'right_knee'], ['right_knee', 'right_ankle']
    ];

    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 4;

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

    keypoints.forEach(kp => {
      if (kp.score > 0.3) {
        ctx.fillStyle = kp.name.includes('bell') || kp.name.includes('plates') ? '#FF00FF' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  if (!exercise) return null;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex justify-center">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      
      <canvas 
        ref={canvasRef} 
        width={640} 
        height={480} 
        className={`absolute inset-0 w-full h-full object-cover ${!showSkeleton && 'hidden'}`}
      />

      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
        <button onClick={() => navigate('/exercises')} className="p-2 bg-gray-900/60 rounded-full text-white backdrop-blur-md">
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold tracking-wider">{exercise.name}</h2>
        <button 
          onClick={() => setShowSkeleton(!showSkeleton)} 
          className={`p-2 rounded-full backdrop-blur-md transition-colors ${showSkeleton ? 'bg-accent/80 text-black' : 'bg-gray-900/60 text-white'}`}
        >
          <Camera size={24} />
        </button>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-black/60 backdrop-blur-lg border border-gray-700 p-6 rounded-3xl z-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-800/50 rounded-2xl">
            <p className="text-gray-400 text-sm font-medium mb-1">REPS</p>
            <p className="text-5xl font-bold text-white">{reps}</p>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-2xl">
            <p className="text-gray-400 text-sm font-medium mb-1">ANGLE</p>
            <p className="text-5xl font-bold text-accent">{currentAngle}°</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 rounded-2xl text-center font-bold text-lg border border-gray-700 shadow-inner" style={{ backgroundColor: `${formStatus.color}20`, color: formStatus.color, borderColor: formStatus.color }}>
          {formStatus.message}
        </div>
      </div>
    </div>
  );
}
