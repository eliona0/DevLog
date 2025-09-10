const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/BookmarkController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/:postId/toggle', authenticateToken, bookmarkController.toggleBookmark);

module.exports = router;