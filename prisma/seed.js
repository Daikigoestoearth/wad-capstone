// File: prisma/seed.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { URL } = require('url');


const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL tidak ditemukan di .env');
}

const { hostname, port, username, password, pathname } = new URL(connectionString);

const adapter = new PrismaMariaDb({
    host: hostname,
    port: parseInt(port) || 3307,
    user: username,
    password: password || undefined,
    database: pathname.slice(1),
});

// PENTING: Masukkan adapter ke dalam constructor PrismaClient
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Mulai seeding database...');

    // Hapus data lama
    await prisma.comment.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});

    // 1. Buat Kategori
    const catProyek = await prisma.category.create({ data: { name: 'Proyek', color: '#10B981' } });
    const catBelajar = await prisma.category.create({ data: { name: 'Belajar', color: '#6366F1' } });

    // 2. Buat User
    const budi = await prisma.user.create({ data: { name: 'Budi Santoso', email: 'budi@example.com', password: 'password123' } });
    const siti = await prisma.user.create({ data: { name: 'Siti Rahayu', email: 'siti@example.com', password: 'password123' } });

    // 3. Buat Task
    const task1 = await prisma.task.create({ data: { title: 'Setup Express', status: 'DONE', userId: budi.id, categoryId: catProyek.id } });
    const task2 = await prisma.task.create({ data: { title: 'Review API', status: 'TODO', userId: siti.id, categoryId: catBelajar.id } });

    // 4. Buat Comment
    await prisma.comment.createMany({
        data: [
            { content: "Stok barang sudah diperbarui.", taskId: task1.id, userId: budi.id },
            { content: "Cek alamat pengiriman pesanan.", taskId: task1.id, userId: siti.id },
            { content: "Voucher diskon sudah aktif.", taskId: task2.id, userId: budi.id },
            { content: "Pembayaran e-wallet gangguan.", taskId: task2.id, userId: siti.id },
            { content: "Layout checkout sudah responsif.", taskId: task2.id, userId: budi.id }
        ]
    });

    console.log(' ✓ Seeding selesai!');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });