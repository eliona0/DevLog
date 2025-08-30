// routes/postRoutes.js
const express = require('express');
const router = express.Router();

const postController = require('../controllers/PostController');
const authenticateToken = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);

router.post(
  '/',
  authenticateToken,
  upload.single('featured_image'),
  postController.createPost
);

router.put('/:id', authenticateToken, postController.updatePost);
router.delete('/:id', authenticateToken, postController.deletePost);

module.exports = router;
