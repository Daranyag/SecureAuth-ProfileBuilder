const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please enter all fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    // Password must contain at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must contain at least one letter, one number, and be at least 8 characters long' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // 2. Check if email already exists (only active accounts — deleted accounts freed their email)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already exists. Please use a different email.' });
    }

    // 3. Create user (password hashing is done in pre-save hook in userModel)
    const user = await User.create({
      name,
      email,
      password,
      lastLogin: new Date(),
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error, registration failed' });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // 2. Find user by email and select password (as it is excluded by default in schema)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 3. Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'This user account is blocked' });
    }

    // 5. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Track failed attempt
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.loginHistory.push({ timestamp: new Date(), browser: req.headers['user-agent'] || 'Unknown', status: 'failed' });
      if (user.loginHistory.length > 20) user.loginHistory = user.loginHistory.slice(-20);
      await user.save();
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 6. Update lastLogin, reset failed attempts, record history & activity
    const browser = req.headers['user-agent'] || 'Unknown';
    user.lastLogin = new Date();
    user.failedLoginAttempts = 0;
    user.totalLogins = (user.totalLogins || 0) + 1;
    
    // Achievement Badges Check (Login based)
    if (!user.badges) user.badges = [];
    if (user.totalLogins === 1 && !user.badges.includes('🎉 First Login')) {
      user.badges.push('🎉 First Login');
    }
    if (user.totalLogins >= 50 && !user.badges.includes('🚀 50 Logins')) {
      user.badges.push('🚀 50 Logins');
    }

    user.loginHistory.push({ timestamp: new Date(), browser, status: 'success' });
    if (user.loginHistory.length > 20) user.loginHistory = user.loginHistory.slice(-20);
    user.activityLogs.push({ action: 'Logged In', timestamp: new Date() });
    if (user.activityLogs.length > 50) user.activityLogs = user.activityLogs.slice(-50);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        totalLogins: user.totalLogins,
        themeMode: user.themeMode,
        accentColor: user.accentColor,
        badges: user.badges,
        notificationPreferences: user.notificationPreferences,
        loginHistory: user.loginHistory,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error, login failed' });
  }
};

// @desc    Reset Password directly by email (no OTP)
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmNewPassword } = req.body;

    // 1. Validate all fields present
    if (!email || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    // 2. Check email exists in DB
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    // 3. Validate password match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // 4. Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one letter and one number',
      });
    }

    // 5. Set new password — pre-save hook in userModel will hash it via bcrypt
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully. Please login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
};

module.exports = { registerUser, loginUser, resetPassword };
