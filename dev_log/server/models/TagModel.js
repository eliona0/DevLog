const db = require('../config/db');

const TagModel = {
  // Get all tags
  getAll: async () => {
    const [rows] = await db.execute(`
      SELECT id, name
      FROM tags
      ORDER BY name ASC
    `);
    return rows;
  },

  // Find a single tag by ID
  findById: async (id) => {
    const [rows] = await db.execute(`
      SELECT id, name
      FROM tags
      WHERE id = ?
    `, [id]);
    return rows[0];
  },

  // Create a new tag
  create: async (name) => {
    const [result] = await db.execute(`
      INSERT INTO tags (name)
      VALUES (?)
    `, [name]);
    return result;
  },

  // Update a tag
  update: async (id, name) => {
    const [result] = await db.execute(`
      UPDATE tags
      SET name = ?
      WHERE id = ?
    `, [name, id]);
    return result;
  },

  // Delete a tag
  delete: async (id) => {
    const [result] = await db.execute(`
      DELETE FROM tags
      WHERE id = ?
    `, [id]);
    return result;
  }
};

module.exports = TagModel;
