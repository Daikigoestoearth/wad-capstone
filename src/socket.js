// File: src/socket.js
const jwt = require('jsonwebtoken');
const config = require('./config');

module.exports = function setupSocket(io) {
  // ── AUTH MIDDLEWARE ─────────────────────────────────────
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Token tidak disertakan'));
      }

      const payload = jwt.verify(token, config.jwt.accessSecret);

      socket.data.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      next();
    } catch (err) {
      next(new Error('Token tidak valid: ' + err.message));
    }
  });

  // ── CONNECTION HANDLER ──────────────────────────────────
  io.on('connection', (socket) => {
    const { userId, email, role } = socket.data.user;
    console.log(`[Socket] User ${email} (${userId}) terhubung — socket: ${socket.id}`);

    socket.join(`user:${userId}`);
    socket.join('tasks:global');

    socket.on('join:task', ({ taskId }) => {
      socket.join(`task:${taskId}`);
      console.log(`[Socket] User ${email} join room task:${taskId}`);
    });

    socket.on('leave:task', ({ taskId }) => {
      socket.leave(`task:${taskId}`);
      console.log(`[Socket] User ${email} leave room task:${taskId}`);
    });

    const onlineCount = io.sockets.sockets.size;
    io.emit('users:online', { count: onlineCount });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] User ${email} terputus — reason: ${reason}`);
      const remaining = io.sockets.sockets.size;
      io.emit('users:online', { count: remaining });
    });

    socket.on('ping', (cb) => {
      if (typeof cb === 'function') cb('pong');
    });
  });
};