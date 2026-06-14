// File: src/routes/tasks.routes.js
const express = require('express');
const router = express.Router();

const { 
  listTasks, 
  createTask, 
  getTask, 
  updateTask, 
  deleteTask 
} = require('../controllers/tasks.controller');

// Pemetaan endpoint Express ke fungsi controller MySQL
router.route('/')
  .get(listTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;