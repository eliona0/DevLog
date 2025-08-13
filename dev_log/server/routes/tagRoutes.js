// routes/tagRoutes.js
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/TagController');
const authenticateToken = require('../middleware/authMiddleware');

// Public routes
router.get('/', tagController.getAllTags); // Get all tags
router.get('/:id', tagController.getTagById); // Get tag by ID

// Protected routes (need to be logged in)
router.post('/', authenticateToken, tagController.createTag); // Create a new tag
router.put('/:id', authenticateToken, tagController.updateTag); // Update a tag
router.delete('/:id', authenticateToken, tagController.deleteTag); // Delete a tag

module.exports = router;
