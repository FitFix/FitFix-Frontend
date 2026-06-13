import base64
import io
import os
import sys

# Try to import ultralytics, fastapi, and other requirements
try:
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel
    from PIL import Image
    import numpy as np
    HAS_DEPS = True
except ImportError:
    HAS_DEPS = False

try:
    from ultralytics import YOLO
    HAS_ULTRALYTICS = True
except ImportError:
    HAS_ULTRALYTICS = False

# Setup FastAPI App if dependencies exist
if HAS_DEPS:
    app = FastAPI(title="FitFix YOLO Pose Service")
else:
    app = None

model_path = os.path.join(os.path.dirname(__file__), "best (20).pt")
model = None

if HAS_DEPS and HAS_ULTRALYTICS:
    if os.path.exists(model_path):
        try:
            model = YOLO(model_path)
            print(f"YOLO model loaded successfully from {model_path}")
        except Exception as e:
            print(f"Error loading YOLO model: {e}")
    else:
        print(f"YOLO model file not found at {model_path}")
else:
    print("Warning: Missing python dependencies. Run 'pip install ultralytics fastapi uvicorn Pillow numpy' to enable the real YOLO service.")

COCO_NAMES = [
    'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
    'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
    'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
    'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
]

if HAS_DEPS:
    class ImagePayload(BaseModel):
        image: str  # Base64 encoded image string

    @app.post("/predict")
    async def predict(payload: ImagePayload):
        if not HAS_ULTRALYTICS or model is None:
            raise HTTPException(status_code=503, detail="YOLO Model is not loaded or ultralytics is missing")
        
        try:
            # Handle base64 decoding
            encoded = payload.image
            if "," in encoded:
                encoded = encoded.split(",", 1)[1]
            
            image_bytes = base64.b64decode(encoded)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Perform Pose Estimation
            results = model(image, imgsz=320, verbose=False)
            
            if not results or len(results) == 0 or results[0].keypoints is None:
                return {"keypoints": []}
            
            kp_data = results[0].keypoints
            xy = kp_data.xy.cpu().numpy()
            conf = kp_data.conf.cpu().numpy() if kp_data.conf is not None else np.ones((xy.shape[0], xy.shape[1]))
            
            if len(xy) == 0:
                return {"keypoints": []}
            
            person_xy = xy[0]
            person_conf = conf[0]
            
            output_kps = []
            for i in range(min(len(person_xy), len(COCO_NAMES))):
                output_kps.append({
                    "x": float(person_xy[i][0]),
                    "y": float(person_xy[i][1]),
                    "score": float(person_conf[i]),
                    "name": COCO_NAMES[i]
                })
            
            return {"keypoints": output_kps}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    if not HAS_DEPS:
        print("Cannot start server: missing dependencies. Please run:")
        print("pip install ultralytics fastapi uvicorn Pillow numpy")
        sys.exit(1)
        
    import uvicorn
    print("Starting YOLO Service on http://127.0.0.1:5001")
    uvicorn.run(app, host="127.0.0.1", port=5001)
