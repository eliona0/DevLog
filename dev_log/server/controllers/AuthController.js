const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const register = async (req, res) => {
  try {
    const { username, email, password, fullName, role, bio } = req.body;

    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create(username, email, hashedPassword, fullName, role, bio);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findByUsername(username);
    if (!user) return res.status(401).json({ error: 'Invalid username or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid username or password' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { password: pw, ...userWithoutPassword } = user;

    res.status(200).json({ message: 'Login successful', token, user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

const logout = async (req, res) => {
  try {
    // Since JWT is stateless, the server doesn't need to do much.
    // Client will remove the token. In a more complex setup, you could blacklist the token.
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Logout failed' });
  }
};

module.exports = { register, login, logout };