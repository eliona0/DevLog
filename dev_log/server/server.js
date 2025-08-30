// server/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');


dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');


app.use('/api/auth', authRoutes);     
app.use('/api/posts', postRoutes);    

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

const tagRoutes = require('./routes/tagRoutes');
app.use('/api/tags', tagRoutes);



app.get('/', (req, res) => {
  res.send('DevLog API is running...');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
