const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); 
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));


app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.download(filePath, err => {
    if (err) {
      return res.status(404).send('File not found');
    }
  });
});


// View Engine
app.set('view engine', 'ejs');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log(' MongoDB connected'))
    .catch(err => console.log(' MongoDB connection failed:'));

// Routes
const applicantRoutes = require('./routes/applicantRoutes');
const adminRoutes = require('./routes/adminRoutes');
const subscribeRoutes = require('./routes/subscribeRoutes');
const contactRoutes = require('./routes/contactRoutes');

app.use('/', applicantRoutes);
app.use('/', adminRoutes);
app.use('/', subscribeRoutes);
app.use('/', contactRoutes);

// 404 Error Page
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 - Page Not Found',
        message: null
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});