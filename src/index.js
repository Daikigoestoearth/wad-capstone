const config = require('./config');
const express = require('express');
const routes = require('./routes');
const tasksRoutes = require('./routes/tasks.routes');
const usersRoutes = require('./routes/users.routes');
const authRoutes = require('./routes/auth.routes'); // BARU
const authenticate = require('./middleware/authenticate'); // BARU
const setupSwagger = require('./docs/swagger');

const app = express();

// --- Middleware Global ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware logging sederhana
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// --- Routes ---
app.use('/', routes);
app.use('/api', routes);

// --- Auth routes (TIDAK dilindungi — untuk register/login/refresh/logout) ---
app.use('/auth', authRoutes);

// --- API Routes yang DILINDUNGI oleh authenticate middleware ---
app.use('/api/v1', authenticate);
app.use('/api/v1/tasks', tasksRoutes);
app.use('/api/v1/users', usersRoutes);

// --- Dokumentasi API (Swagger) ---
setupSwagger(app);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} tidak ditemukan.`,
  });
});

// --- Error Handler Global ---
app.use((err, req, res, next) => {
  // Error dengan statusCode dari authService (register/login/refresh/logout)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: { code: err.code || 'AUTH_ERROR', message: err.message },
    });
  }

  // P2002: Unique constraint (email duplikat, dll.)
  if (err.code === 'P2002') {
    const field = err.meta?.target ?? 'field';
    return res.status(409).json({
      error: { code: 'DUPLICATE_RESOURCE', message: `Nilai ${field} sudah digunakan.` }
    });
  }

  // P2003: Foreign key constraint (ID tidak ada, misal userId/categoryId invalid)
  if (err.code === 'P2003') {
    const field = err.meta?.field_name ?? 'field';
    return res.status(400).json({
      error: { code: 'INVALID_REFERENCE', message: `Referensi ${field} tidak ditemukan.` }
    });
  }

  // P2025: Record not found untuk update/delete
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Data tidak ditemukan.' }
    });
  }

  console.error('Unhandled error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'Terjadi kesalahan.',
  });
});

// --- Start Server ---
app.listen(config.port, () => {
  console.log('-'.repeat(50));
  console.log(`${config.appName} v${config.version}`);
  console.log(`Environment : ${config.nodeEnv}`);
  console.log(`Server      : http://localhost:${config.port}`);
  console.log('-'.repeat(50));
});

module.exports = app;