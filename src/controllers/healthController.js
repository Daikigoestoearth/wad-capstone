const config = require('../config'); // Impor konfigurasi yang baru kita buat tadi [cite: 452, 455]

/**
 * GET /health
 * Health check endpoint untuk memantau apakah server hidup atau tidak[cite: 443, 456].
 */
const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} detik` // Menghitung berapa lama server berjalan [cite: 466]
  });
};

/**
 * GET /api/info
 * Mengembalikan metadata tentang API (nama, versi, dll)[cite: 443, 470].
 */
const getInfo = (req, res) => {
  res.status(200).json({
    name: config.appName,
    version: config.version,
    environment: config.env,
    node: process.version,
    endpoints: [
      { method: 'GET', path: '/health', description: 'Health check' },
      { method: 'GET', path: '/api/info', description: 'API information' },
      { method: 'GET', path: '/api/echo/:msg', description: 'Echo a message' }
    ]
  });
};

/**
 * GET /api/echo/:msg
 * Mengembalikan pesan yang dikirim lewat URL parameter[cite: 448, 497].
 * Mendukung query param ?upper=true untuk mengubah kata menjadi huruf besar[cite: 498].
 */
const echo = (req, res) => {
  const { msg } = req.params; // Mengambil parameter :msg dari URL [cite: 502]
  const upper = req.query.upper === 'true'; // Mengecek apakah ada query ?upper=true [cite: 502, 504]

  if (!msg || msg.trim() === '') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Parameter :msg tidak boleh kosong.'
    });
  }

  // Jika upper bernilai true, ubah pesan ke huruf kapital [cite: 513]
  const result = upper ? msg.toUpperCase() : msg;

  res.status(200).json({
    original: msg,
    echoed: result,
    upper,
    timestamp: new Date().toISOString()
  });
};

// Ekspor semua fungsi controller agar bisa dipakai di file Routes [cite: 523]
module.exports = { getHealth, getInfo, echo };