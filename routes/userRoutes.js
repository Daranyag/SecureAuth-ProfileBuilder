const express = require('express');
const router = express.Router();
const {
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  getStats,
  getDashboardData,
  toggleBlockUser,
  deleteUser,
  updateSettings,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protected User Routes (Any authenticated user)
router.get('/me', protect, getMe);
router.get('/dashboard', protect, getDashboardData);

// Learning Tracker Routes
const {
  submitLearningLog,
  getLearningStats,
  getLeaderboard,
  getAdminLearningAnalytics
} = require('../controllers/learningController');

router.post('/learning', protect, submitLearningLog);
router.get('/learning/stats', protect, getLearningStats);
router.get('/learning/leaderboard', protect, getLeaderboard);
router.get('/learning/analytics', protect, getAdminLearningAnalytics);

router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.put('/settings', protect, updateSettings);
router.put('/change-password', protect, changePassword);

// Admin Routes (Authenticated users only)
router.get('/stats', protect, getStats);
router.get('/', protect, getAllUsers);
router.put('/:id/block', protect, toggleBlockUser);
router.delete('/:id', protect, deleteUser);

// Personal Profile Routes
const {
  getPersonalProfile,
  updatePersonalProfile
} = require('../controllers/personalProfileController');

router.get('/personal-profile', protect, getPersonalProfile);
router.post('/personal-profile', protect, updatePersonalProfile);

module.exports = router;
