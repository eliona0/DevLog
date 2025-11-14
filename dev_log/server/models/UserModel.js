const db = require('../config/db');

const UserModel = {
  create: async (username, email, password, fullName, role, bio) => {
    const defaultProfile = 'profile_photos/default.jpg';
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, fullName, role, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, password, fullName, role, bio, defaultProfile]
    );
    return result;
  },

  findByEmail: async (email) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },
  
  findByUsername: async (username) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  // ✅ FIXED: updateUser inside the object
  updateUser: async (id, username, email, fullName, bio) => {
    const [result] = await db.execute(
      'UPDATE users SET username = ?, email = ?, fullName = ?, bio = ? WHERE id = ?',
      [username, email, fullName, bio, id]
    );
    return result;
  }
};

module.exports = UserModel;
