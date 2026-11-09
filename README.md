# FitFix Frontend

AI-powered pose intelligence for commercial gyms. Real-time form correction at sub-30ms latency. No wearables — one camera per floor.

## Overview

FitFix is a full-stack fitness application that uses computer vision to provide real-time exercise form analysis and feedback. The system consists of three interconnected services:

1. **Python gRPC Vision Service** (port 5001) - Handles pose detection using MediaPipe
2. **Node.js Backend API** (port 5000) - Manages user data, workouts, and exercise logic
3. **Vite Frontend** (port 5173) - React-based user interface for workout tracking and exercise guidance

## Key Features

- 🎯 **Real-time Pose Detection**: MediaPipe pose tracking runs on-device in the browser (GPU), every camera frame, with 3D joint angles
- 💪 **Exercise Form Analysis**: Provides instant feedback on exercise form with color-coded guidance
- 🔢 **Rep Counting Automation**: Automatically counts repetitions with hysteresis-based state machine
- ⏱️ **Isometric Hold Tracking**: Tracks duration for exercises like planks
- 🤝 **Multi-user Support**: Handles multiple gym members with subscription management
- 📊 **Workout Tracking**: Saves workout sessions with reps, form quality, and exercise metrics
- 🏢 **Gym Management**: Admin panel for managing gyms, trainers, and members
- 📱 **Responsive Design**: Works on desktop and mobile devices

## System Architecture

```
Browser (Frontend) 
       ↓ HTTP/WebSocket
Node.js Backend (Port 5000)
       ↓ gRPC
Python Vision Service (Port 5001) ← MediaPipe Pose/Hand Landmarkers
       ↓
MongoDB Atlas (User data, workouts, subscriptions)
```

### Data Flow

**Web (on-device, default):**
1. User performs exercise in front of camera
2. Every new camera frame goes straight to MediaPipe Pose Landmarker running **in the browser** (WebAssembly + WebGL GPU, VIDEO/tracking mode). No video leaves the device.
3. The frontend computes the joint angle (3D world landmarks), smooths it, counts reps and picks the form cue locally
4. Only the finished session (reps, deepest angle, seconds per rep) is sent to `/api/workouts/sessions`

**Cloud fallback / mobile app:**
1. Frames are sent to `/api/ai/exercises/:id/analyze`
2. Backend forwards the image to the Python gRPC service (MediaPipe) for keypoints
3. Backend calculates the joint angle and form feedback; the client counts reps

The web app uses the cloud path only when the browser can't run the on-device model.

## Exercise Logic Split

Form analysis and rep counting logic is split between backend and frontend for optimal performance:

### Backend (`backend/utils/exerciseRegistry.js`)
- Defines primary joint angles to measure for each exercise
- Provides form feedback messages based on angle thresholds
- Determines which body side (left/right) has better detection confidence

### Frontend (`frontend/src/engine/ExerciseLogic.js`)
- Matches backend thresholds for rep counting/hysteresis
- Implements rep state machine with ±20° hysteresis
- Tracks isometric hold durations
- Provides local form correction fallback

**Critical**: Backend `targetJoints` and frontend `thresholds` MUST measure the same joint for rep counting to work correctly.

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- MongoDB Atlas account
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd FitFix-Frontend
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Environment Setup:
   - Copy `.env.example` to `.env` in both `backend/` and `frontend/` directories
   - Configure `MONGODB_URI` in backend `.env`
   - Set `VITE_API_BASE_URL` in frontend `.env` (default points to production)

5. Download MediaPipe Models:
   The vision service will automatically download required MediaPipe model files on first startup.

### Running the Application

For development, you need to run all three services:

#### Terminal 1: Backend Server
```bash
cd backend
npm run dev
# Uses nodemon for auto-restart on changes
```

#### Terminal 2: Python Vision Service
```bash
cd backend
# Uses virtualenv at backend/.venv
backend/.venv/Scripts/python.exe -u yolo_service.py
# Look for: "MediaPipe Pose Landmarker loaded successfully"
```

#### Terminal 3: Frontend Dev Server
```bash
cd frontend
npm run dev
# Vite dev server on http://localhost:5173
```

### Production Deployment

The application is configured for deployment on Render.com:

1. Backend: Deployed as a web service using `start.sh` script
2. Frontend: Built as static assets served by backend or separate static hosting
3. Vision Service: Runs as a background worker on Render

See `backend/start.sh` for production startup sequence.

## Project Structure

```
FitFix-Frontend/
├── backend/                 # Node.js/MongoDB backend
│   ├── controllers/         # Route handlers (auth, AI, workouts, etc.)
│   ├── models/              # Mongoose schemas (User, Gym, Workout, etc.)
│   ├── routes/              # API route definitions
│   ├── services/            # AI service (gRPC client for pose detection)
│   ├── utils/               # Exercise registry, helpers
│   ├── yolo_service.py      # Python gRPC vision service
│   ├── yolo.proto          # gRPC service definition
│   ├── server.js            # Express app entrypoint
│   └── start.sh             # Production startup script
├── frontend/                # React/Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React contexts (theme, auth)
│   │   ├── engine/          # Exercise logic (rep counting, form analysis)
│   │   ├── pages/           # Page components (workout, dashboard, etc.)
│   │   ├── styles/          # CSS/Tailwind configuration
│   │   ├── config.js        # API configuration
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets (fonts, images)
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── mobile/                  # React Native (Expo) app
└── README.md
```

## Key Implementation Details

### On-device Tracking (web) — `frontend/src/vision/`

| Step | What happens | Why |
|---|---|---|
| Model | MediaPipe Pose Landmarker **full** (33 landmarks + 3D world landmarks), GPU delegate; falls back to CPU + lite | Full is far more accurate than lite and costs only ~3 ms more on a GPU |
| Model switch | If full averages >40 ms/frame, lite is tried and kept only if ≥20% faster | On many GPUs the cost is fixed overhead, so lite would just lose accuracy |
| Frame loop | `requestVideoFrameCallback`: one inference per new camera frame, VIDEO mode tracking | No duplicate frames, steadier landmarks |
| Angle | 3D angle from world landmarks; aspect-correct 2D fallback | Correct even when the user faces the camera (2D can't see bending toward the lens) |
| Visibility | Joints below 0.5 visibility aren't measured | No phantom reps from hidden joints |
| Side lock | Measured side switches only if the other is ≥0.15 better seen | No angle jumps between arms/legs |
| Smoothing | One Euro filter on the angle | Removes jitter when still, minimal lag on fast reps |
| UI | Tracking runs every frame; on-screen text refreshes ≤10×/s | Rendering never slows tracking |

Measured on an Intel Iris Xe laptop (Chrome, GPU, full model): **~50–60 ms per frame end-to-end inference** with pose found in 70/70 frames, versus 150–400 ms *network round trip alone* (plus upload and server inference) per frame in the old cloud pipeline. Faster GPUs are proportionally quicker. The wasm runtime is copied from `node_modules` into `public/mediapipe/wasm` by `npm run dev`/`build`; models load from Google's MediaPipe model storage.

### Cloud Pose Pipeline (fallback + mobile)

1. **Image Capture**: Frontend captures video frames 320px wide, keeping the camera's aspect ratio
2. **Base64 Encoding**: Frame converted to JPEG (quality 0.45) and base64 encoded
3. **gRPC Transmission**: Sent to Python service via `@grpc/grpc-js`
4. **MediaPipe Processing**: Python service runs pose/hand landmark detection
5. **Keypoint Return**: Pixel coordinates in the sent frame's size, with confidence scores
6. **Angle Calculation**: Backend calculates joint angles using vector mathematics
7. **Form Feedback**: Exercise-specific logic provides coaching messages

### Rep Counting Algorithm

Uses hysteresis-based state machine to prevent false counts:

- **Contracted Threshold**: `angle < min + 20°`
- **Extended Threshold**: `angle > max - 20°`
- **State Transitions**:
  - `down` → `up` when crossing contracted threshold
  - `up` → `down` when crossing extended threshold (increment rep count)
- **Minimum Range**: `max - min > 40°` ensures meaningful hysteresis window
- **Unmeasured frames are ignored**: the analyze API returns `measured: false` (angle 0) when the joints aren't confidently visible; the tracker skips those so 0° can't fake a rep
- Implemented in `frontend/src/engine/workoutTracker.js` (mirrored in `mobile/src/engine/workoutTracker.js`)

### Exercise Configuration

Each exercise defines:
- `targetJoints`: Array of 3 joint names for angle measurement (e.g., `['shoulder', 'elbow', 'wrist']`)
- `thresholds`: `{ min, max }` range of motion for the primary joint
- `type`: `'rep'` (counted), `'hold'` (timed), or `'detect'` (hand tracking)
- `getFeedback(angle, ctx)`: Function returning form guidance messages

### Real-time Communication

- **Socket.io**: Used for subscription alerts and entry/exit notifications
- **REST APIs**: Used for exercise analysis, workout saving, and data fetching
- **JWT Authentication**: Protected routes require Bearer token from localStorage

## Design Decisions & Gotchas

### 1. C: Drive Space Workaround
Due to chronic C: drive space limitations:
- Backend launched with `node --env-file="backend/.env" backend/server.js` (avoids npm cache on C:)
- TEMP/TMP environment variables set to `D:/pip_tmp` for all services

### 2. MatchMedia Synchronization
Landing page animations require useEffect re-sync to handle media query changes between useState initialization and listener attachment.

### 3. Framer Motion Late-Mounting
Scroll-based animations use manual rect-based progress instead of `useScroll({target})` for late-mounting targets.

### 4. Dark Theme Implementation
Requires overriding BOTH raw Tailwind tokens AND `@theme --color-*` CSS variables due to alias freezing at :root.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/setup` - Seed initial data (trainer + 3 users)

### Exercises
- `GET /api/ai/exercises` - Get all available exercises
- `GET /api/ai/exercises/:id` - Get specific exercise details
- `POST /api/ai/exercises/:id/analyze` - Analyze exercise form (expects `{image: base64}`)

### Workouts
- `POST /api/workouts/sessions` - Save workout session
- `GET /api/workouts/history` - Get user workout history

### Gym Management
- `POST /api/gyms` - Create gym
- `GET /api/gyms/:gymId/members` - Get gym members
- `POST /api/gyms/:gymId/trainers` - Add trainer to gym

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/gyms` - Get all gyms

## Environment Variables

### Backend (`.env`)
```
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/FitFix
RENDER_EXTERNAL_URL=https://fitfix-backend.onrender.com
BACKEND_URL=https://fitfix-backend.onrender.com
YOLO_GRPC_URL=127.0.0.1:5001
```

### Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:5000
```

## Future Enhancements

1. **Exercise Library Expansion**: Add more exercise types with specialized form analysis
2. **Progress Tracking**: Visualize strength/progress over time with charts
3. **Social Features**: Workout sharing, challenges, leaderboards
4. **Integration**: Wearable device sync (Apple Health, Google Fit)
5. **Nutrition Tracking**: Meal logging and macro tracking
6. **Voice Guidance**: Audio form cues for hands-free operation
7. **Offline Mode**: Cache workouts for sync when connection restored

## Troubleshooting

### Common Issues

#### "No user detected" persistently
1. Check lighting - ensure face/body is well-lit
2. Verify camera permissions granted
3. Ensure you're fully visible in frame
4. Check backend logs for "Fallback active" warnings

#### "Fallback active" warnings in backend logs
1. Vision service not running on port 5001
2. MediaPipe model files missing/corrupted
3. gRPC connection failure between backend and vision service
4. Check `backend/yolo_service.py` process is running

#### Rep counting not working
1. Verify exercise selected matches intended workout
2. Check that backend `targetJoints` matches frontend `thresholds`
3. Ensure proper form - algorithm needs clear contraction/extension
4. Check current angle display moves through expected range

#### Camera not starting
1. Verify HTTPS is required for getUserMedia (use localhost or proper certs)
2. Check another application isn't using camera
3. Try different browser (Chrome/Firefox recommended)
4. Check console for specific getUserMedia errors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -am 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

Please ensure your code follows existing patterns:
- Backend: Express route controllers with async error handling
- Frontend: React hooks, Tailwind CSS, Lucide icons
- Style: Consistent with existing exercise logic patterns

## License

This project is proprietary and confidential. All rights reserved.

## Acknowledgments

- MediaPipe for pose detection capabilities
- Socket.io for real-time communication
- Vite for fast frontend development
- Express.js and Node.js for robust backend
- MongoDB for flexible data storage