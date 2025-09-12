// CreatePostForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/createpostform.css';

function CreatePostForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const postToEdit = location.state?.post;

  const [formData, setFormData] = useState({
    title: postToEdit?.title || '',
    content: postToEdit?.content || '',
    featured_image: null,
    category_id: postToEdit?.category_id || '',
    is_published: postToEdit?.is_published === 1 || false,
    tags: postToEdit?.tags?.split(',')?.map(tag => tag.trim()) || []
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
    const { name, value, type, checked, files } = e.target;

    if (name === 'featured_image' && files) {
      setFormData(prev => ({
        ...prev,
        featured_image: files[0]
      }));
    } else if (type === 'checkbox' && name === 'tags') {
      const tagValue = value;
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.includes(tagValue)
          ? prev.tags.filter(t => t !== tagValue)
          : [...prev.tags, tagValue]
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to create or edit a post.');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title || '');
      data.append('content', formData.content || '');
      data.append('is_published', formData.is_published ? '1' : '0');
      if (formData.category_id) data.append('category_id', formData.category_id);
      if (formData.tags && formData.tags.length > 0) {
        formData.tags.forEach(tag => data.append('tags[]', tag));
      }
      if (formData.featured_image) {
        data.append('featured_image', formData.featured_image);
      }

      // Log FormData contents for debugging
      for (let [key, value] of data.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      const url = postToEdit
        ? `http://localhost:5000/api/posts/${postToEdit.id}`
        : 'http://localhost:5000/api/posts';
      const method = postToEdit ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
          // Let browser set Content-Type for multipart/form-data
        },
      });

      alert(postToEdit ? 'Post updated successfully!' : 'Post created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Failed to save post:', error.response ? error.response.data : error.message);
      alert('Failed to save post: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="create-post-container">
      <h2>{postToEdit ? 'Edit Post' : 'Create a New Post'}</h2>
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

        <label>Featured Image</label>
        <input
          type="file"
          name="featured_image"
          onChange={handleChange}
          accept="image/*"
        />
        {postToEdit && !formData.featured_image && postToEdit.featured_image && (
          <p>Current image: {postToEdit.featured_image}</p>
        )}

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
                value={tag.id.toString()}
                checked={formData.tags.includes(tag.id.toString())}
                onChange={handleChange}
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

        <button type="submit" className="submit-button">{postToEdit ? 'Update' : 'Post'}</button>
      </form>
    </div>
  );
}

export default CreatePostForm;