require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize Express App
const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors({
  origin: '*', // For development, allow any origin. In production, specify frontend URL.
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads Directory Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Handle React routing, return all requests to React app
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});
// Error handling middleware for Multer and general errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle Multer limits/errors
  if (err instanceof require('multer').MulterError) {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }

  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
