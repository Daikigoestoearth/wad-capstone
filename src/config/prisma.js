// File: src/config/prisma.js
const path = require('path');
// Memaksa dotenv membaca file .env tepat di folder utama proyek (wad-capstone)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

// Validasi sebelum memproses URL agar tidak crash beruntun
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: Variabel DATABASE_URL tidak ditemukan di file .env!');
  console.error('Silakan pastikan file .env ada di folder wad-capstone dan berisi DATABASE_URL.');
  process.exit(1);
}

// Ekstrak komponen URL koneksi database dari file .env
const { hostname, port, username, password, pathname } = new URL(process.env.DATABASE_URL);

// Inisialisasi adapter MariaDB agar sesuai dengan XAMPP
const adapter = new PrismaMariaDb({
  host: hostname,
  port: parseInt(port) || 3306,
  user: username,
  password: password || undefined,
  database: pathname.slice(1),
});

// Masukkan instance adapter ke dalam constructor PrismaClient
const prisma = new PrismaClient({
  adapter: adapter,
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
});

// Disconnect saat aplikasi ditutup
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;