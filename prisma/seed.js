// File: prisma/seed.js
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

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Mulai seeding database MySQL...');

  await prisma.task.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const [catBelajar, catKerja, catProyek] = await Promise.all([
    prisma.category.create({ data: { name: 'Belajar', color: '#6366F1' } }),
    prisma.category.create({ data: { name: 'Pekerjaan', color: '#F59E0B' } }),
    prisma.category.create({ data: { name: 'Proyek', color: '#10B981' } }),
  ]);
  console.log(' ✓ 3 kategori dibuat');

  const [budi, siti] = await Promise.all([
    prisma.user.create({ data: { name: 'Budi Santoso', email: 'budi@example.com', password: 'hashed_later' } }),
    prisma.user.create({ data: { name: 'Siti Rahayu', email: 'siti@example.com', password: 'hashed_later' } }),
  ]);
  console.log(' ✓ 2 user dibuat');

  await Promise.all([
    prisma.task.create({ data: { title: 'Setup Express server', status: 'DONE', priority: 'HIGH', userId: budi.id, categoryId: catProyek.id } }),
    prisma.task.create({ data: { title: 'Belajar REST API', status: 'DONE', priority: 'HIGH', userId: budi.id, categoryId: catBelajar.id } }),
    prisma.task.create({ data: { title: 'Setup MySQL + XAMPP', status: 'IN_PROGRESS', priority: 'HIGH', userId: budi.id, categoryId: catProyek.id, description: 'Menggunakan Prisma ORM' } }),
    prisma.task.create({ data: { title: 'Belajar Prisma ORM', status: 'TODO', priority: 'MEDIUM', userId: budi.id, categoryId: catBelajar.id } }),
    prisma.task.create({ data: { title: 'Review laporan bulanan', status: 'TODO', priority: 'LOW', userId: siti.id, categoryId: catKerja.id } }),
    prisma.task.create({ data: { title: 'Meeting tim desain', status: 'TODO', priority: 'MEDIUM', userId: siti.id, categoryId: catKerja.id } }),
  ]);
  console.log(' ✓ 6 task dibuat');

  console.log('Seeding selesai!');
}

main()
  .catch((e) => { console.error('Error seeding:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });