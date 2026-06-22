const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check for 7-Day Member badge
    if (!user.badges) user.badges = [];
    const diffTime = Math.abs(new Date() - new Date(user.createdAt));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 7 && !user.badges.includes('🔥 7-Day Member')) {
      user.badges.push('🔥 7-Day Member');
      await user.save();
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email } = req.body;

    // Validate email format if changed
    if (email && email !== user.email) {
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      }

      // Check if email already exists
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use by another account' });
      }
      user.email = email;
    }

    if (name) user.name = name;

    // If profile image is uploaded
    if (req.file) {
      // Delete old image if it exists
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, '../uploads', user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath);
          } catch (err) {
            console.error('Error deleting old profile image:', err);
          }
        }
      }
      user.profileImage = req.file.filename;
    }

    // Check for Profile Completed badge
    const isProfileComplete = user.name && user.email && user.password && user.profileImage;
    if (isProfileComplete && !user.badges.includes('⭐ Profile Completed')) {
      user.badges.push('⭐ Profile Completed');
    }

    // Track activity
    user.activityLogs.push({ action: 'Updated Profile', timestamp: new Date() });
    if (user.activityLogs.length > 50) user.activityLogs = user.activityLogs.slice(-50);
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        lastLogin: updatedUser.lastLogin,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { themeMode, accentColor, notificationPreferences } = req.body;

    if (themeMode) user.themeMode = themeMode;
    if (accentColor) user.accentColor = accentColor;
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences
      };
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        themeMode: updatedUser.themeMode,
        accentColor: updatedUser.accentColor,
        notificationPreferences: updatedUser.notificationPreferences
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'Please enter all password fields' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long' });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain at least one letter and one number'
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    // Get user including password field
    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    // Set new password (will be hashed in userModel pre-save hook)
    user.password = newPassword;
    user.lastPasswordChange = new Date();
    user.activityLogs.push({ action: 'Changed Password', timestamp: new Date() });
    if (user.activityLogs.length > 50) user.activityLogs = user.activityLogs.slice(-50);
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error changing password' });
  }
};

// @desc    Get all users (excludes soft-deleted)
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching users list' });
  }
};

// @desc    Get dynamic statistics
// @route   GET /api/users/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const total = await User.countDocuments({});
    const active = total;
    const blocked = await User.countDocuments({ isBlocked: true });
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const loggedIn = await User.countDocuments({
      lastLogin: { $gte: thirtyMinsAgo },
    });
    // Today's login count via activityLogs
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayLoginResult = await User.aggregate([
      { $unwind: '$loginHistory' },
      { $match: { 'loginHistory.timestamp': { $gte: startOfDay }, 'loginHistory.status': 'success' } },
      { $count: 'count' },
    ]);
    const todayLogins = todayLoginResult[0]?.count || 0;

    res.status(200).json({
      success: true,
      stats: { total, active, blocked, loggedIn, todayLogins },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching statistics' });
  }
};

// Removed softDeleteAccount

// @desc    Get full dashboard data for current user
// @route   GET /api/users/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Profile completion
    const completionItems = [
      { label: 'Name Added', done: !!user.name },
      { label: 'Email Added', done: !!user.email },
      { label: 'Password Set', done: true },
      { label: 'Profile Photo Added', done: !!user.profileImage },
    ];
    const completionPct = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);

    // Last 5 login history entries (newest first)
    const loginHistory = [...user.loginHistory].reverse().slice(0, 5);

    // Last 5 activity logs (newest first)
    const activityLogs = [...user.activityLogs].reverse().slice(0, 5);

    // Analytics for all users
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const activeCount = await User.countDocuments({});
    const analytics = { newThisMonth, active: activeCount };

    res.status(200).json({
      success: true,
      data: {
        loginHistory,
        activityLogs,
        security: {
          lastPasswordChange: user.lastPasswordChange,
          failedLoginAttempts: user.failedLoginAttempts || 0,
          accountStatus: user.isBlocked ? 'Blocked' : 'Active',
        },
        profileCompletion: { percentage: completionPct, items: completionItems },
        analytics,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard data' });
  }
};

// @desc    Toggle block/unblock status of a user (Admin only)
// @route   PUT /api/users/:id/block
// @access  Private/Admin
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent blocking oneself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot block/unblock your own account' });
    }

    // Toggle status
    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User has been successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating user block status' });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting oneself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    // Delete profile image file if exists
    if (user.profileImage) {
      const imgPath = path.join(__dirname, '../uploads', user.profileImage);
      if (fs.existsSync(imgPath)) {
        try {
          fs.unlinkSync(imgPath);
        } catch (err) {
          console.error('Error deleting user image file:', err);
        }
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
};

module.exports = {
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  getStats,
  getDashboardData,
  toggleBlockUser,
  deleteUser,
  updateSettings,
};
