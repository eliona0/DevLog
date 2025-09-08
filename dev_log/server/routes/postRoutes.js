const express = require('express');
const router = express.Router();
const db = require('../config/db'); // If needed for inline queries, but prefer controller
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
router.put('/:id/view', postController.incrementView);

module.exports = router;

// router.get("/:id", async (req, res) => {
//   try {
//     const postId = req.params.id;

//     const [rows] = await db.query(`
//       SELECT p.*, u.username, u.profile_picture
//       FROM posts p
//       JOIN users u ON p.user_id = u.id
//       WHERE p.id = ?
//     `, [postId]);

//     if (rows.length === 0) return res.status(404).json({ message: "Post not found" });

//     // (Optional) fetch comments
//     const [comments] = await db.query(`
//       SELECT c.*, u.username 
//       FROM comments c
//       JOIN users u ON c.user_id = u.id
//       WHERE c.post_id = ?
//     `, [postId]);

//     res.json({ ...rows[0], comments });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Error fetching post" });
//   }
// });

// router.put('/:id', authenticateToken, postController.updatePost);
// router.delete('/:id', authenticateToken, postController.deletePost);

// module.exports = router;
