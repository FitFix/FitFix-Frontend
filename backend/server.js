const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.FRONTEND_URL || '*';

// Create HTTP server and integrate Socket.io
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST']
  }
});

app.set('io', io); // Make io accessible in route handlers

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not found in environment variables. Starting server without DB connection.');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/plan', require('./routes/planRoutes'));

app.get('/', (req, res) => {
  res.send('FitFix API is running');
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Self-ping keep-alive mechanism to prevent Render free tier from sleeping after 15 mins of inactivity
const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || 'https://fitfix-backend.onrender.com';
const KEEP_ALIVE_INTERVAL = 14 * 60 * 1000; // 14 minutes

function startKeepAlive() {
  setInterval(() => {
    const pingUrl = `${BACKEND_URL}/ping`;
    const client = pingUrl.startsWith('https') ? require('https') : require('http');
    client.get(pingUrl, (res) => {
      console.log(`[Keep-Alive] Self-ping status code: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('[Keep-Alive] Self-ping failed:', err.message);
    });
  }, KEEP_ALIVE_INTERVAL);
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startKeepAlive();
});

