// const db = require('../config/db');

// Create post
// exports.createPost = async (req, res) => {
//   const { title, content, is_published, category_id } = req.body;
//   const user_id = req.user.id;

//   try {
//     let featured_image = null;
//     if (req.file) {
//       const [existingImage] = await db.query(
//         'SELECT featured_image FROM posts WHERE featured_image LIKE ?',
//         [`%${req.file.originalname}%`]
//       );

//       if (existingImage.length > 0) {
//         return res.status(400).json({ error: 'This photo was already uploaded before. Please choose another one.' });
//       }

//       featured_image = req.file.filename;
//     }

//     // Extract tags from the request body (parsed from FormData)
//     const tags = req.body['tags[]'] ? req.body['tags[]'].map(tag => parseInt(tag)) : [];

//     // Use PostModel to create post and handle tag association
//     const postId = await PostModel.create(user_id, title, content, featured_image, category_id || null, is_published ? 1 : 0, tags);

//     res.status(201).json({
//       id: postId,
//       user_id,
//       title,
//       content,
//       featured_image,
//       is_published: is_published ? 1 : 0,
//       category_id: category_id || null,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Something went wrong while creating the post.' });
//   }
// };


const db = require('../config/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

exports.createPost = [
  upload.single('featured_image'),
  async (req, res) => {
    const { title, content, is_published, category_id } = req.body;
    const user_id = req.user.id;

    try {
      let featured_image = null;
      if (req.file) {
        const [existingImage] = await db.query(
          'SELECT featured_image FROM posts WHERE featured_image LIKE ?',
          [`%${req.file.originalname}%`]
        );
        if (existingImage.length > 0) {
          return res.status(400).json({ error: 'This photo was already uploaded before. Please choose another one.' });
        }
        featured_image = req.file.filename;
      }

      const tags = req.body['tags[]'] ? req.body['tags[]'].map(tag => parseInt(tag)) : [];

      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        const [result] = await conn.query(
          'INSERT INTO posts (user_id, title, content, featured_image, category_id, is_published, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [user_id, title, content, featured_image, category_id || null, is_published ? 1 : 0]
        );
        const postId = result.insertId;

        if (tags.length > 0) {
          const tagValues = tags.map(tag => [postId, tag]);
          await conn.query('INSERT INTO post_tags (post_id, tag_id) VALUES ?', [tagValues]);
        }

        await conn.commit();
        res.status(201).json({ id: postId, user_id, title, content, featured_image, is_published, category_id });
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }
];

exports.updatePost = [
  upload.single('featured_image'),
  async (req, res) => {
    const { id } = req.params;
    const { title, content, is_published, category_id } = req.body;
    const user_id = req.user.id;

    try {
      const [existing] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
      if (!existing.length) return res.status(404).json({ error: 'Post not found' });
      if (existing[0].user_id !== user_id) return res.status(403).json({ error: 'Not authorized' });

      let featured_image = existing[0].featured_image;
      if (req.file) {
        const [existingImage] = await db.query(
          'SELECT featured_image FROM posts WHERE featured_image LIKE ? AND id != ?',
          [`%${req.file.originalname}%`, id]
        );
        if (existingImage.length > 0) {
          return res.status(400).json({ error: 'This photo was already uploaded before. Please choose another one.' });
        }
        featured_image = req.file.filename;
      }

      const tags = req.body['tags[]'] ? req.body['tags[]'].map(tag => parseInt(tag)) : [];

      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        await conn.query(
          'UPDATE posts SET title = ?, content = ?, featured_image = ?, category_id = ?, is_published = ?, updated_at = NOW() WHERE id = ?',
          [title, content, featured_image, category_id || null, is_published ? 1 : 0, id]
        );

        await conn.query('DELETE FROM post_tags WHERE post_id = ?', [id]);
        if (tags.length > 0) {
          const tagValues = tags.map(tag => [id, tag]);
          await conn.query('INSERT INTO post_tags (post_id, tag_id) VALUES ?', [tagValues]);
        }

        await conn.commit();
        const [updatedPost] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
        res.json(updatedPost[0]);
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update post' });
    }
  }
];

// Keep other exports (getAllPosts, getPostById, deletePost, incrementView) as they are

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT p.*, u.username, u.profile_photo,
             c.name AS category,
             GROUP_CONCAT(t.name) AS tags,
             COALESCE(l.like_count, 0) AS likes,
             COALESCE(com.comment_count, 0) AS comments
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN post_tags pt ON pt.post_id = p.id
      LEFT JOIN tags t ON t.id = pt.tag_id
      LEFT JOIN (SELECT post_id, COUNT(id) AS like_count FROM likes GROUP BY post_id) l ON l.post_id = p.id
      LEFT JOIN (SELECT post_id, COUNT(id) AS comment_count FROM comments GROUP BY post_id) com ON com.post_id = p.id
      WHERE p.is_published = 1
      GROUP BY p.id
    `);
    const [tags] = await db.query(`
      SELECT pt.post_id, GROUP_CONCAT(t.name) AS tags
      FROM post_tags pt
      JOIN tags t ON t.id = pt.tag_id
      GROUP BY pt.post_id
    `);
    const postsWithTags = posts.map(p => ({
      ...p,
      tags: tags.find(t => t.post_id === p.id)?.tags || ''
    }));
    res.json(postsWithTags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};
// Get post by ID (updated similarly for counts; optionally include full comments here if for PostDetails page)
exports.getPostById = async (req, res) => {
  const postId = req.params.id;

  try {
    const [posts] = await db.query(`
      SELECT p.*, u.username, u.profile_photo,
             c.name AS category,
             GROUP_CONCAT(t.name) AS tags,
             COALESCE(l.like_count, 0) AS likes,
             COALESCE(com.comment_count, 0) AS comments
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN post_tags pt ON pt.post_id = p.id
      LEFT JOIN tags t ON t.id = pt.tag_id
      LEFT JOIN (SELECT post_id, COUNT(id) AS like_count FROM likes GROUP BY post_id) l ON l.post_id = p.id
      LEFT JOIN (SELECT post_id, COUNT(id) AS comment_count FROM comments GROUP BY post_id) com ON com.post_id = p.id
      WHERE p.id = ?
      GROUP BY p.id
    `, [postId]);
    if (posts.length === 0) return res.status(404).json({ error: 'Post not found' });

    const [tags] = await db.query(`
      SELECT t.id, t.name
      FROM tags t
      JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
    `, [postId]);

    res.json({ ...posts[0], tags: tags.map(t => t.name).join(',') });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// Delete post
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

// ... existing imports and functions ...

// In PostController.js
exports.incrementView = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE posts SET views = views + 1 WHERE id = ?', [id]);
    const [post] = await db.query('SELECT views FROM posts WHERE id = ?', [id]);
    res.json({ views: post[0].views });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to increment view' });
  }
};