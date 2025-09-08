const db = require('../config/db');

const CommentModel = {
  create: async (postId, userId, commentText) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.execute(
        `INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)`,
        [postId, userId, commentText]
      );

      const commentId = result.insertId;

      const [newComment] = await conn.execute(`
        SELECT c.*, u.username, u.profile_photo 
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `, [commentId]);

      await conn.commit();
      return newComment[0];
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  getByPostId: async (postId) => {
    const [rows] = await db.execute(`
      SELECT c.*, u.username, u.profile_photo
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [postId]);
    return rows;
  }
};

module.exports = CommentModel;