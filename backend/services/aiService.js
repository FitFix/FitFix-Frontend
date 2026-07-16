const User = require('../models/User');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../yolo.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const yoloProto = grpc.loadPackageDefinition(packageDefinition).yolo;
const client = new yoloProto.YoloPose('127.0.0.1:5001', grpc.credentials.createInsecure());

class AIService {
  euclideanDistance(vec1, vec2) {
    if (vec1.length !== vec2.length) return Infinity;
    let sum = 0;
    for (let i = 0; i < vec1.length; i++) {
      sum += Math.pow(vec1[i] - vec2[i], 2);
    }
    return Math.sqrt(sum);
  }

  calculateAngle(a, b, c) {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    return angle;
  }

  async identifyUserByEmbedding(embedding, gymId) {
    const DISTANCE_THRESHOLD = 0.6;
    const users = await User.find({ gymId, role: 'user' });
    
    let closestUser = null;
    let minDistance = Infinity;

    for (const user of users) {
      if (user.faceEncoding && user.faceEncoding.length === 128) {
        const distance = this.euclideanDistance(embedding, user.faceEncoding);
        if (distance < minDistance) {
          minDistance = distance;
          closestUser = user;
        }
      }
    }

    if (minDistance <= DISTANCE_THRESHOLD && closestUser) {
      return closestUser;
    }
    return null;
  }

  async predictYOLOPose(image) {
    return new Promise((resolve) => {
      const callback = (err, response) => {
        if (err) {
          console.warn('Could not reach YOLO python gRPC microservice. Fallback active.', err.message);
          resolve(null);
        } else {
          resolve(response.keypoints || []);
        }
      };

      try {
        if (typeof client.predict === 'function') {
          client.predict({ image }, callback);
        } else if (typeof client.Predict === 'function') {
          client.Predict({ image }, callback);
        } else {
          throw new Error('YoloPose gRPC method Predict/predict not found on client');
        }
      } catch (err) {
        console.warn('gRPC client invocation error:', err.message);
        resolve(null);
      }
    });
  }

  async detectHands(image) {
    return new Promise((resolve) => {
      const callback = (err, response) => {
        if (err) {
          console.warn('Could not reach MediaPipe python gRPC microservice. Fallback active.', err.message);
          resolve(null);
        } else {
          resolve({
            hands: response.hands || [],
            count: response.count || 0
          });
        }
      };

      try {
        if (typeof client.detectHands === 'function') {
          client.detectHands({ image }, callback);
        } else if (typeof client.DetectHands === 'function') {
          client.DetectHands({ image }, callback);
        } else {
          throw new Error('YoloPose gRPC method DetectHands/detectHands not found on client');
        }
      } catch (err) {
        console.warn('gRPC client invocation error:', err.message);
        resolve(null);
      }
    });
  }
}

module.exports = new AIService();
