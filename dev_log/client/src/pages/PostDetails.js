import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles/postdetails.css"; // Create this for styling
import { FaEye, FaHeart, FaRegHeart, FaComment, FaBookmark, FaRegBookmark } from "react-icons/fa";

function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false); // New state for bookmark
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`);
        console.log("Fetched post:", res.data); // Debug
        setPost(res.data);
        // Check if the post is liked and bookmarked by the user
        const token = localStorage.getItem('token');
        if (token) {
          const likeResponse = await axios.get(
            `http://localhost:5000/api/likes/check/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsLiked(likeResponse.data.liked);

          const bookmarkResponse = await axios.get(
            `http://localhost:5000/api/bookmarks/check/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsBookmarked(bookmarkResponse.data.bookmarked);
        }
      } catch (err) {
        console.error('Failed to fetch post:', err);
      }
    };

    const incrementView = async () => {
      try {
        await axios.put(`http://localhost:5000/api/posts/${id}/view`);
      } catch (err) {
        console.error('Failed to increment view:', err);
      }
    };

    fetchPost();
    incrementView();
  }, [id]);

  const toggleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in to like this post');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/likes/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLiked(res.data.liked);
      setPost(prev => ({
        ...prev,
        likes: res.data.liked ? (prev.likes || 0) + 1 : (prev.likes || 0) - 1
      }));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in to bookmark this post');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/bookmarks/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsBookmarked(res.data.bookmarked);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = async () => {
    setShowComments(prev => !prev);
    if (!showComments && comments.length === 0) {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/${id}`);
        setComments(res.data);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
        alert(err.response?.data?.error || 'Failed to load comments');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please sign in to comment on this post');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `http://localhost:5000/api/comments/${id}`,
        { comment: newComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await axios.get(`http://localhost:5000/api/comments/${id}`);
      setComments(res.data);
      setPost(prev => ({ ...prev, comments: (prev.comments || 0) + 1 }));
      setNewComment("");
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert(err.response?.status === 401 ? 'Please sign in to comment' : 'Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffMs = now - commentDate;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffHours < 1) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else if (diffWeeks < 52) {
      return `${diffWeeks}w ago`;
    } else {
      const options = { day: "numeric", month: "short" };
      return commentDate.toLocaleDateString("en-GB", options);
    }
  };


  if (!post) return <div>Loading...</div>;

  return (
    <div className="container">
      <div className="post-details">
        <div className="post-header">
          <img
  src={post.profile_photo ? `http://localhost:5000/uploads/${post.profile_photo}` : "/default.jpg"}
            alt="profile"
            className="profile-pic"
          />
          <div className="user">
            <h5>{post.username}</h5>
            <small>{formatDate(post.created_at)}</small>
          </div>
        </div>
        {post.featured_image && (
          <img
            src={`http://localhost:5000/uploads/${post.featured_image}`}
            alt="featured"
            className="featured-image"
          />
        )}
        <h1>{post.title}</h1>
        {post.content && <p>{post.content}</p>} {/* Full content */}
        <p className="tags">
          {post.tags?.split(",").map(tag => (
            <span key={tag} className="tag">#{tag.trim()}</span>
          ))}
        </p>
        <div className="post-stats">
          <span><FaEye /> {post.views || 0}</span>
          <span 
            className={`like-btn ${isLiked ? "liked" : ""}`} 
            onClick={toggleLike}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />} {post.likes || 0}
          </span>
          <span 
            className={`bookmark-btn ${isBookmarked ? "bookmarked" : ""}`} 
            onClick={toggleBookmark}
          >
            {isBookmarked ? <FaBookmark /> : <FaRegBookmark />} 
          </span>
          <span 
            className="comment-btn" 
            onClick={toggleComments}
          >
            <FaComment /> {post.comments || 0}
          </span>
        </div>
        {error && <p className="error-message">{error}</p>}

        {showComments && (
          <div className="comments-section">
            {loading ? (
              <p>Loading comments...</p>
            ) : (
              <>
                <div className="comments-list">
                  {comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment.id} className="comment">
                        <img
                          src={comment.profile_photo || "/default.png"}
                          alt="profile"
                          className="profile-pic small"
                        />
                        <div className="comment-content">
                          <h6>{comment.username}</h6>
                          <p>{comment.comment}</p>
                          <small>{formatDate(comment.created_at)}</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No comments yet. Be the first to comment!</p>
                  )}
                </div>
                <form onSubmit={handleAddComment} className="add-comment-form">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows="3"
                    required
                  />
                  <button type="submit" disabled={loading}>
                    {loading ? 'Posting...' : 'Comment'}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PostDetails;