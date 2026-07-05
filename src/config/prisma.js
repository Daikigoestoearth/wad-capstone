// File: src/config/prisma.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const { hostname, port, username, password, pathname } = new URL(process.env.DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: hostname,
  port: parseInt(port) || 3306,
  user: username,
  password: password || undefined,
  database: pathname.slice(1),
});

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;