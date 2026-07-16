import base64
import io
import os
import sys
import grpc
from concurrent import futures
from PIL import Image
import numpy as np

# Try to import ultralytics
try:
    from ultralytics import YOLO
    HAS_ULTRALYTICS = True
except ImportError:
    HAS_ULTRALYTICS = False

# Try to import mediapipe
try:
    import mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
    HAS_MEDIAPIPE = True
except ImportError:
    HAS_MEDIAPIPE = False

# Import generated gRPC stubs
try:
    import yolo_pb2
    import yolo_pb2_grpc
except ImportError:
    print("Error: Could not import generated gRPC stubs. Please compile yolo.proto first.")
    sys.exit(1)

model_path = os.path.join(os.path.dirname(__file__), "best (20).pt")
model = None

if HAS_ULTRALYTICS:
    if os.path.exists(model_path):
        try:
            model = YOLO(model_path)
            print(f"YOLO model loaded successfully from {model_path}")
        except Exception as e:
            print(f"Error loading YOLO model: {e}")
    else:
        print(f"YOLO model file not found at {model_path}")
else:
    print("Warning: Missing python dependency ultralytics. Please install it.")

# Initialize MediaPipe Hand Landmarker
model_path_hand = os.path.join(os.path.dirname(__file__), "hand_landmarker.task")
landmarker = None

if HAS_MEDIAPIPE:
    if os.path.exists(model_path_hand):
        try:
            base_options = python.BaseOptions(model_asset_path=model_path_hand)
            options = vision.HandLandmarkerOptions(
                base_options=base_options,
                num_hands=2
            )
            landmarker = vision.HandLandmarker.create_from_options(options)
            print(f"MediaPipe Hand Landmarker loaded successfully from {model_path_hand}")
        except Exception as e:
            print(f"Error loading MediaPipe Hand Landmarker: {e}")
    else:
        print(f"MediaPipe Hand Landmarker task file not found at {model_path_hand}")
else:
    print("Warning: Missing python dependency mediapipe. Please install it.")

COCO_NAMES = [
    'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
    'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
    'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
    'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
]

class YoloPoseServicer(yolo_pb2_grpc.YoloPoseServicer):
    def Predict(self, request, context):
        if not HAS_ULTRALYTICS or model is None:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("YOLO Model is not loaded or ultralytics is missing")
            return yolo_pb2.PredictResponse(keypoints=[])

        try:
            # Handle base64 decoding
            encoded = request.image
            if "," in encoded:
                encoded = encoded.split(",", 1)[1]
            
            image_bytes = base64.b64decode(encoded)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Perform Pose Estimation
            results = model(image, imgsz=320, verbose=False)
            
            if not results or len(results) == 0 or results[0].keypoints is None:
                return yolo_pb2.PredictResponse(keypoints=[])
            
            kp_data = results[0].keypoints
            xy = kp_data.xy.cpu().numpy()
            conf = kp_data.conf.cpu().numpy() if kp_data.conf is not None else np.ones((xy.shape[0], xy.shape[1]))
            
            if len(xy) == 0:
                return yolo_pb2.PredictResponse(keypoints=[])
            
            person_xy = xy[0]
            person_conf = conf[0]
            
            output_kps = []
            for i in range(min(len(person_xy), len(COCO_NAMES))):
                output_kps.append(yolo_pb2.Keypoint(
                    x=float(person_xy[i][0]),
                    y=float(person_xy[i][1]),
                    score=float(person_conf[i]),
                    name=COCO_NAMES[i]
                ))
            
            return yolo_pb2.PredictResponse(keypoints=output_kps)
            
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return yolo_pb2.PredictResponse(keypoints=[])

    def DetectHands(self, request, context):
        if not HAS_MEDIAPIPE or landmarker is None:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("MediaPipe Hand Landmarker is not loaded or mediapipe is missing")
            return yolo_pb2.HandResponse(hands=[], count=0)

        try:
            # Handle base64 decoding
            encoded = request.image
            if "," in encoded:
                encoded = encoded.split(",", 1)[1]
            
            image_bytes = base64.b64decode(encoded)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert image to RGB numpy array for MediaPipe
            image_rgb = image.convert("RGB")
            image_np = np.array(image_rgb)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_np)
            
            # Perform Hand Detection
            detection_result = landmarker.detect(mp_image)
            
            hands_list = []
            count = 0
            
            if detection_result and detection_result.hand_landmarks:
                count = len(detection_result.hand_landmarks)
                for i, landmarks in enumerate(detection_result.hand_landmarks):
                    landmarks_proto = []
                    for lm in landmarks:
                        landmarks_proto.append(yolo_pb2.Landmark(
                            x=float(lm.x),
                            y=float(lm.y),
                            z=float(lm.z)
                        ))
                    
                    handedness = "Unknown"
                    score = 0.0
                    if detection_result.handedness and i < len(detection_result.handedness):
                        handedness = detection_result.handedness[i][0].category_name
                        score = float(detection_result.handedness[i][0].score)
                    
                    hands_list.append(yolo_pb2.Hand(
                        landmarks=landmarks_proto,
                        handedness=handedness,
                        score=score
                    ))
            
            return yolo_pb2.HandResponse(hands=hands_list, count=count)
            
        except Exception as e:
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return yolo_pb2.HandResponse(hands=[], count=0)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=4))
    yolo_pb2_grpc.add_YoloPoseServicer_to_server(YoloPoseServicer(), server)
    server.add_insecure_port('127.0.0.1:5001')
    print("Starting YOLO and MediaPipe gRPC Service on 127.0.0.1:5001")
    server.start()
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == "__main__":
    serve()
