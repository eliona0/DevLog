import { useState } from 'react';
import axios from 'axios';

function RegisterForm({ onSwitch }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'user',
    bio: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', formData);
    alert('User registered ✅');
    console.log(res.data);
    onSwitch(); 
  } catch (err) {
    console.error(err);
    alert('Registration failed ❌');
  }
};


  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Register</h2>
      <input name="username" placeholder="Username" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <input name="fullName" placeholder="Full Name" onChange={handleChange} />
      <select name="role" onChange={handleChange}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <textarea name="bio" placeholder="Bio" onChange={handleChange} />
      <button type="submit">Register</button>
      <p className="switch-link">Already have an account? <span onClick={onSwitch}>Login</span></p>
    </form>
  );
}

export default RegisterForm;
