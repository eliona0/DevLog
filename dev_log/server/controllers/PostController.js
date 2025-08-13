// PostController.js
const db = require('../config/db');

// Create Post
exports.createPost = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { title, content, featured_image = null, category_id = null, is_published = 0 } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const [result] = await db.query(
      `INSERT INTO posts (user_id, title, content, featured_image, is_published, category_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, title, content, featured_image, is_published, category_id]
    );

    res.status(201).json({ message: 'Post created', postId: result.insertId });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const [posts] = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  const postId = req.params.id;

  try {
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);

    if (posts.length === 0) return res.status(404).json({ error: 'Post not found' });

    res.json(posts[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  const postId = req.params.id;
  const { title, content, featured_image, is_published, category_id } = req.body;
  const user_id = req.user.id;

  try {
    const [existing] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);

    if (!existing.length) return res.status(404).json({ error: 'Post not found' });

    if (existing[0].user_id !== user_id)
      return res.status(403).json({ error: 'Not authorized' });

    await db.query(
      `UPDATE posts SET title=?, content=?, featured_image=?, is_published=?, category_id=?, updated_at=NOW() WHERE id=?`,
      [title, content, featured_image, is_published, category_id, postId]
    );

    res.json({ message: 'Post updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  const user_id = req.user.id;

  try {
    const [existing] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);

    if (!existing.length) return res.status(404).json({ error: 'Post not found' });

    if (existing[0].user_id !== user_id)
      return res.status(403).json({ error: 'Not authorized' });

    await db.query('DELETE FROM posts WHERE id = ?', [postId]);

    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};
