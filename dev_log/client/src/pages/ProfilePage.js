import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUserEdit } from "react-icons/fa";
import "../styles/profile.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/auth");
          return;
        }

        // Fetch user info
        const userRes = await axios.get("http://localhost:5000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        // Fetch user's posts
        const postsRes = await axios.get(
          `http://localhost:5000/api/posts/user/${userRes.data.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Error loading profile or posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPosts();
  }, [navigate]);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <p className="error">User not found.</p>;
  }

  return (
    <div className="profile-page">
      {/* ---- Top Section: Profile Info ---- */}
      <section className="profile-header">
        <div className="profile-banner"></div>

        <div className="profile-content">
          <img
            src={`http://localhost:5000/uploads/${user.profile_photo}`}
            alt={user.username}
            className="profile-photo"
          />
          <div className="profile-text">
            <h2 className="profile-name">
              {user.fullName || user.full_name || "Unnamed User"}
            </h2>
            <p className="profile-username">@{user.username}</p>
            <p className="profile-bio">{user.bio || "No bio added yet."}</p>

            <div className="profile-details">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Joined:</strong>{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={() => navigate("/edit-profile")}
              className="edit-btn"
            >
              <FaUserEdit /> Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* ---- Bottom Section: User Posts ---- */}
      <section className="user-posts-section">
        <h3 className="posts-title">
          {(user.fullName || user.full_name || "User") + "'s Posts"}
        </h3>
        {posts.length === 0 ? (
          <p className="no-posts">You haven’t posted anything yet.</p>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post.id} className="user-post-card">
                <Link to={`/posts/${post.id}`} className="post-link">
                  {post.featured_image && (
                    <img
                      src={`http://localhost:5000/uploads/${post.featured_image}`}
                      alt={post.title}
                      className="post-image"
                    />
                  )}
                  <h4 className="post-title">{post.title}</h4>
                  <p className="post-preview">
                    {post.content.slice(0, 100)}...
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
