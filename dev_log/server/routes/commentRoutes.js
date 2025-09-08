const express = require('express');
const router = express.Router();
const commentController = require('../controllers/CommentController');
const authenticateToken = require('../middleware/authMiddleware');

// GET /api/comments/:postId - Fetch comments for a post (public)
router.get('/:postId', commentController.getCommentsByPostId);

// POST /api/comments/:postId - Create a new comment (authenticated)
router.post('/:postId', authenticateToken, commentController.createComment);

module.exports = router;