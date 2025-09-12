// postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/PostController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.post('/', authenticateToken, postController.upload, postController.createPost);
router.put('/:id', authenticateToken, postController.upload, postController.updatePost);
router.delete('/:id', authenticateToken, postController.deletePost);
router.put('/:id/view', postController.incrementView);

module.exports = router;