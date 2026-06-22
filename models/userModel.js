const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password by default in queries
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    lastPasswordChange: {
      type: Date,
      default: null,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        browser: { type: String, default: 'Unknown' },
        status: { type: String, enum: ['success', 'failed'], default: 'success' },
      },
    ],
    activityLogs: [
      {
        action: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    points: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastLearningDate: {
      type: Date,
      default: null,
    },
    lastPenaltyDate: {
      type: Date,
      default: null,
    },
    lastPenaltyReason: {
      type: String,
      default: '',
    },
    totalLogins: {
      type: Number,
      default: 0,
    },
    themeMode: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark',
    },
    accentColor: {
      type: String,
      enum: ['blue', 'purple', 'green', 'orange'],
      default: 'blue',
    },
    notificationPreferences: {
      loginAlerts: { type: Boolean, default: true },
      accountUpdateAlerts: { type: Boolean, default: true },
      securityNotifications: { type: Boolean, default: true },
    },
    badges: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcryptjs before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
