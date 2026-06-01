require('dotenv').config(); // Muat isi file .env ke dalam process.env [cite: 434, 437]

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,         // Mengonversi port ke angka [cite: 438]
  env: process.env.NODE_ENV || 'development',          // Menyimpan info environment (development/production) [cite: 438]
  appName: process.env.APP_NAME || 'WAD API',          // Nama aplikasi [cite: 438]
  version: process.env.APP_VERSION || '1.0.0'          // Versi aplikasi [cite: 439]
};

module.exports = config; // Mengekspor objek config agar bisa digunakan di file lain [cite: 440]