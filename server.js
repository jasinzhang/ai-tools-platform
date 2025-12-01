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

// Compression middleware - disable on Vercel as it handles this automatically
if (!process.env.VERCEL) {
  app.use(compression());
}
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
// On Vercel, we also need to serve static files because vercel.json routing may not work correctly
// with builds configuration. Express will handle static files as fallback.
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html', 'css', 'js', 'json', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot'],
  index: false // Don't serve index.html for directories
}));

// Serve index.html for non-API routes that don't match static files (SPA support)
// This route only handles requests that weren't matched by static file middleware
app.get('*', (req, res) => {
  // Skip API routes - let them be handled by API routes or return 404
  if (req.path.startsWith('/api')) {
    if (!res.headersSent) {
      res.status(404).json({ error: 'API endpoint not found' });
    }
    return;
  }
  
  // Skip static file requests - they should be handled by express.static middleware
  // If we reach here for a static file, it means the file doesn't exist
  if (req.path.match(/\.(html|css|js|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    if (!res.headersSent) {
      res.status(404).send('File not found');
    }
    return;
  }
  
  // Serve index.html for all other routes (SPA fallback)
  // This handles routes without file extensions
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      // Ensure error response is a string
      if (!res.headersSent) {
        res.status(404).send('Page not found');
      }
    }
  });
});

// Error handling - ensure all responses are strings
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.status || 500;
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  // Explicitly send JSON as string
  res.status(statusCode).json({
    error: errorMessage
  });
});

// Handle Vercel serverless functions
// Vercel expects a handler function, not the app directly
// The @vercel/node builder will automatically wrap Express apps correctly
module.exports = app;

// Local development - only run if not in Vercel
if (!process.env.VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}