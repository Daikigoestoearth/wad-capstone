// File: src/routes/tasks.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tasks.controller');
const validate = require('../middleware/validate');
const {
  createTaskSchema,
  replaceTaskSchema,
  updateTaskSchema,
  listTasksSchema
} = require('../validators/task.validator');

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Ambil daftar task dengan pagination, filtering, dan sorting
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, done]
 *         description: Filter berdasarkan status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman (maks 100)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Jumlah data yang dilewati
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar task
 */
router.get('/', validate(listTasksSchema, 'query'), ctrl.listTasks);

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
router.post('/', validate(createTaskSchema, 'body'), ctrl.createTask);

router.get('/:id', ctrl.getTask);
router.put('/:id', validate(replaceTaskSchema, 'body'), ctrl.replaceTask);
router.patch('/:id', validate(updateTaskSchema, 'body'), ctrl.updateTask);
router.delete('/:id', ctrl.deleteTask);

module.exports = router;