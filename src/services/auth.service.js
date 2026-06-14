// File: src/services/auth.service.js
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const userRepo = require('../repositories/user.repository');
const refreshTokenRepo = require('../repositories/refreshToken.repository');
const prisma = require('../config/prisma');

// Konfigurasi enkripsi berstandar OWASP
const ARGON2_OPTIONS = {
  memoryCost: 65536, // 64 MB
  timeCost: 3,       // 3 Iterasi pencocokan matematika
  parallelism: 4,    // 4 Thread pemrosesan paralel
};

function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
    jwtid: uuidv4(), // ID unik token untuk anti-replay
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    jwtid: uuidv4(),
  });
}

function getRefreshTokenExpiry() {
  const days = parseInt(config.jwt.refreshExpiresIn, 10) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

const authService = {
  // 1. REGISTRASI AKUN BARU
  async register({ name, email, password }) {
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      const err = new Error('Email sudah terdaftar.');
      err.statusCode = 409;
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }

    // Hash rahasia password memakai argon2id sebelum dikirim ke MySQL
    const hashedPassword = await argon2.hash(password, ARGON2_OPTIONS);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return user;
  },

  // 2. LOGIN & GENERATE SEPASANG TOKEN
  async login({ email, password }) {
    const user = await userRepo.findByEmail(email);
    
    // Keamanan: Gunakan pesan kesalahan generik demi menghindari User Enumeration Attack!
    if (!user) {
      const err = new Error('Email atau password salah.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      const err = new Error('Email atau password salah.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    // Pembuatan paket Dual Token
    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });

    // Dokumentasikan refresh token aktif ke database MySQL XAMPP
    await refreshTokenRepo.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    });

    return {
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken
    };
  },

  // 3. MEKANISME REFRESH TOKEN ROTATION & REUSE DETECTION
  async refresh(tokenString) {
    let payload;
    try {
      payload = jwt.verify(tokenString, config.jwt.refreshSecret);
    } catch (e) {
      const err = new Error('Refresh token tidak valid atau sudah expired.');
      err.statusCode = 401;
      err.code = 'INVALID_REFRESH_TOKEN';
      throw err;
    }

    const storedToken = await refreshTokenRepo.findByToken(tokenString);

    // REUSE DETECTION: Token terdaftar di MySQL tapi statusnya sudah hangus/terpakai!
    if (storedToken && storedToken.isRevoked) {
      // Hancurkan tanpa sisa seluruh token milik user tersebut demi perlindungan akun
      await refreshTokenRepo.revokeAllByUser(storedToken.userId);
      const err = new Error('Token mencurigakan terdeteksi. Silakan login ulang.');
      err.statusCode = 401;
      err.code = 'TOKEN_REUSE_DETECTED';
      throw err;
    }

    if (!storedToken) {
      const err = new Error('Refresh token tidak ditemukan.');
      err.statusCode = 401;
      err.code = 'INVALID_REFRESH_TOKEN';
      throw err;
    }

    // ROTASI TOKEN: Hanguskan token lama yang baru saja diajukan
    await refreshTokenRepo.revoke(tokenString);

    // Terbitkan sepasang token baru pengganti yang segar
    const newAccessToken = signAccessToken({ userId: storedToken.userId, email: storedToken.user.email });
    const newRefreshToken = signRefreshToken({ userId: storedToken.userId });

    await refreshTokenRepo.create({
      token: newRefreshToken,
      userId: storedToken.userId,
      expiresAt: getRefreshTokenExpiry(),
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  // 4. LOGOUT
  async logout(tokenString) {
    if (!tokenString) return;
    await refreshTokenRepo.revoke(tokenString);
  }
};

module.exports = authService;