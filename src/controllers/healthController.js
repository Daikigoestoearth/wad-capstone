const config = require('../config');

const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} detik`,
  });
};

const getInfo = (req, res) => {
  res.status(200).json({
    name: config.appName,
    version: config.version,
    environment: config.env,
    node: process.version,
    endpoints: [
      { method: 'GET', path: '/health', description: 'Health check' },
      { method: 'GET', path: '/api/info', description: 'API information' },
      { method: 'GET', path: '/api/echo/:msg', description: 'Echo a message' },
    ],
  });
};

const echo = (req, res) => {
  const { msg } = req.params;
  const upper = req.query.upper === 'true';

  if (!msg || msg.trim() === '') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Parameter :msg tidak boleh kosong.',
    });
  }

  const result = upper ? msg.toUpperCase() : msg;
  res.status(200).json({
    original: msg,
    echoed: result,
    upper: upper,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth, getInfo, echo };