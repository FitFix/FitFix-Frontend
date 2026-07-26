#!/bin/bash
# Ensure Python user-installed packages (grpc, mediapipe, ultralytics) are in PATH & PYTHONPATH on Render
export PATH="$HOME/.local/bin:$PATH"
export PYTHONPATH="$(python3 -m site --user-site):$PYTHONPATH"

# Start Python gRPC AI Service in background
python3 yolo_service.py &

# Start Node.js Express server in foreground
node server.js

