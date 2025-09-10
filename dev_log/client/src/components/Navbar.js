import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      // Clear all relevant local storage items
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('likedPosts'); // Clear likes if used elsewhere
      localStorage.removeItem('bookmarkedPosts'); // Clear bookmarks if used elsewhere
      setUser(null);
      // Navigate and force reload
      navigate('/');
      window.location.reload(); // Force a full page refresh
    } catch (err) {
      console.error('Logout failed:', err);
      // Clear local storage and reload even if server call fails
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('likedPosts');
      localStorage.removeItem('bookmarkedPosts');
      setUser(null);
      navigate('/');
      window.location.reload();
    }
  };

  const handleCreate = () => {
    navigate('/create-post');
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  const handleSettings = () => {
    navigate('/settings'); 
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">DevLog</span>
      </div>

      <div className="navbar-center">
        <input
          type="text"
          className="search-bar"
          placeholder="Search logs..."
        />
      </div>

      <div className="navbar-right">
        {user ? (
          <div className="user-info">
            <button className="nav-button create-post" onClick={handleCreate}>
              Create Post
            </button>

            <div className="dropdown">
              <img
  src={user && user.profile_photo 
    ? `http://localhost:5000/uploads/${user.profile_photo}` 
    : "/default.jpg"}
  alt="Profile"
  className="profile-pic"
  onClick={toggleDropdown}
/>


              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-username">@{user.username}</div>
                  <button onClick={handleCreate}>Create Post</button>
                  <button onClick={handleSettings}>Settings</button>
                  <button className="signout-btn" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <button
              className="nav-button"
              onClick={() => navigate('/auth?mode=login')}
            >
              Login
            </button>
            <button
              className="nav-button primary"
              onClick={() => navigate('/auth?mode=register')}
            >
              Create Account
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;