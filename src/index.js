// File: src/index.js
const express = require('express');
const dotenv = require('dotenv');
const tasksRoutes = require('./routes/tasks.routes');
const usersRoutes = require('./routes/users.routes'); // 1. IMPORT ROUTE USER BARU

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// Main Routes
app.use('/api/v1/tasks', tasksRoutes);
app.use('/api/v1/users', usersRoutes); // 2. DAFTARKAN MIDDLEWARE ROUTE USER

// Route default untuk cek server
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to WAD Capstone API',
    status: 'Active'
  });
});

// 3. GLOBAL ERROR HANDLER (Menangani Error Prisma secara Spesifik)
app.use((err, req, res, next) => {
  // P2002: Unique constraint violation (misal: email duplikat)
  if (err.code === 'P2002') {
    const field = err.meta?.target ?? 'field';
    return res.status(409).json({
      error: { code: 'DUPLICATE_RESOURCE', message: `Nilai ${field} sudah digunakan.` }
    });
  }

  // P2003: Foreign key constraint failed (misal: merujuk ke ID user/kategori yang tidak ada)
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

// 4. JALANKAN SERVER
app.listen(port, () => {
  console.log('-'.repeat(50));
  console.log(`WAD Capstone API`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database   : MySQL via XAMPP`);
  console.log(`Server     : http://localhost:${port}`);
  console.log('-'.repeat(50));
});