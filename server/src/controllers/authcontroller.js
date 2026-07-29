// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { isPasswordStrong } = require('../utils/passwordValidator');
const { OAuth2Client } = require('google-auth-library');
const { checkSuspiciousLogin, recordLogin } = require('../utils/suspiciousLoginDetector');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function register(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter email and password' });
  }

  const passwordCheck = isPasswordStrong(password);
  if (!passwordCheck.valid) {
    return res.status(400).json({ message: passwordCheck.message });
  }

  try {
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, hashedPassword]
    );

    return res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter email and password' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const isSuspicious = await checkSuspiciousLogin(user.id, ipAddress, userAgent);
    await recordLogin(user.id, ipAddress, userAgent, isSuspicious);

    if (isSuspicious) {
      console.warn(`⚠️ Suspicious login detected for user ${user.email} from IP ${ipAddress}`);
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '5m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await pool.query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, user.id]
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password_hash, refresh_token, ...userWithoutSensitiveData } = user;

    return res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: userWithoutSensitiveData,
      flaggedAsSuspicious: isSuspicious,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

async function refresh(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND refresh_token = ?',
      [decoded.userId, refreshToken]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const user = rows[0];

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '5m' }
    );

    return res.status(200).json({ accessToken: newAccessToken });

  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
}

async function googleLogin(req, res) {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleEmail = payload.email;

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [googleEmail]
    );

    let user;

    if (rows.length === 0) {
      const [result] = await pool.query(
        'INSERT INTO users (email, password_hash, auth_provider) VALUES (?, ?, ?)',
        [googleEmail, null, 'google']
      );
      const [newRows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newRows[0];
    } else {
      user = rows[0];
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '5m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await pool.query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, user.id]
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password_hash, refresh_token, ...userWithoutSensitiveData } = user;

    return res.status(200).json({
      message: 'Google login successful',
      accessToken,
      user: userWithoutSensitiveData,
    });

  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid Google token' });
  }
}

async function getSessions(req, res) {
  const userId = req.user.userId;

  try {
    const [sessions] = await pool.query(
      'SELECT id, ip_address, user_agent, is_suspicious, created_at FROM login_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    return res.status(200).json({ sessions });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

async function logoutAllSessions(req, res) {
  const userId = req.user.userId;

  try {
    await pool.query(
      'UPDATE users SET refresh_token = NULL WHERE id = ?',
      [userId]
    );

    res.clearCookie('refreshToken');

    return res.status(200).json({ message: 'Logged out of all sessions successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(200).json({
        message: 'If that email exists, a reset link has been sent.',
      });
    }

    const user = rows[0];

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, expiresAt, user.id]
    );

    // Try to send email, but don't fail if it doesn't work
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      console.log('✅ Email sent successfully');
    } catch (emailError) {
      // Log the reset link to console as backup
      const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
      console.log('\n' + '='.repeat(80));
      console.log('⚠️  EMAIL FAILED - Use this reset link instead:');
      console.log(resetLink);
      console.log('='.repeat(80) + '\n');
    }

    return res.status(200).json({
      message: 'Password reset link has been generated. Check your email or server console.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Failed to process request. Please try again later.' });
  }
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  console.log('TOKEN RECEIVED BY SERVER:', token);

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  const passwordCheck = isPasswordStrong(newPassword);
  if (!passwordCheck.valid) {
    return res.status(400).json({ message: passwordCheck.message });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ?',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = rows[0];

    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    return res.status(200).json({ message: 'Password reset successful. You can now log in.' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}

module.exports = {
  register,
  login,
  refresh,
  googleLogin,
  getSessions,
  logoutAllSessions,
};