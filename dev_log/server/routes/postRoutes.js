// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/PostController');
const authenticateToken = require('../middleware/authMiddleware'); // Your JWT middleware

// Public routes
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);

// Protected routes (need to be logged in)
router.post('/', authenticateToken, postController.createPost);
router.put('/:id', authenticateToken, postController.updatePost);
router.delete('/:id', authenticateToken, postController.deletePost);

module.exports = router;
