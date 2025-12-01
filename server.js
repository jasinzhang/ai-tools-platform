const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Temporarily relaxed CSP for testing
app.use(helmet({
  contentSecurityPolicy: false  // Disabled for testing - enable in production
}));

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// API Routes (must be before static files to avoid conflicts)
const apiRoutes = require('./src/routes/api');
app.use('/api', apiRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html', 'css', 'js', 'json', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico']
}));

// Serve index.html for non-API routes that don't match static files (SPA support)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Skip static files (they should be served by Vercel)
  if (req.path.match(/\.(html|css|js|json|png|jpg|jpeg|gif|svg|ico)$/)) {
    return next();
  }
  
  // Serve index.html for all other routes
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(404).send('Page not found');
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Handle Vercel serverless functions
// Vercel will automatically detect and use this export
module.exports = app;

// Local development - only run if not in Vercel
if (!process.env.VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}