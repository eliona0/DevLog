const db = require('../config/db');

const LikeModel = {
  create: async (postId, userId) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.execute(
        `INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, NOW())`,
        [postId, userId]
      );

      const likeId = result.insertId;

      const [newLike] = await conn.execute(
        `SELECT * FROM likes WHERE id = ?`,
        [likeId]
      );

      await conn.commit();
      return newLike[0];
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  delete: async (postId, userId) => {
    const [result] = await db.execute(
      `DELETE FROM likes WHERE post_id = ? AND user_id = ?`,
      [postId, userId]
    );
    return result.affectedRows > 0;
  },

  getByPostAndUser: async (postId, userId) => {
    const [rows] = await db.execute(
      `SELECT * FROM likes WHERE post_id = ? AND user_id = ?`,
      [postId, userId]
    );
    return rows[0];
  }
};

module.exports = LikeModel;