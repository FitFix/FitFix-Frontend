#!/bin/bash
# Start Python gRPC AI Service in background
python yolo_service.py &

# Start Node.js Express server in foreground
node server.js
