const express = require('express');
const router = express.Router();
const LikeController = require('../controllers/LikeController');

router.get('/:postId', LikeController.getLikes); // GET likes for a post
router.post('/:postId/toggle', LikeController.toggleLike); // toggle like

module.exports = router;
