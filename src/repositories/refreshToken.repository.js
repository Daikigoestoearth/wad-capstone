// File: src/repositories/refreshToken.repository.js
const prisma = require('../config/prisma');

const refreshTokenRepo = {
  // Simpan refresh token baru ke database
  async create({ token, userId, expiresAt }) {
    return prisma.refreshToken.create({
      data: { 
        token, 
        userId: Number(userId), 
        expiresAt: new Date(expiresAt) 
      },
    });
  },

  // Cari refresh token yang masih valid (belum direvoke dan belum expired)
  async findValid(token) {
    return prisma.refreshToken.findFirst({
      where: {
        token,
        isRevoked: false,
        expiresAt: { gt: new Date() }, // gt = greater than (belum expired)
      },
      include: {
        user: { select: { id: true, email: true, name: true } }
      }
    });
  },

  // Cari token untuk kebutuhan Reuse Detection (termasuk yang sudah direvoke)
  async findByToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token }
    });
  },

  // Revoke satu token khusus (saat mekanisme rotasi token terjadi)
  async revoke(token) {
    return prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  },

  // Revoke SEMUA token milik user tertentu (penyelamatan otomatis saat ada indikasi fraud)
  async revokeAllByUser(userId) {
    return prisma.refreshToken.updateMany({
      where: { userId: Number(userId), isRevoked: false },
      data: { isRevoked: true },
    });
  },

  // Pembersihan otomatis sisa sampah token expired
  async deleteExpired() {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
};

module.exports = refreshTokenRepo;