const LikeModel = require('../models/LikeModel');
const db = require('../config/db');

exports.toggleLike = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const existingLike = await LikeModel.getByPostAndUser(postId, userId);
    if (existingLike) {
      const deleted = await LikeModel.delete(postId, userId);
      if (deleted) {
        return res.status(200).json({ message: 'Like removed', liked: false });
      }
    } else {
      const newLike = await LikeModel.create(postId, userId);
      return res.status(201).json({ message: 'Like added', liked: true });
    }
  } catch (err) {
    console.error('Error toggling like:', err.stack);
    res.status(500).json({ error: 'Failed to toggle like', details: err.message });
  }
};