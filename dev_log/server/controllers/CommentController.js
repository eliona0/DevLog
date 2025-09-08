const CommentModel = require('../models/CommentModel');
const db = require('../config/db');

// Create a new comment on a post
exports.createComment = async (req, res) => {
  const { postId } = req.params; // Changed from post_id to postId
  const { comment } = req.body;
  const user_id = req.user.id; // From auth middleware

  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }

  try {
    const [post] = await db.query('SELECT id FROM posts WHERE id = ? AND is_published = 1', [postId]);
    console.log('Query result for postId', postId, ':', post); // Updated debug log
    if (!post.length) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = await CommentModel.create(postId, user_id, comment.trim());
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Error creating comment:', err.stack);
    res.status(500).json({ error: 'Failed to create comment', details: err.message });
  }
};

// Get all comments for a post
exports.getCommentsByPostId = async (req, res) => {
  const { postId } = req.params; // Changed from post_id to postId

  try {
    const [post] = await db.query('SELECT id FROM posts WHERE id = ? AND is_published = 1', [postId]);
    console.log('Query result for postId', postId, ':', post); // Updated debug log
    if (!post.length) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comments = await CommentModel.getByPostId(postId);
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err.stack);
    res.status(500).json({ error: 'Failed to fetch comments', details: err.message });
  }
};