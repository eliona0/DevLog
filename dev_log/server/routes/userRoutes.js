const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_photos');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user.id}${ext}`);
  }
});

const upload = multer({ storage });

// 🟢 Get logged-in user's profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, email, profile_photo, fullName, role, bio, created_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (err) {
    console.error('Failed to fetch user:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// 🟡 Update user profile
router.put('/', authenticateToken, upload.single('profile_photo'), async (req, res) => {
  try {
    const { fullName, bio } = req.body;
    const profilePhoto = req.file ? `uploads/profile_photos/${req.file.filename}` : null;

    const fields = [];
    const values = [];

    if (fullName) {
      fields.push('fullName = ?');
      values.push(fullName);
    }

    if (bio) {
      fields.push('bio = ?');
      values.push(bio);
    }

    if (profilePhoto) {
      fields.push('profile_photo = ?');
      values.push(profilePhoto);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No data provided to update' });
    }

    values.push(req.user.id);

    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Failed to update user:', err);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

module.exports = router;
