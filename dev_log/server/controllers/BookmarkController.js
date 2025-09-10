const BookmarkModel = require('../models/BookmarkModel');
const db = require('../config/db');

exports.toggleBookmark = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const existingBookmark = await BookmarkModel.getByPostAndUser(postId, userId);
    if (existingBookmark) {
      const deleted = await BookmarkModel.delete(postId, userId);
      if (deleted) {
        return res.status(200).json({ message: 'Bookmark removed', bookmarked: false });
      }
    } else {
      const newBookmark = await BookmarkModel.create(postId, userId);
      return res.status(201).json({ message: 'Bookmark added', bookmarked: true });
    }
  } catch (err) {
    console.error('Error toggling bookmark:', err.stack);
    res.status(500).json({ error: 'Failed to toggle bookmark', details: err.message });
  }
};