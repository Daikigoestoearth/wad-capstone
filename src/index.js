// File: src/index.js
const config = require('./config');
const express = require('express');
const http = require('http'); // ← BARU
const { Server } = require('socket.io'); // ← BARU
const helmet = require('helmet');
const cors = require('cors');
const corsOptions = require('./config/cors');
const { allowedOrigins } = require('./config/cors'); // ← BARU
const { apiLimiter, authLimiter, sensitiveLimiter } = require('./config/rateLimiter');

// Routes
const routes = require('./routes');
const authRoutes = require('./routes/auth.routes');
const tasksRoutes = require('./routes/tasks.routes');
const usersRoutes = require('./routes/users.routes');
const adminRoutes = require('./routes/admin.routes');
const setupSwagger = require('./docs/swagger');

const app = express();
const server = http.createServer(app); // ← BARU: HTTP server membungkus Express

// ── SOCKET.IO SERVER ──────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Ekspos io agar bisa diakses dari controller
app.set('io', io);

// 1. Security Headers (Helmet) - Harus dipasang PALING AWAL sebelum middleware lain
app.use(helmet());

// 2. CORS
app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));

// 3. Body Parser dengan batasan ukuran (Security Hardening)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Rate Limiting Global
app.use('/api/', apiLimiter);

// 5. Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 6. Routes Dasar
app.use('/', routes);
app.use('/api', routes);

// Auth routes dengan rate limiting ketat
app.use('/auth/login', authLimiter);
app.use('/auth/refresh', sensitiveLimiter);
app.use('/auth', authRoutes);

// Protected API routes
app.use('/api/v1/tasks', tasksRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/admin', adminRoutes);

// 7. Swagger UI
setupSwagger(app);

// ── SOCKET.IO SETUP ───────────────────────────────────────
require('./socket')(io); // ← BARU: load socket handler (Langkah 3)

// 8. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} tidak ditemukan.` }
  });
});

// 9. Global Error Handler
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('tidak diizinkan oleh CORS')) {
    return res.status(403).json({
      error: { code: 'CORS_ERROR', message: err.message }
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: { code: err.code || 'AUTH_ERROR', message: err.message }
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: { code: 'DUPLICATE_RESOURCE', message: 'Data sudah digunakan.' }
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      error: { code: 'INVALID_REFERENCE', message: 'Referensi data tidak ditemukan.' }
    });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Data tidak ditemukan.' }
    });
  }

  console.error('Unhandled error:', err.message);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: config.nodeEnv === 'development' ? err.message : 'Terjadi kesalahan.'
    }
  });
});

// 10. Start Server
// PENTING: gunakan server.listen(), BUKAN app.listen()
server.listen(config.port, () => {
  console.log('-'.repeat(55));
  console.log(`${config.appName} v${config.version}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Server     : http://localhost:${config.port}`);
  console.log(`Docs       : http://localhost:${config.port}/api/docs`);
  console.log(`Security   : Helmet | CORS | Rate Limit | Socket.IO`);
  console.log('-'.repeat(55));
});

module.exports = app;