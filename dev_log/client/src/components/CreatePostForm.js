import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/createpostform.css';

function CreatePostForm() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    featured_image: '',
    category_id: '',
    is_published: false,
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('token'); // get token saved at login

  if (!token) {
    alert('You must be logged in to create a post.');
    return;
  }

  try {
    await axios.post(
      'http://localhost:5000/api/posts',
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert('Post created successfully!');
    // Reset form or do other things
  } catch (error) {
    console.error('Failed to create post:', error);
  }
};


  return (
    <div className="create-post-container">
      <h2>Create a New Post</h2>
      <form className="create-post-form" onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label>Content</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows="8"
          required
        />

        <label>Featured Image URL</label>
        <input
          type="text"
          name="featured_image"
          value={formData.featured_image}
          onChange={handleChange}
        />

        <label>Category</label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <div className="checkbox-wrapper">
          <input
            type="checkbox"
            name="is_published"
            checked={formData.is_published}
            onChange={handleChange}
          />
          <span>Publish immediately</span>
        </div>

        <button type="submit" className="submit-button">Post</button>
      </form>
    </div>
  );
}

export default CreatePostForm;
