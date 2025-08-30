const db = require('../config/db');

exports.getAllTags = async (req, res) => {
  console.log('GET /api/tags called'); 
  try {
    const [tags] = await db.query('SELECT * FROM tags ORDER BY name ASC');
    res.status(200).json(tags);
  } catch (err) {
    console.error('Failed to fetch tags:', err);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
};

exports.getTagById = async (req, res) => {
  const tagId = req.params.id;

  try {
    const [tags] = await db.query('SELECT * FROM tags WHERE id = ?', [tagId]);

    if (tags.length === 0) return res.status(404).json({ error: 'Tag not found' });

    res.status(200).json(tags[0]);
  } catch (err) {
    console.error('Failed to fetch tag:', err);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
};

exports.createTag = async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Tag name is required' });

  try {
    const [result] = await db.query(
      'INSERT INTO tags (name) VALUES (?)',
      [name]
    );

    res.status(201).json({ message: 'Tag created', tagId: result.insertId });
  } catch (err) {
    console.error('Failed to create tag:', err);
    res.status(500).json({ error: 'Failed to create tag' });
  }
};

exports.updateTag = async (req, res) => {
  const tagId = req.params.id;
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: 'Tag name is required' });

  try {
    const [existing] = await db.query('SELECT * FROM tags WHERE id = ?', [tagId]);
    if (!existing.length) return res.status(404).json({ error: 'Tag not found' });

    await db.query('UPDATE tags SET name = ? WHERE id = ?', [name, tagId]);

    res.json({ message: 'Tag updated' });
  } catch (err) {
    console.error('Failed to update tag:', err);
    res.status(500).json({ error: 'Failed to update tag' });
  }
};


exports.deleteTag = async (req, res) => {
  const tagId = req.params.id;

  try {
    const [existing] = await db.query('SELECT * FROM tags WHERE id = ?', [tagId]);
    if (!existing.length) return res.status(404).json({ error: 'Tag not found' });

    await db.query('DELETE FROM tags WHERE id = ?', [tagId]);

    res.json({ message: 'Tag deleted' });
  } catch (err) {
    console.error('Failed to delete tag:', err);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
};
