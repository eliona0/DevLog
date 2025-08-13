// server/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

// API Endpoints
app.use('/api/auth', authRoutes);     // për login & register
app.use('/api/posts', postRoutes);    // për postimet

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

const tagRoutes = require('./routes/tagRoutes');
app.use('/api/tags', tagRoutes);



app.get('/', (req, res) => {
  res.send('DevLog API is running...');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
