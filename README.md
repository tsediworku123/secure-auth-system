# Secure Authentication System

A full-stack authentication system built with React, Node.js, Express, and MySQL implementing enterprise-grade security features.

## 🔐 Security Features

### Core Requirements Implemented:
1. ✅ **Strong Password Policy** - Enforces 8+ characters with uppercase, lowercase, numbers, and symbols
2. ✅ **Brute-Force Protection** - Rate limiting on login attempts
3. ✅ **Short-Lived Access Tokens** - 5-minute access tokens with automatic refresh (7-day refresh tokens)
4. ✅ **Google OAuth Integration** - Sign in with Google
5. ✅ **Suspicious Login Detection** - Tracks IP addresses and user agents to detect unusual logins
6. ✅ **Session Management** - View and manage active login sessions

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router
- Axios
- Tailwind CSS
- Vite

**Backend:**
- Node.js
- Express
- MySQL2
- JWT (jsonwebtoken)
- bcryptjs
- Google OAuth

## 📦 Installation

### Prerequisites:
- Node.js (v16+)
- MySQL (v8+)
- npm or yarn

### 1. Clone the repository:
```bash
git clone <your-repo-url>
cd secure-auth-system
```

### 2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Database Setup:
```bash
# Create database
mysql -u root -p
CREATE DATABASE secure_auth_db;
USE secure_auth_db;

# Run the schema
source database/schema.sql;

# Run migration to add missing columns
cd server
node migrate.js
```

### 4. Environment Variables:
```bash
# Copy example env file
cd server
cp .env.example .env

# Edit .env with your values:
# - Database credentials
# - JWT secrets (generate strong random strings!)
# - Google OAuth credentials (get from Google Cloud Console)
```

### 5. Start the application:
```bash
# Terminal 1 - Start backend (from server folder)
npm start

# Terminal 2 - Start frontend (from client folder)
npm run dev
```

## 🚀 Usage

1. **Register**: Create an account with email and strong password
2. **Login**: Sign in with email/password or Google OAuth
3. **Dashboard**: View your profile and account info
4. **Sessions**: View recent login history with IP addresses and devices
5. **Logout All**: Revoke all active sessions from all devices

## 🔒 Security Implementation Details

### Token System:
- **Access Token**: 5-minute expiration, stored in localStorage
- **Refresh Token**: 7-day expiration, stored in httpOnly cookie
- **Auto-refresh**: Frontend automatically refreshes tokens on expiration

### Password Security:
- bcrypt hashing with salt rounds of 10
- Minimum 8 characters
- Must contain uppercase, lowercase, number, and symbol

### Suspicious Login Detection:
- Tracks IP address changes
- Monitors user agent (browser/device) changes
- Flags logins from new locations/devices

### Rate Limiting:
- Max 5 login attempts per 15 minutes per IP
- Prevents brute-force attacks

## 📁 Project Structure

```
secure-auth-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # Axios instance with interceptors
│   │   ├── components/    # Protected route wrapper
│   │   ├── pages/         # Page components
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth & rate limiting
│   │   ├── routes/       # API routes
│   │   └── utils/        # Helper functions
│   └── package.json
├── database/             # SQL schema and migrations
└── README.md
```

## 🧪 Testing

The system has been tested for:
- ✅ Registration with password validation
- ✅ Login with email/password
- ✅ Login with Google OAuth
- ✅ Token expiration and auto-refresh
- ✅ Suspicious login detection
- ✅ Session history tracking
- ✅ Logout all sessions

## 📝 API Endpoints

### Authentication:
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/google` - Login with Google
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout-all` - Logout all sessions

### Protected Routes:
- `GET /api/auth/sessions` - Get login history (requires auth)

## 🔧 Configuration

### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Copy Client ID and Client Secret to `.env`

### JWT Secrets:
Generate strong random strings for production:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## ⚠️ Important Notes

- **Never commit `.env` files** - They contain sensitive credentials
- **Change default JWT secrets** in production
- **Use HTTPS** in production (set `secure: true` in cookie options)
- **Set `NODE_ENV=production`** for production deployments

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

Created as a secure authentication system implementation demonstrating industry best practices.
