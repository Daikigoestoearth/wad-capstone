// File: src/middleware/authenticate.js
const jwt = require('jsonwebtoken');
const config = require('../config');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Format wajib: 'Bearer <token_jwt>'
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'MISSING_TOKEN',
        message: 'Access token diperlukan. Sertakan header: Authorization: Bearer <token>',
      },
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    
    // Injeksi informasi penting user ke dalam objek request untuk diekstrak controller
    req.user = {
      id: payload.userId, // Sinkron dengan properti user.id database
      email: payload.email,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access token sudah expired. Gunakan refresh token untuk memperbarui.',
        },
      });
    }
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Access token tidak valid.',
      },
    });
  }
};

module.exports = authenticate;