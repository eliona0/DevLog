import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; 
import "../styles/homepage.css";
import { FaEye, FaHeart, FaRegHeart, FaComment } from "react-icons/fa";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  useEffect(() => {
    axios.get("http://localhost:5000/api/posts")
      .then(res => {
        console.log("Fetched posts:", res.data); // Debug: Log fetched posts
        setPosts(res.data);
      })
      .catch(err => {
        console.error('Failed to fetch posts:', err);
        setError({ global: 'Failed to load posts. Please try again.' });
      });
  }, []);

  const toggleLike = (postId) => {
    setLikedPosts(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
    // TODO: Implement API call to /api/likes/:postId
  };

  const toggleComments = async (postId, e) => {
    e.stopPropagation();
    const isCurrentlyShown = showComments[postId];
    const newShowState = !isCurrentlyShown;
    setShowComments(prev => ({ ...prev, [postId]: newShowState }));

    if (newShowState && !comments[postId]) {
      setLoading(prev => ({ ...prev, [postId]: true }));
      setError(prev => ({ ...prev, [postId]: null }));
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/${postId}`);
        setComments(prev => ({ ...prev, [postId]: res.data }));
      } catch (err) {
        console.error('Failed to fetch comments for post', postId, ':', err);
        setError(prev => ({ ...prev, [postId]: err.response?.data?.error || 'Failed to load comments' }));
      } finally {
        setLoading(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const commentText = newComment[postId]?.trim();
    if (!commentText) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError(prev => ({ ...prev, [postId]: 'You must be logged in to comment' }));
      return;
    }

    setLoading(prev => ({ ...prev, [postId]: true }));
    setError(prev => ({ ...prev, [postId]: null }));
    try {
      await axios.post(
        `http://localhost:5000/api/comments/${postId}`,
        { comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await axios.get(`http://localhost:5000/api/comments/${postId}`);
      setComments(prev => ({ ...prev, [postId]: res.data }));
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, comments: (post.comments || 0) + 1 } : post
      ));
      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Failed to add comment for post', postId, ':', err);
      setError(prev => ({ ...prev, [postId]: err.response?.data?.error || 'Failed to add comment' }));
    } finally {
      setLoading(prev => ({ ...prev, [postId]: false }));
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

  if (error.global) {
    return <div className="container"><p className="error">{error.global}</p></div>;
  }

  return (
    <div className="container">
      <div className="homepage">
        <div className="layer left-layer">
          <h1>Left</h1>
        </div>

        <div className="layer middle-layer">
          {posts.length === 0 && !loading.global ? (
            <p>No posts available. Create one to get started!</p>
          ) : (
            posts.map(post => {
              const postComments = comments[post.id] || [];
              const lastComment = postComments.length > 0 ? postComments[0] : null; // Most recent first

              return (
                <div key={post.id} className="post-card">
                  <Link to={`/posts/${post.id}`} className="post-link">
                    <div className="post-header">
                      <img
                        src={post.profile_photo || "/default.png"}
                        alt="profile"
                        className="profile-pic"
                      />
                      <div className="user">
                        <h5>{post.username}</h5>
                        <small>{formatDate(post.created_at)}</small>
                      </div>
                    </div>
                    <h1>{post.title}</h1>
                    {post.content && <p>{post.content.substring(0, 100)}...</p>}
                    <p className="tags">
                      {post.tags?.split(",").map(tag => (
                        <span key={tag} className="tag">#{tag.trim()}</span>
                      ))}
                    </p>
                  </Link>

                  <div className="post-stats" onClick={(e) => e.stopPropagation()}>
                    <span><FaEye /> {post.views || 0}</span>
                    <span 
                      className={`like-btn ${likedPosts.includes(post.id) ? "liked" : ""}`} 
                      onClick={() => toggleLike(post.id)}
                    >
                      {likedPosts.includes(post.id) ? <FaHeart /> : <FaRegHeart />} {post.likes || 0}
                    </span>
                    <span 
                      className={`comment-btn ${error[post.id] ? 'disabled' : ''}`} 
                      onClick={(e) => !error[post.id] && toggleComments(post.id, e)}
                    >
                      <FaComment /> {post.comments || 0}
                    </span>
                  </div>

                  {!showComments[post.id] && lastComment && (
                    <div className="last-comment-preview" onClick={(e) => e.stopPropagation()}>
                      <img
                        src={lastComment.profile_photo || "/default.png"}
                        alt="profile"
                        className="profile-pic small"
                      />
                      <div className="comment-content">
                        <h6>{lastComment.username}</h6>
                        <p>{lastComment.comment}</p>
                        <small>{formatDate(lastComment.created_at)}</small>
                      </div>
                    </div>
                  )}

                  {showComments[post.id] && (
                    <div className="comments-section" onClick={(e) => e.stopPropagation()}>
                      {loading[post.id] ? (
                        <p>Loading comments...</p>
                      ) : error[post.id] ? (
                        <p className="error">{error[post.id]}</p>
                      ) : (
                        <>
                          <div className="comments-list">
                            {postComments.length > 0 ? (
                              postComments.map(comment => (
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
                          <form onSubmit={(e) => handleAddComment(post.id, e)} className="add-comment-form">
                            <textarea
                              value={newComment[post.id] || ''}
                              onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                              placeholder="Add a comment..."
                              rows="3"
                              required
                              disabled={!!error[post.id]}
                            />
                            <button type="submit" disabled={loading[post.id] || !!error[post.id]}>
                              {loading[post.id] ? 'Posting...' : 'Comment'}
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="layer right-layer">
          <h1>Right</h1>
        </div>
      </div>
    </div>
  );
}

export default HomePage;