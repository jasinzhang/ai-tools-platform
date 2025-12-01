const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const qrService = require('../services/qrService');
const colorService = require('../services/colorService');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Social Media Tools
router.post('/tools/tiktok-title', async (req, res) => {
  try {
    const { topic, tone, style } = req.body;
    const result = await aiService.generateTikTokTitle(topic, tone, style);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tools/instagram-caption', async (req, res) => {
  try {
    const { description, tone, hashtagCount } = req.body;
    const result = await aiService.generateInstagramCaption(description, tone, hashtagCount);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tools/youtube-title', async (req, res) => {
  try {
    const { topic, description, tone } = req.body;
    const result = await aiService.generateYouTubeContent(topic, description, tone);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Text Processing Tools
router.post('/tools/text-rewriter', async (req, res) => {
  try {
    const { text, tone, style } = req.body;
    const result = await aiService.rewriteText(text, tone, style);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tools/text-summarizer', async (req, res) => {
  try {
    const { text, length } = req.body;
    const result = await aiService.summarizeText(text, length);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Image Tools
router.post('/tools/qr-generator', async (req, res) => {
  try {
    const { text, size, color, bgColor, margin } = req.body;
    const result = await qrService.generateQR(text, { size, color, bgColor, margin });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('QR Generator Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Creative Tools
router.post('/tools/product-name', async (req, res) => {
  try {
    const { description, industry, style } = req.body;
    const result = await aiService.generateProductNames(description, industry, style);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tools/username-generator', async (req, res) => {
  try {
    const { keyword, style, length } = req.body;
    const result = await aiService.generateUsernames(keyword, style, length);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utility Tools
router.post('/tools/password-generator', (req, res) => {
  try {
    const { length = 12, includeNumbers = true, includeSymbols = true, includeUppercase = true, includeLowercase = true } = req.body;
    const password = generatePassword(length, { includeNumbers, includeSymbols, includeUppercase, includeLowercase });
    res.json({ success: true, data: { password, strength: calculatePasswordStrength(password) } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/tools/color-palette', (req, res) => {
  try {
    const { baseColor, style } = req.body;
    const palette = colorService.generatePalette(baseColor, style);
    res.json({ success: true, data: palette });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper functions
function generatePassword(length, options) {
  let chars = '';
  if (options.includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (options.includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.includeNumbers) chars += '0123456789';
  if (options.includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function calculatePasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;
  
  if (strength <= 2) return 'Weak';
  if (strength <= 4) return 'Medium';
  return 'Strong';
}

module.exports = router;
