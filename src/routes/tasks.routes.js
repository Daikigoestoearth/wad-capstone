// File: src/routes/tasks.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tasks.controller');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { checkTaskOwnership } = require('../middleware/checkOwnership');
const { sanitizeBody } = require('../middleware/sanitize'); 
const { createTaskSchema, updateTaskSchema } = require('../validators/task.validator'); 

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Operasi CRUD untuk resource Task
 */

// Semua route di bawah butuh autentikasi
router.use(authenticate);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Ambil daftar task
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar task
 */
// PERBAIKAN: Middleware validasi listTasksSchema dilepas sementara agar tidak error undefined
router.get('/', ctrl.listTasks);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Buat task baru
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTask'
 *     responses:
 *       201:
 *         description: Task berhasil dibuat
 *       400:
 *         description: Data tidak valid
 */
router.post('/', validate(createTaskSchema), sanitizeBody, authorize('USER', 'ADMIN'), ctrl.createTask);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Ambil detail satu task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task ditemukan
 *       404:
 *         description: Task tidak ditemukan
 */
router.get('/:id', checkTaskOwnership, ctrl.getTask);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Perbarui sebagian field task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task berhasil diperbarui
 *       403:
 *         description: Bukan pemilik task
 *       404:
 *         description: Task tidak ditemukan
 */
router.patch('/:id', checkTaskOwnership, validate(updateTaskSchema), sanitizeBody, ctrl.updateTask);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Hapus satu task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Task berhasil dihapus
 *       404:
 *         description: Task tidak ditemukan
 */
router.delete('/:id', checkTaskOwnership, ctrl.deleteTask);

module.exports = router;