const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, addMember, deleteProject } = require('../controllers/projectController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.route('/')
  .post(authMiddleware, adminMiddleware, createProject)
  .get(authMiddleware, getProjects);

router.route('/:id')
  .get(authMiddleware, getProjectById)
  .delete(authMiddleware, adminMiddleware, deleteProject);

router.post('/:id/members', authMiddleware, adminMiddleware, addMember);

module.exports = router;
