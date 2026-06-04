// File: src/controllers/tasks.controller.js
const store = require('../data/tasks.store');

// GET /api/v1/tasks (Membaca list dengan pagination, filtering, dan sorting)
const listTasks = (req, res) => {
  const { status, priority, sort, order, limit, offset } = req.query;
  const { data, total } = store.findAll({ status, priority, sort, order, limit, offset });

  const numLimit = Number(limit);
  const numOffset = Number(offset);

  res.status(200).json({
    data,
    pagination: {
      total,
      limit: numLimit,
      offset: numOffset,
      hasNext: numOffset + numLimit < total,
      hasPrev: numOffset > 0,
      nextOffset: numOffset + numLimit < total ? numOffset + numLimit : null,
      prevOffset: numOffset > 0 ? Math.max(0, numOffset - numLimit) : null
    }
  });
};

// POST /api/v1/tasks (Membuat data task baru)
const createTask = (req, res) => {
  const task = store.create(req.body);
  res.status(201)
    .set('Location', `/api/v1/tasks/${task.id}`)
    .json({ data: task });
};

// GET /api/v1/tasks/:id (Membaca detail satu task)
const getTask = (req, res) => {
  const task = store.findById(req.params.id);
  if (!task) {
    return res.status(404).json({
      error: {
        code: 'NOT FOUND',
        message: `Task dengan ID ${req.params.id} tidak ditemukan.`
      }
    });
  }
  res.status(200).json({ data: task });
};

// PUT /api/v1/tasks/:id (Mengganti seluruh resource task)
const replaceTask = (req, res) => {
  const task = store.replace(req.params.id, req.body);
  if (!task) {
    return res.status(404).json({
      error: { code: 'NOT FOUND', message: `Task dengan ID ${req.params.id} tidak ditemukan.` }
    });
  }
  res.status(200).json({ data: task });
};

// PATCH /api/v1/tasks/:id (Mengubah sebagian field task)
const updateTask = (req, res) => {
  const task = store.update(req.params.id, req.body);
  if (!task) {
    return res.status(404).json({
      error: { code: 'NOT FOUND', message: `Task dengan ID ${req.params.id} tidak ditemukan.` }
    });
  }
  res.status(200).json({ data: task });
};

// DELETE /api/v1/tasks/:id (Menghapus task)
const deleteTask = (req, res) => {
  const deleted = store.remove(req.params.id);
  if (!deleted) {
    return res.status(404).json({
      error: { code: 'NOT FOUND', message: `Task dengan ID ${req.params.id} tidak ditemukan.` }
    });
  }
  res.status(204).send();
};

module.exports = { listTasks, createTask, getTask, replaceTask, updateTask, deleteTask };