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

# Initialize MediaPipe Pose Landmarker
model_path_pose = os.path.join(os.path.dirname(__file__), "pose_landmarker_lite.task")
pose_landmarker = None

if HAS_MEDIAPIPE:
    if os.path.exists(model_path_pose):
        try:
            pose_base_options = python.BaseOptions(model_asset_path=model_path_pose)
            pose_options = vision.PoseLandmarkerOptions(
                base_options=pose_base_options,
                num_poses=1
            )
            pose_landmarker = vision.PoseLandmarker.create_from_options(pose_options)
            print(f"MediaPipe Pose Landmarker loaded successfully from {model_path_pose}")
        except Exception as e:
            print(f"Error loading MediaPipe Pose Landmarker: {e}")
    else:
        print(f"MediaPipe Pose Landmarker task file not found at {model_path_pose}")

# MediaPipe BlazePose 33-landmark index -> COCO-style joint names the app expects
POSE_LANDMARK_MAP = {
    0: 'nose',
    11: 'left_shoulder', 12: 'right_shoulder',
    13: 'left_elbow', 14: 'right_elbow',
    15: 'left_wrist', 16: 'right_wrist',
    23: 'left_hip', 24: 'right_hip',
    25: 'left_knee', 26: 'right_knee',
    27: 'left_ankle', 28: 'right_ankle',
}

COCO_NAMES = [
    'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
    'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
    'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
    'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
]

class YoloPoseServicer(yolo_pb2_grpc.YoloPoseServicer):
    def Predict(self, request, context):
        if not HAS_MEDIAPIPE or pose_landmarker is None:
            context.set_code(grpc.StatusCode.UNAVAILABLE)
            context.set_details("MediaPipe Pose Landmarker is not loaded or mediapipe is missing")
            return yolo_pb2.PredictResponse(keypoints=[])

        try:
            # Handle base64 decoding
            encoded = request.image
            if "," in encoded:
                encoded = encoded.split(",", 1)[1]

            image_bytes = base64.b64decode(encoded)
            image = Image.open(io.BytesIO(image_bytes))

            # Convert to RGB numpy array for MediaPipe
            image_rgb = image.convert("RGB")
            image_np = np.array(image_rgb)
            height, width = image_np.shape[:2]
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_np)

            # Perform Pose Estimation
            detection_result = pose_landmarker.detect(mp_image)

            if not detection_result or not detection_result.pose_landmarks:
                return yolo_pb2.PredictResponse(keypoints=[])

            # First detected person only
            landmarks = detection_result.pose_landmarks[0]

            output_kps = []
            for idx, name in POSE_LANDMARK_MAP.items():
                if idx >= len(landmarks):
                    continue
                lm = landmarks[idx]
                # MediaPipe landmarks are normalized (0..1); convert to input-frame pixels
                score = getattr(lm, "visibility", None)
                if score is None:
                    score = getattr(lm, "presence", 1.0)
                output_kps.append(yolo_pb2.Keypoint(
                    x=float(lm.x * width),
                    y=float(lm.y * height),
                    score=float(score),
                    name=name
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
    port = os.getenv('GRPC_PORT', '5001')
    host = os.getenv('GRPC_HOST', '0.0.0.0')
    address = f"{host}:{port}"
    server.add_insecure_port(address)
    print(f"Starting YOLO and MediaPipe gRPC Service on {address}")
    server.start()

    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == "__main__":
    serve()
