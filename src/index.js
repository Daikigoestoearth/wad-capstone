const config = require('./config');
const express = require('express');
const routes = require('./routes');

// Inisialisasi Express App
const app = express();

// Middleware Global
app.use(express.json()); // Wajib untuk menerima request dengan body JSON
app.use(express.urlencoded({ extended: true })); // Untuk parsing form data

// Middleware Logging Sederhana
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Registrasi Routes
app.use('/', routes); // Route health check langsung di root
app.use('/api', routes); // Route API dengan prefix /api

// 404 Handler (Jika route tidak ditemukan)
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} tidak ditemukan.`,
    hint: 'Kunjungi GET /api/info untuk melihat daftar endpoint yang tersedia.'
  });
});

// Error Handler Global
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.env === 'development' ? err.message : 'Terjadi kesalahan di server.'
  });
});

// Start Server
app.listen(config.port, () => {
  console.log('-'.repeat(50));
  console.log(`${config.appName} v${config.version}`);
  console.log(`Environment : ${config.env}`);
  console.log(`Server      : http://localhost:${config.port}`);
  console.log('-'.repeat(50));
});

module.exports = app;