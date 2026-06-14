// File: src/controllers/tasks.controller.js (versi MySQL)
const taskRepo = require('../repositories/task.repository');

const listTasks = async (req, res, next) => {
  try {
    const { status, priority, sort, order, limit, offset } = req.query;
    const { data, total } = await taskRepo.findMany({ status, priority, sort, order, limit, offset });
    
    const numLimit = Number(limit) || 10;
    const numOffset = Number(offset) || 0;
    
    res.status(200).json({
      data,
      pagination: {
        total, limit: numLimit, offset: numOffset,
        hasNext: numOffset + numLimit < total,
        hasPrev: numOffset > 0,
        nextOffset: numOffset + numLimit < total ? numOffset + numLimit : null,
        prevOffset: numOffset > 0 ? Math.max(0, numOffset - numLimit) : null,
      }
    });
  } catch (err) { next (err); }
};

const createTask = async (req, res, next) => {
  try {
    const task = await taskRepo.create({ ...req.body, userId: req.body.userId || 1 });
    res.status(201).set('Location', `/api/v1/tasks/${task.id}`).json({
      data: task });
  } catch (err) { next (err); }
};

const getTask = async (req, res, next) => {
  try {
    const task = await taskRepo.findById(req.params.id);
    if (!task) return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Task ID ${req.params.id} tidak ditemukan.` } });
    res.status (200).json({ data: task });
  } catch (err) { next (err); }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskRepo.update(req.params.id, req.body);
    if (!task) return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Task ID ${req.params.id} tidak ditemukan.` } });
    res.status(200).json({ data: task });
  } catch (err) { next (err); }
};

const deleteTask = async (req, res, next) => {
  try {
    const ok = await taskRepo.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Task ID ${req.params.id} tidak ditemukan.` } });
    res.status(204).send();
  } catch (err) { next(err); }
};

const getTasksByUser = async (req, res, next) => {
  try {
    const result = await taskRepo.findByUser (req.params.userId);
    if (!result) return res.status (404).json({ error: { code: 'NOT_FOUND', message: `User ID ${req.params.userId} tidak ditemukan.` } });
    res.status (200).json({
      data: { user: { id: result.id, name: result.name, email: result.email }, tasks: result.tasks, total: result.tasks.length },
    });
  } catch (err) { next (err); }
};

module.exports = { listTasks, createTask, getTask, updateTask, deleteTask, getTasksByUser };