const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.route('/')
  .post(authMiddleware, adminMiddleware, createTask)
  .get(authMiddleware, getTasks);

router.route('/:id')
  .delete(authMiddleware, adminMiddleware, deleteTask);

router.route('/:id/status')
  .patch(authMiddleware, updateTaskStatus);

module.exports = router;
