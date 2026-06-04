const config = require('./config');
const express = require('express');
const routes = require('./routes');
const tasksRoutes = require('./routes/tasks.routes'); // Impor rute Tasks yang baru
const setupSwagger = require('./docs/swagger'); // Impor konfigurasi Swagger Documentation

const app = express();

// Middleware Global
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware Logging Request Sederhana
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Registrasi Rute Minggu 1 (health, info, echo)
app.use('/', routes);
app.use('/api', routes);

// Registrasi Rute CRUD Tasks Minggu 2 dengan prefix /api/v1/tasks
app.use('/api/v1/tasks', tasksRoutes);

// Jalankan Dokumentasi Swagger UI
setupSwagger(app);

// 404 Handler untuk menangkap rute asing
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT FOUND',
      message: `Route ${req.method} ${req.path} tidak ditemukan.`,
      hint: 'Kunjungi alamat GET /api/docs untuk melihat dokumentasi API resmi.'
    }
  });
});

// Error Handler Global jika terjadi crash internal
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    error: {
      code: 'INTERNAL ERROR',
      message: config.env === 'development' ? err.message : 'Terjadi kesalahan sistem di server.'
    }
  });
});

// Nyalakan Server
app.listen(config.port, () => {
  console.log('-'.repeat(50));
  console.log(`${config.appName} v${config.version}`);
  console.log(`Environment : ${config.env}`);
  console.log(`Server      : http://localhost:${config.port}`);
  console.log(`Docs        : http://localhost:${config.port}/api/docs`);
  console.log('-'.repeat(50));
});

module.exports = app;