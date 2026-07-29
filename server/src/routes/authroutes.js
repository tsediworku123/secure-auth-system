const express = require("express");
const {
  register,
  login,
  refresh,
  googleLogin,
  getSessions,
  logoutAllSessions,
} = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimiter");
const { verifyAccessToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.post("/google", googleLogin);
router.get("/sessions", verifyAccessToken, getSessions);
router.post("/logout-all", verifyAccessToken, logoutAllSessions);

module.exports = router;