import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/homepage.css";
import {
  FaEye,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaBookmark,
  FaRegBookmark,
  FaSearch,
  FaUser,
  FaSignOutAlt,
  FaPlus,
  FaHome,
} from "react-icons/fa";

function HomePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(() => {
    const savedLikes = localStorage.getItem("likedPosts");
    return savedLikes ? JSON.parse(savedLikes) : [];
  });
  const [bookmarkedPosts, setBookmarkedPosts] = useState(() => {
    const savedBookmarks = localStorage.getItem("bookmarkedPosts");
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  });
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [popularPosts, setPopularPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch posts
    axios
      .get("http://localhost:5000/api/posts")
      .then((res) => {
        console.log("Fetched posts:", res.data);

        // Sort by date (newest first)
        const sortedByDate = [...res.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setPosts(sortedByDate);
        setFilteredPosts(sortedByDate);

        // Popular posts (top 5 by likes)
        const sortedByLikes = [...res.data]
          .sort((a, b) => (b.likes || 0) - (a.likes || 0))
          .slice(0, 5);
        setPopularPosts(sortedByLikes);

        // Recent posts (latest 3)
        const recent = sortedByDate.slice(0, 3);
        setRecentPosts(recent);

        // Trending tags (top 5 by frequency)
        const tagMap = {};
        res.data.forEach((post) => {
          if (post.tags) {
            post.tags.split(",").forEach((tag) => {
              const trimmed = tag.trim();
              tagMap[trimmed] = (tagMap[trimmed] || 0) + 1;
            });
          }
        });
        const sortedTags = Object.entries(tagMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        setTrendingTags(sortedTags);
      })
      .catch((err) => {
        console.error("Failed to fetch posts:", err);
        setError({ global: "Failed to load posts. Please try again." });
      });

    // Fetch user data if logged in
    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      axios
        .get("http://localhost:5000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUserData(res.data))
        .catch((err) => console.error("Failed to fetch user data:", err));
    }
  }, [isLoggedIn]);

  // Handle search and tag filtering
  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(lowerQuery) ||
          (post.content && post.content.toLowerCase().includes(lowerQuery)) ||
          (post.tags && post.tags.toLowerCase().includes(lowerQuery))
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [searchQuery, posts]);

  const toggleLike = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError((prev) => ({
        ...prev,
        [postId]: "Please sign in to like this post",
      }));
      return;
    }

    setLoading((prev) => ({ ...prev, [postId]: true }));
    setError((prev) => ({ ...prev, [postId]: null }));
    try {
      const res = await axios.post(
        `http://localhost:5000/api/likes/${postId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newLikedPosts = res.data.liked
        ? [...likedPosts, postId]
        : likedPosts.filter((id) => id !== postId);
      setLikedPosts(newLikedPosts);
      localStorage.setItem("likedPosts", JSON.stringify(newLikedPosts));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: res.data.liked
                  ? (post.likes || 0) + 1
                  : (post.likes || 0) - 1,
              }
            : post
        )
      );
      setFilteredPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: res.data.liked
                  ? (post.likes || 0) + 1
                  : (post.likes || 0) - 1,
              }
            : post
        )
      );
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setError((prev) => ({ ...prev, [postId]: "Failed to toggle like" }));
    } finally {
      setLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const toggleBookmark = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError((prev) => ({
        ...prev,
        [postId]: "Please sign in to bookmark this post",
      }));
      return;
    }

    setLoading((prev) => ({ ...prev, [postId]: true }));
    setError((prev) => ({ ...prev, [postId]: null }));
    try {
      const res = await axios.post(
        `http://localhost:5000/api/bookmarks/${postId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newBookmarkedPosts = res.data.bookmarked
        ? [...bookmarkedPosts, postId]
        : bookmarkedPosts.filter((id) => id !== postId);
      setBookmarkedPosts(newBookmarkedPosts);
      localStorage.setItem(
        "bookmarkedPosts",
        JSON.stringify(newBookmarkedPosts)
      );
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
      setError((prev) => ({
        ...prev,
        [postId]: "Failed to toggle bookmark",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = async (postId, e) => {
    e.stopPropagation();
    const isCurrentlyShown = showComments[postId];
    const newShowState = !isCurrentlyShown;
    setShowComments((prev) => ({ ...prev, [postId]: newShowState }));

    if (newShowState && !comments[postId]) {
      setLoading((prev) => ({ ...prev, [postId]: true }));
      setError((prev) => ({ ...prev, [postId]: null }));
      try {
        const res = await axios.get(
          `http://localhost:5000/api/comments/${postId}`
        );
        setComments((prev) => ({ ...prev, [postId]: res.data }));
      } catch (err) {
        console.error("Failed to fetch comments for post", postId, ":", err);
        setError((prev) => ({
          ...prev,
          [postId]:
            err.response?.data?.error || "Failed to load comments",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const commentText = newComment[postId]?.trim();
    if (!commentText) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError((prev) => ({
        ...prev,
        [postId]: "Please sign in to comment on this post",
      }));
      return;
    }

    setLoading((prev) => ({ ...prev, [postId]: true }));
    setError((prev) => ({ ...prev, [postId]: null }));
    try {
      await axios.post(
        `http://localhost:5000/api/comments/${postId}`,
        { comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await axios.get(
        `http://localhost:5000/api/comments/${postId}`
      );
      setComments((prev) => ({ ...prev, [postId]: res.data }));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments: (post.comments || 0) + 1 }
            : post
        )
      );
      setFilteredPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, comments: (post.comments || 0) + 1 }
            : post
        )
      );
      setNewComment((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Failed to add comment for post", postId, ":", err);
      setError((prev) => ({
        ...prev,
        [postId]:
          err.response?.status === 401
            ? "Please sign in to comment"
            : err.response?.data?.error || "Failed to add comment",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [postId]: false }));
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

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          "/api/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
      // Clear all relevant local storage items
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("likedPosts");
      localStorage.removeItem("bookmarkedPosts");
      setIsLoggedIn(false);
      setUserData(null);
      setLikedPosts([]);
      setBookmarkedPosts([]);
      // Navigate and force reload
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
      // Fallback: clear local storage anyway
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("likedPosts");
      localStorage.removeItem("bookmarkedPosts");
      setIsLoggedIn(false);
      setUserData(null);
      setLikedPosts([]);
      setBookmarkedPosts([]);
      navigate("/");
      window.location.reload();
    }
  };

  if (error.global) {
    return (
      <div className="container">
        <p className="error">{error.global}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="homepage">
        <div className="layer left-layer">
          <h2>Explore DevLog</h2>
          <div className="search-bar">
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search posts or tags..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <ul className="nav-menu">
            <li><Link to="/"><FaHome /> Home</Link></li>
            {isLoggedIn && (
              <>
                <li><Link to="/create-post"><FaPlus /> Create Post</Link></li>
                <li><Link to="/bookmarks"><FaBookmark /> Bookmarks</Link></li>
                <li><Link to="/profile"><FaUser /> Profile</Link></li>
                <li><button className="signout-btn" onClick={handleLogout}><FaSignOutAlt /> Sign Out</button></li>
              </>
            )}
            {/* {!isLoggedIn && (
              <li><Link to="/login">Login / Sign Up</Link></li>
            )} */}
          </ul>
        </div>

        <div className="layer middle-layer">
          {filteredPosts.length === 0 && !loading.global ? (
            <p>No posts found. Try a different search or create one!</p>
          ) : (
            filteredPosts.map(post => {
              const postComments = comments[post.id] || [];
              const lastComment = postComments.length > 0 ? postComments[0] : null;

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
                        <span key={tag} className="tag" onClick={() => handleTagClick(tag.trim())}>
                          #{tag.trim()}
                        </span>
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
          <h2>Popular Posts</h2>
          <ul className="popular-list">
            {popularPosts.map(post => (
              <li key={post.id}>
                <Link to={`/posts/${post.id}`}>
                  <h3>{post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title}</h3>
                  <span><FaHeart /> {post.likes || 0}</span>
                </Link>
              </li>
            ))}
          </ul>
          <h2>Recent Posts</h2>
          <ul className="popular-list">
            {recentPosts.map(post => (
              <li key={post.id}>
                <Link to={`/posts/${post.id}`}>
                  <h3>{post.title.length > 50 ? post.title.substring(0, 50) + '...' : post.title}</h3>
                  <span><FaEye /> {post.views || 0}</span>
                </Link>
              </li>
            ))}
          </ul>
          <h2>Trending Tags</h2>
          <div className="tags-cloud">
            {trendingTags.map(([tag, count]) => (
              <span 
                key={tag} 
                className="tag" 
                style={{ fontSize: `${1 + count * 0.2}rem` }} 
                onClick={() => handleTagClick(tag)}
              >
                #{tag} ({count})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;