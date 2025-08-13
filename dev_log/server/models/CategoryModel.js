const db = require('../config/db');

const CategoryModel = {
  getAll: async () => {
    const [rows] = await db.execute('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (name, description) => {
    const [result] = await db.execute(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    return result;
  },

  update: async (id, name, description) => {
    const [result] = await db.execute(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    return result;
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    return result;
  }
};

module.exports = CategoryModel;
