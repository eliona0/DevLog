const db = require('../config/db');

exports.createPost = async (req, res) => {
  const { title, content, is_published, category_id } = req.body;
  const user_id = req.user.id;

  try {
    let featured_image = null;
    if (req.file) {
      const [existingImage] = await pool.query(
        'SELECT featured_image FROM posts WHERE featured_image LIKE ?',
        [`%${req.file.originalname}%`]
      );

      if (existingImage.length > 0) {
        return res.status(400).json({ error: 'This photo was already uploaded before. Please choose another one.' });
      }

      featured_image = req.file.filename; 
    }

    const [result] = await pool.query(
      `INSERT INTO posts (user_id, title, content, featured_image, is_published, category_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, title, content, featured_image, is_published ? 1 : 0, category_id || null]
    );

    res.status(201).json({
      id: result.insertId,
      user_id,
      title,
      content,
      featured_image,
      is_published: is_published ? 1 : 0,
      category_id: category_id || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong while creating the post.' });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const [posts] = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

exports.getPostById = async (req, res) => {
  const postId = req.params.id;

  try {
    const [posts] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) return res.status(404).json({ error: 'Post not found' });

    const [tags] = await db.query(`
      SELECT t.id, t.name
      FROM tags t
      JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?`, [postId]
    );

    res.json({ ...posts[0], tags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

exports.updatePost = async (req, res) => {
  const postId = req.params.id;
  const { title, content, featured_image, is_published, category_id } = req.body;
  const user_id = req.user.id;

  try {
    const [existing] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (!existing.length) return res.status(404).json({ error: 'Post not found' });
    if (existing[0].user_id !== user_id) return res.status(403).json({ error: 'Not authorized' });

    await db.query(
      `UPDATE posts 
         SET title=?, content=?, featured_image=?, category_id=?, is_published=?, updated_at=NOW() 
       WHERE id=?`,
      [title, content, featured_image, category_id, is_published, postId]
    );

    res.json({ message: 'Post updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  const user_id = req.user.id;

  try {
    const [existing] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (!existing.length) return res.status(404).json({ error: 'Post not found' });
    if (existing[0].user_id !== user_id) return res.status(403).json({ error: 'Not authorized' });

    await db.query('DELETE FROM posts WHERE id = ?', [postId]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};
