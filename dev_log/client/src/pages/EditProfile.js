import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/editProfile.css";

function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [formData, setFormData] = useState({
    username: "",
    profile_photo: "",
    email: "",
    fullName: "",
    role: "",
    bio: "",
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }

    axios
      .get("http://localhost:5000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const user = res.data;

       setFormData({
  id: user.id,
  username: user.username,
  profile_photo: user.profile_photo,
  email: user.email,
  fullName: user.fullName || user.full_name || "",
  role: user.role,
  bio: user.bio || "",
});


        if (user.profile_photo) {
          setPreview(`http://localhost:5000/uploads/${user.profile_photo}`);
        }
      })
      .catch((err) => console.error("Error fetching user:", err))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profile_photo") {
      const file = files[0];
      setFormData({ ...formData, profile_photo: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData();
  
  Object.entries(formData).forEach(([key, value]) => {
    if (key === "profile_photo" && value instanceof File) {
      data.append(key, value); // append actual file
    } else {
      data.append(key, value);
    }
  });

  try {
    await axios.put("http://localhost:5000/api/user", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Profile updated successfully!");
    navigate("/profile");
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Failed to update profile.");
  }
};


  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <div className="edit-profile-container light-theme">
      <h2>Edit Profile</h2>

      {/* ---- PROFILE PHOTO SECTION ---- */}
      <div className="photo-section">
        <div className="photo-wrapper" onClick={() => fileInputRef.current.click()}>
          <img
            src={preview || "/default-avatar.png"}
            className="photo-preview"
            alt="Profile"
          />
          <div className="photo-overlay">+</div>
        </div>

        <input
          type="file"
          name="profile_photo"
          ref={fileInputRef}
          onChange={handleChange}
          style={{ display: "none" }}
        />
      </div>

      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="writer">Writer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            name="bio"
            rows="4"
            value={formData.bio}
            onChange={handleChange}
          ></textarea>
        </div>

        <button type="submit" className="save-btn">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditProfile;
