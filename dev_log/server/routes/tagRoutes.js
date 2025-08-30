// routes/tagRoutes.js
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/TagController');
const authenticateToken = require('../middleware/authMiddleware');


router.get('/', tagController.getAllTags); 
router.get('/:id', tagController.getTagById);

// Protected routes (need to be logged in)
router.post('/', authenticateToken, tagController.createTag); 
router.put('/:id', authenticateToken, tagController.updateTag);
router.delete('/:id', authenticateToken, tagController.deleteTag);

module.exports = router;
