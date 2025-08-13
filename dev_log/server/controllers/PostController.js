// PostController.js
const db = require('../config/db');

// Create Post
// PostController.js (createPost)
exports.createPost = async (req, res) => {
  const { title, content, featured_image, category_id, is_published, tags } = req.body;
  
  try {
    // 1. Create the post
    const [result] = await db.query(
      'INSERT INTO posts (title, content, featured_image, category_id, is_published) VALUES (?, ?, ?, ?, ?)',
      [title, content, featured_image, category_id, is_published]
    );
    const postId = result.insertId;

    // 2. Insert into post_tags table
    if (tags && tags.length) {
      const values = tags.map(tagId => [postId, tagId]);
      await db.query('INSERT INTO post_tags (post_id, tag_id) VALUES ?', [values]);
    }

    res.status(201).json({ message: 'Post created', postId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
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
// Get single post by ID with tags
exports.getPostById = async (req, res) => {
  const postId = req.params.id; // assume URL is /api/posts/:id

  try {
    // Fetch post info
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Fetch tags associated with this post
    const [tags] = await db.query(`
      SELECT t.id, t.name
      FROM tags t
      JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
    `, [postId]);

    // Return combined data
    res.json({ ...posts[0], tags });

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
