import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import "../styles/homepage.css";
import { FaEye, FaHeart, FaRegHeart, FaComment, FaBookmark, FaRegBookmark, FaEllipsisV } from "react-icons/fa";

function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(() => {
    const savedLikes = localStorage.getItem('likedPosts');
    return savedLikes ? JSON.parse(savedLikes) : [];
  });
  const [bookmarkedPosts, setBookmarkedPosts] = useState(() => {
    const savedBookmarks = localStorage.getItem('bookmarkedPosts');
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  });
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [showOptions, setShowOptions] = useState({});
  const [showDeletePopup, setShowDeletePopup] = useState(null);
  const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null;
  const optionsRef = useRef({});
  const popupRef = useRef(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/posts")
      .then(res => {
        console.log("Fetched posts:", res.data);
        setPosts(res.data);
      })
      .catch(err => {
        console.error('Failed to fetch posts:', err);
        setError({ global: 'Failed to load posts. Please try again.' });
      });

    const handleClickOutside = (e) => {
      Object.keys(showOptions).forEach(postId => {
        if (showOptions[postId] && optionsRef.current[postId] && !optionsRef.current[postId].contains(e.target)) {
          setShowOptions(prev => ({ ...prev, [postId]: false }));
        }
      });
      if (showDeletePopup && popupRef.current && !popupRef.current.contains(e.target)) {
        setShowDeletePopup(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOptions, showDeletePopup]);

  const toggleLike = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError(prev => ({ ...prev, [postId]: 'Please sign in to like this post' }));
      return;
    }

    setLoading(prev => ({ ...prev, [postId]: true }));
    setError(prev => ({ ...prev, [postId]: null }));
    try {
      const res = await axios.post(
        `http://localhost:5000/api/likes/${postId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newLikedPosts = res.data.liked 
        ? [...likedPosts, postId] 
        : likedPosts.filter(id => id !== postId);
      setLikedPosts(newLikedPosts);
      localStorage.setItem('likedPosts', JSON.stringify(newLikedPosts));
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: res.data.liked ? (post.likes || 0) + 1 : (post.likes || 0) - 1 } : post
      ));
    } catch (err) {
      console.error('Failed to toggle like:', err);
      setError(prev => ({ ...prev, [postId]: 'Failed to toggle like' }));
    } finally {
      setLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleBookmark = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError(prev => ({ ...prev, [postId]: 'Please sign in to bookmark this post' }));
      return;
    }

    setLoading(prev => ({ ...prev, [postId]: true }));
    setError(prev => ({ ...prev, [postId]: null }));
    try {
      const res = await axios.post(
        `http://localhost:5000/api/bookmarks/${postId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newBookmarkedPosts = res.data.bookmarked 
        ? [...bookmarkedPosts, postId] 
        : bookmarkedPosts.filter(id => id !== postId);
      setBookmarkedPosts(newBookmarkedPosts);
      localStorage.setItem('bookmarkedPosts', JSON.stringify(newBookmarkedPosts));
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      setError(prev => ({ ...prev, [postId]: 'Failed to toggle bookmark' }));
    } finally {
      setLoading(prev => ({ ...prev, [postId]: false }));
    }
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
      setError(prev => ({ ...prev, [postId]: 'Please sign in to comment on this post' }));
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
      setError(prev => ({ ...prev, [postId]: err.response?.status === 401 ? 'Please sign in to comment' : err.response?.data?.error || 'Failed to add comment' }));
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

  const handleOptionsToggle = (postId, e) => {
    e.stopPropagation();
    setShowOptions(prev => {
      const newState = { [postId]: !prev[postId] };
      Object.keys(prev).forEach(id => id !== postId && (newState[id] = false));
      return newState;
    });
  };

  const handleDelete = async (postId) => {
    setShowDeletePopup(postId);
  };

  const confirmDelete = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError(prev => ({ ...prev, [postId]: 'Please sign in to delete this post' }));
      setShowDeletePopup(null);
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(prev => prev.filter(post => post.id !== postId));
      setShowDeletePopup(null);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete post:', err);
      setError(prev => ({ ...prev, [postId]: 'Failed to delete post' }));
      setShowDeletePopup(null);
    }
  };

  const cancelDelete = (postId) => {
    setShowDeletePopup(null);
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
              const lastComment = postComments.length > 0 ? postComments[0] : null;
              const isOwner = userId && post.user_id === userId;

              return (
                <div key={post.id} className="post-card">
                  <Link to={`/posts/${post.id}`} className="post-link">
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
                    <h1>{post.title}</h1>
                    {post.content && <p>{post.content.substring(0, 150)}...</p>}
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
                      className={`bookmark-btn ${bookmarkedPosts.includes(post.id) ? "bookmarked" : ""}`} 
                      onClick={() => toggleBookmark(post.id)}
                    >
                      {bookmarkedPosts.includes(post.id) ? <FaBookmark /> : <FaRegBookmark />} 
                    </span>
                    <span 
                      className={`comment-btn ${error[post.id] ? 'disabled' : ''}`} 
                      onClick={(e) => !error[post.id] && toggleComments(post.id, e)}
                    >
                      <FaComment /> {post.comments || 0}
                    </span>
                    {isOwner && (
                      <span 
                        ref={el => optionsRef.current[post.id] = el}
                        className="options-btn" 
                        onClick={(e) => handleOptionsToggle(post.id, e)}
                      >
                        <FaEllipsisV />
                        {showOptions[post.id] && (
                          <div className="options-dropdown">
                            <button onClick={() => navigate(`/create-post`, { state: { post } })}>Edit</button>
                            <button onClick={() => handleDelete(post.id)}>Delete</button>
                          </div>
                        )}
                      </span>
                    )}
                  </div>

                  {error[post.id] && (
                    <p className="error-message">{error[post.id]}</p>
                  )}

                  {!showComments[post.id] && lastComment && (
                    <div className="last-comment-preview" onClick={(e) => e.stopPropagation()}>
                      <img
                         src={lastComment.profile_photo ? `http://localhost:5000/uploads/${lastComment.profile_photo}` : "/default.jpg"}
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
                                    src={comment.profile_photo ? `http://localhost:5000/uploads/${comment.profile_photo}` : "/default.jpg"}
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

        {showDeletePopup && (
          <div className="delete-popup" ref={popupRef}>
            <div className="popup-content">
              <h3>Are you sure you want to delete this post?</h3>
              <div className="popup-buttons">
                <button onClick={() => confirmDelete(showDeletePopup)}>Yes, I'm sure</button>
                <button onClick={() => cancelDelete(showDeletePopup)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;