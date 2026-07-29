// src/utils/suspiciousLoginDetector.js

const pool = require('../config/db');

async function checkSuspiciousLogin(userId, ipAddress, userAgent) {
  // Look at this user's last 5 logins
  const [previousLogins] = await pool.query(
    'SELECT ip_address, user_agent FROM login_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
    [userId]
  );

  // If this is their very first login ever, nothing to compare - not suspicious
  if (previousLogins.length === 0) {
    return false;
  }

  // Check: has this exact IP address been seen before?
  const knownIp = previousLogins.some(login => login.ip_address === ipAddress);

  // Check: has this exact device/browser been seen before?
  const knownDevice = previousLogins.some(login => login.user_agent === userAgent);

  // If BOTH the IP and device are brand new, flag it as suspicious
  if (!knownIp && !knownDevice) {
    return true;
  }

  return false;
}

async function recordLogin(userId, ipAddress, userAgent, isSuspicious) {
  await pool.query(
    'INSERT INTO login_history (user_id, ip_address, user_agent, is_suspicious) VALUES (?, ?, ?, ?)',
    [userId, ipAddress, userAgent, isSuspicious]
  );
}

module.exports = { checkSuspiciousLogin, recordLogin };