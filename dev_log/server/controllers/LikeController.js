const Like = require('../models/LikeModel');

exports.getLikes = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.query.user_id;

  try {
    const totalLikes = await Like.getLikes(postId);
    const liked = userId ? await Like.userLiked(postId, userId) : false;

    res.json({ totalLikes, liked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.toggleLike = async (req, res) => {
  console.log("toggleLike called", req.params, req.body);
  const { postId } = req.params;
  const { user_id } = req.body;

  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  try {
    const liked = await Like.toggleLike(postId, user_id);
    const totalLikes = await Like.getLikes(postId);
    console.log("toggle result:", liked, "totalLikes:", totalLikes);
    res.json({ liked, totalLikes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

