const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tasks.controller');
const validate = require('../middleware/validate');
const { createTaskSchema } = require('../validators/task.validator');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Operasi CRUD untuk resource Task
 */

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
router.post('/', validate(createTaskSchema), ctrl.createTask);

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
router.get('/:id', ctrl.getTask);

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
router.delete('/:id', ctrl.deleteTask);

module.exports = router;