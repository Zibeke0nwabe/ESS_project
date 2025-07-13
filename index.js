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

//No login needed to this routes
app.get('/universities', (req, res) => {
  res.render('universities'); 
});
app.get('/news', (req, res) => {
  res.render('news');
});

app.get('/bursaries', (req, res) => {
  res.render('bursaries');
});

app.get('/management', (req, res) => {
  res.render('management');
});

app.get('/live-classes', (req, res) => {
  res.render('live-classes');
});
app.get('/about/students', (req, res) => {
  res.render('about/students');
});

app.get('/about/management', (req, res) => {
  res.render('about/management');
});

app.get('/about/developers', (req, res) => {
  res.render('about/developers');
});
app.get('/contact/developers', (req, res) => {
  res.render('contact/developers');
});

app.get('/about/teacher', (req, res) => {
  res.render('about/teachers');
});


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