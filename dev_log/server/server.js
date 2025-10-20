// server/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');


require('dotenv').config();


const app = express();


app.use(cors({
  origin: 'http://localhost:3000', // frontend URL
  credentials: true,               // allow cookies / tokens
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); 
const postRoutes = require('./routes/postRoutes');    
app.use('/api/posts', postRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

const tagRoutes = require('./routes/tagRoutes');
app.use('/api/tags', tagRoutes);

const commentRoutes = require('./routes/commentRoutes');
app.use('/api/comments', commentRoutes);

const likeRoutes = require("./routes/likeRoutes");
app.use("/api/likes", likeRoutes);

const bookmarkRoutes = require('./routes/bookmarkRoutes');
app.use('/api/bookmarks', bookmarkRoutes);


app.get('/', (req, res) => {
  res.send('DevLog API is running...');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
