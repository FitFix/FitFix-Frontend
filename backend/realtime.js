const { Server } = require('socket.io');

// Each gym's live alerts go to its own room, so one gym never sees another
// gym's members.
const gymRoom = (gymId) => `gym:${gymId}`;

/**
 * Attach Socket.io to the HTTP server. Connections must present a valid gym
 * admin JWT (`io(url, { auth: { token } })`) and are joined to their gym's
 * room only.
 */
function setupRealtime(server, corsOrigin) {
  // Required lazily so this module can be imported for gymRoom() alone.
  const { authenticateToken } = require('./middleware/authMiddleware');

  const io = new Server(server, {
    cors: { origin: corsOrigin, methods: ['GET', 'POST'] }
  });

  io.use(async (socket, next) => {
    try {
      const user = await authenticateToken(socket.handshake.auth && socket.handshake.auth.token);
      if (!user || user.role !== 'admin' || !user.gymId) {
        return next(new Error('Unauthorized'));
      }
      socket.data.user = { _id: String(user._id), gymId: String(user.gymId), role: user.role };
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(gymRoom(socket.data.user.gymId));
    console.log('Admin socket connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = { setupRealtime, gymRoom };
