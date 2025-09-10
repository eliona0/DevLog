const db = require('../config/db');

const BookmarkModel = {
  create: async (postId, userId) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.execute(
        `INSERT INTO bookmarks (post_id, user_id, created_at) VALUES (?, ?, NOW())`,
        [postId, userId]
      );

      const bookmarkId = result.insertId;

      const [newBookmark] = await conn.execute(
        `SELECT * FROM bookmarks WHERE id = ?`,
        [bookmarkId]
      );

      await conn.commit();
      return newBookmark[0];
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  delete: async (postId, userId) => {
    const [result] = await db.execute(
      `DELETE FROM bookmarks WHERE post_id = ? AND user_id = ?`,
      [postId, userId]
    );
    return result.affectedRows > 0;
  },

  getByPostAndUser: async (postId, userId) => {
    const [rows] = await db.execute(
      `SELECT * FROM bookmarks WHERE post_id = ? AND user_id = ?`,
      [postId, userId]
    );
    return rows[0];
  }
};

module.exports = BookmarkModel;