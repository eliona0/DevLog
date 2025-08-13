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
    tags: [] // store selected tag IDs
  });

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    const fetchTags = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tags');
        setTags(res.data);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };

    fetchCategories();
    fetchTags();
  }, []);

const handleChange = (e) => {
  const { name, value, type, checked, multiple, options } = e.target;

  if (multiple) {
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    setFormData(prev => ({
      ...prev,
      [name]: selectedValues
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
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
      setFormData({
        title: '',
        content: '',
        featured_image: '',
        category_id: '',
        is_published: false,
        tags: []
      });
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

<label>Tags</label>
<div className="tags-checkboxes">
  {tags.map(tag => (
    <label key={tag.id}>
      <input
        type="checkbox"
        name="tags"
        value={tag.id}
        checked={formData.tags.includes(tag.id.toString())}
        onChange={(e) => {
          const value = e.target.value;
          setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(value)
              ? prev.tags.filter(v => v !== value)
              : [...prev.tags, value]
          }));
        }}
      />
      #{tag.name}
    </label>
  ))}
</div>


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
