// src/middleware/rateLimiter.js

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // allow only 5 attempts per IP in that window
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true, // return rate limit info in the response headers
  legacyHeaders: false,
});

module.exports = { loginLimiter };