const db = require('../config/db');

const PostModel = {
  create: async (userId, title, content, featuredImage, categoryId, isPublished) => {
    const [result] = await db.execute(
      `INSERT INTO posts 
       (user_id, title, content, featured_image, category_id, is_published) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, title, content, featuredImage, categoryId, isPublished]
    );
    return result;
  },

  getAll: async () => {
    const [rows] = await db.execute(`
      SELECT posts.*, users.username, categories.name AS category_name
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN categories ON posts.category_id = categories.id
      ORDER BY posts.created_at DESC
    `);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.execute(`
      SELECT posts.*, users.username, categories.name AS category_name
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN categories ON posts.category_id = categories.id
      WHERE posts.id = ?
    `, [id]);
    return rows[0];
  },

  update: async (id, title, content, featuredImage, categoryId, isPublished) => {
    const [result] = await db.execute(`
      UPDATE posts
      SET title = ?, content = ?, featured_image = ?, category_id = ?, is_published = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, content, featuredImage, categoryId, isPublished, id]);
    return result;
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM posts WHERE id = ?', [id]);
    return result;
  }
};

module.exports = PostModel;
