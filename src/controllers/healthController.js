// Fungsi 1: Health Check
const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(0)} detik`
  });
};

// Fungsi 2: API Info
const getApiInfo = (req, res) => {
  res.status(200).json({
    name: 'WAD Capstone API',
    version: '1.0.0',
    environment: 'development'
  });
};

// Fungsi 3: Echo Message
const echoMessage = (req, res) => {
  const { msg } = req.params;
  const isUpper = req.query.upper === 'true';
  
  res.status(200).json({
    original: msg,
    echoed: isUpper ? msg.toUpperCase() : msg,
    upper: isUpper,
    timestamp: new Date().toISOString()
  });
};

// FORMAT EKSPOR BANYAK OBJEK (WAJIB UTUH)
module.exports = {
  getHealth,
  getApiInfo,
  echoMessage
};