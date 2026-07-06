const Joi = require('joi');

const VALID_STATUS = ['todo', 'in_progress', 'done'];
const VALID_PRIORITY = ['low', 'medium', 'high'];

// Schema untuk CREATE task
const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  status: Joi.string().valid(...VALID_STATUS).default('todo'),
  priority: Joi.string().valid(...VALID_PRIORITY).default('medium'),
  dueDate: Joi.date().iso().optional(),
  userId: Joi.number().integer().positive().optional(), // ← akan diabaikan, userId asli dari token (lihat Langkah 11)
  categoryId: Joi.number().integer().positive().optional().allow(null),
});

// Schema untuk UPDATE (PATCH) task — semua field opsional
const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  status: Joi.string().valid(...VALID_STATUS).optional(),
  priority: Joi.string().valid(...VALID_PRIORITY).optional(),
  dueDate: Joi.date().iso().optional().allow(null),
  categoryId: Joi.number().integer().positive().optional().allow(null),
}).min(1); // minimal harus ada 1 field yang diupdate

module.exports = { createTaskSchema, updateTaskSchema };