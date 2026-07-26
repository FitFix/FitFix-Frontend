#!/bin/bash
# Ensure Python packages are accessible
export PATH="/opt/render/.local/bin:$HOME/.local/bin:$PATH"
export PYTHONPATH="/opt/render/.local/lib/python3.11/site-packages:/opt/render/.local/lib/python3/site-packages:$(python3 -m site --user-site 2>/dev/null):$PYTHONPATH"
export YOLO_CONFIG_DIR=/tmp/Ultralytics


# Run Python gRPC AI Service using virtualenv if present, otherwise system python3
if [ -f "./.venv/bin/python" ]; then
  echo "Starting Python gRPC AI Service using .venv..."
  ./.venv/bin/python yolo_service.py &
else
  echo "Starting Python gRPC AI Service using python3..."
  python3 yolo_service.py &
fi

# Start Node.js Express server in foreground
node server.js


