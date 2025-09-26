const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const db = require('../config/db');

// Get current user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, username, email, profile_photo, bio, created_at 
      FROM users WHERE id = ?
    `, [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (err) {
    console.error('Failed to fetch user:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

module.exports = router;