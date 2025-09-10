const express = require('express');
const router = express.Router();
const likeController = require('../controllers/LikeController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/:postId/toggle', authenticateToken, likeController.toggleLike);

module.exports = router;