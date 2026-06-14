import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { exerciseRules } from '../engine/ExerciseLogic';
import { X, Camera, Video, VideoOff } from 'lucide-react';

export default function AIVisionContainer() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [exercise] = useState(exerciseRules[exerciseId]);
  const [reps, setReps] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [formStatus, setFormStatus] = useState({ message: 'Click "Start Camera" to begin', color: 'gray' });
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [repState, setRepState] = useState('down');

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.45); // highly optimized payload size
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setFormStatus({ message: 'Position yourself in frame', color: '#00E5FF' });
    } catch (err) {
      console.error("Camera access denied or error", err);
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
    setIsCameraActive(false);
    setFormStatus({ message: 'Camera stopped', color: 'gray' });
  };

  const drawSkeleton = useCallback((keypoints) => {
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
        ctx.moveTo(p1.x * 2, p1.y * 2); // Scale up coordinates from 320x240 to 640x480
        ctx.lineTo(p2.x * 2, p2.y * 2);
        ctx.stroke();
      }
    });

    keypoints.forEach(kp => {
      if (kp.score > 0.3) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(kp.x * 2, kp.y * 2, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, []);

  const processKeypoints = useCallback((keypoints, angle, feedback) => {
    setCurrentAngle(angle);
    setFormStatus(feedback);

    if (exercise && exercise.thresholds) {
      const { min, max } = exercise.thresholds;
      setRepState(currentRepState => {
        if (angle < min + 20 && currentRepState === 'down') {
          return 'up';
        } else if (angle > max - 20 && currentRepState === 'up') {
          setReps(r => r + 1);
          return 'down';
        }
        return currentRepState;
      });
    }
  }, [exercise]);

  useEffect(() => {
    if (!exercise) {
      navigate('/exercises');
      return;
    }

    let active = true;

    const runInferenceLoop = async () => {
      if (!active || !isCameraActive) return;

      const frame = captureFrame();
      if (frame) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:5000/api/ai/exercises/${exerciseId}/analyze`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ image: frame })
          });

          if (res.ok && active && isCameraActive) {
            const data = await res.json();
            if (data.success && data.keypoints) {
              processKeypoints(data.keypoints, data.angle, data.feedback);
              if (showSkeleton) drawSkeleton(data.keypoints);
            } else {
              setFormStatus(data.feedback || { message: 'Position yourself in frame', color: 'yellow' });
            }
          }
        } catch (err) {
          console.error("Inference loop error:", err);
        }
      }

      // Schedule next frame immediately (no setTimeout delay) for max real-time FPS
      if (active && isCameraActive) {
        requestAnimationFrame(runInferenceLoop);
      }
    };

    if (isCameraActive) {
      runInferenceLoop();
    }

    return () => {
      active = false;
    };
  }, [exercise, exerciseId, navigate, isCameraActive, showSkeleton, processKeypoints, drawSkeleton]);

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

      const res = await fetch('http://localhost:5000/api/workouts/sessions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          exerciseId,
          reps,
          maxDepthAngle: currentAngle,
          avgSpeed: 1.0
        })
      });

      if (res.ok) {
        navigate('/dashboard');
      } else {
        console.error('Failed to save workout session');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error saving session:', err);
      navigate('/dashboard');
    }
  };



  if (!exercise) return null;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex justify-center">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className={`absolute inset-0 w-full h-full object-cover opacity-80 ${!isCameraActive ? 'hidden' : ''}`}
      />
      
      {!isCameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d] p-4 text-center z-0">
          <div className="w-24 h-24 rounded-full bg-accent/5 flex items-center justify-center mb-6 border border-accent/20">
            <Video size={48} className="text-accent animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Camera Access Required</h3>
          <p className="text-gray-400 max-w-sm mb-8">
            Click the button below to start the webcam stream and initiate the real-time YOLO pose estimator.
          </p>
          <button 
            onClick={startCamera}
            className="px-8 py-4 bg-accent text-black font-black rounded-2xl glow-accent-hover hover:scale-105 transition-all text-lg shadow-[0_0_20px_rgba(0,229,255,0.3)]"
          >
            Start Camera
          </button>
        </div>
      )}
      
      <canvas 
        ref={canvasRef} 
        width={640} 
        height={480} 
        className={`absolute inset-0 w-full h-full object-cover ${(!showSkeleton || !isCameraActive) && 'hidden'}`}
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
        <h2 className="text-xl font-bold tracking-wider">{exercise.name}</h2>
        
        <div className="flex gap-2">
          {isCameraActive && (
            <>
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

          <button 
            onClick={handleFinishWorkout}
            className="mt-4 w-full py-3 bg-accent text-black font-bold rounded-2xl hover:bg-accent/90 transition-all text-center"
          >
            Finish & Save Session
          </button>
        </div>
      )}
    </div>
  );
}
