const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  starProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getProjects)
  .post(protect, upload.single('screenshot'), createProject);

router.route('/:id')
  .get(getProjectById)
  .put(protect, upload.single('screenshot'), updateProject)
  .delete(protect, deleteProject);

router.put('/:id/star', protect, starProject);

module.exports = router;
