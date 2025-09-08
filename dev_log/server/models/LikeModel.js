const pool = require('../config/db'); // your mysql pool

class Like {
  static async getLikes(postId) {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS count FROM likes WHERE post_id = ?",
      [postId]
    );
    return rows[0].count;
  }

  static async userLiked(postId, userId) {
    const [rows] = await pool.query(
      "SELECT * FROM likes WHERE post_id = ? AND user_id = ?",
      [postId, userId]
    );
    return rows.length > 0;
  }

static async addLike(postId, userId) {
  try {
    await pool.query(
      "INSERT INTO likes (post_id, user_id) VALUES (?, ?)",
      [postId, userId]
    );
    return true;
  } catch (err) {
    console.error("Error adding like:", err);
    throw err; // This will propagate to your controller
  }
}


static async removeLike(postId, userId) {
  try {
    await pool.query(
      "DELETE FROM likes WHERE post_id = ? AND user_id = ?",
      [postId, userId]
    );
    return false;
  } catch (err) {
    console.error("Error removing like:", err);
    throw err;
  }
}


  static async toggleLike(postId, userId) {
    const liked = await this.userLiked(postId, userId);
    if (liked) {
      return this.removeLike(postId, userId);
    } else {
      return this.addLike(postId, userId);
    }
  }
}

module.exports = Like;
