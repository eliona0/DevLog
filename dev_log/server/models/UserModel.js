const db = require('../config/db');

const UserModel = {
  create: async (username, email, password, fullName, role, bio) => {
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, fullName, role, bio) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, password, fullName, role, bio]
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
  }
};

module.exports = UserModel;
