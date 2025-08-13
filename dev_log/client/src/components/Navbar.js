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

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
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
                src={user.profilePic || 'https://content.api.news/v3/images/bin/b06bef9a5f8153a24f4abb07cbc2c11e'}
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
