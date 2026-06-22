const mongoose = require('mongoose');

const learningLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    learningText: {
      type: String,
      required: [true, 'Please describe what you learned'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Programming', 'Database', 'Web Development', 'DSA', 'AI/ML', 'Interview Preparation', 'Other'],
    },
    duration: {
      type: String,
      required: true,
      enum: ['0-30', '30-60', '1-2', '2+'],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    quality: {
      type: String,
      enum: ['Excellent', 'Good', 'Average', 'Needs Improvement'],
      default: 'Good',
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningLog', learningLogSchema);
