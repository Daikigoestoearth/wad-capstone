// File: src/index.js
const express = require('express');
const dotenv = require('dotenv');
const tasksRoutes = require('./routes/tasks.routes');
const usersRoutes = require('./routes/users.routes');
const authRoutes = require('./routes/auth.routes'); 
const authenticate = require('./middleware/authenticate'); 

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// ==================== ROUTE PUBLIK ====================
app.use('/auth', authRoutes);

// Route default untuk cek server publik
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to WAD Capstone API',
    status: 'Active'
  });
});

// ==================== GERBANG KEAMANAN API ====================
app.use('/api/v1', authenticate);

// ==================== ROUTE YANG DILINDUNGI ====================
app.use('/api/v1/tasks', tasksRoutes);
app.use('/api/v1/users', usersRoutes);

// ==================== GLOBAL ERROR HANDLER ====================
app.use((err, req, res, next) => {
  // Tangani limpahan error dengan statusCode custom dari authService
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: { code: err.code || 'AUTH_ERROR', message: err.message }
    });
  }

  // P2002: Unique constraint violation (misal: email duplikat)
  if (err.code === 'P2002') {
    const field = err.meta?.target ?? 'field';
    return res.status(409).json({
      error: { code: 'DUPLICATE_RESOURCE', message: `Nilai ${field} sudah digunakan.` }
    });
  }

  // P2003: Foreign key constraint failed (misal: merujuk ke ID user yang tidak ada)
  if (err.code === 'P2003') {
    return res.status(400).json({
      error: { code: 'INVALID_REFERENCE', message: 'Referensi ID tidak ditemukan di database.' }
    });
  }

  // P2025: Record not found untuk update atau delete
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Data tidak ditemukan.' }
    });
  }

  // Log error unhandled lainnya untuk debugging development
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan di server.' } 
  });
});

// ==================== JALANKAN SERVER ====================
app.listen(port, () => {
  console.log('-'.repeat(50));
  console.log(`WAD Capstone API`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database   : MySQL via XAMPP (Authenticated)`);
  console.log(`Server     : http://localhost:${port}`);
  console.log('-'.repeat(50));
});