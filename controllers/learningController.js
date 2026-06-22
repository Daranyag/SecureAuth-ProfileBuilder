const User = require('../models/userModel');
const LearningLog = require('../models/learningLogModel');

// Helper to check and apply penalty
const checkAndApplyPenalty = async (user) => {
  if (!user) return;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // If user has never learned, or already learned today, no penalty today.
  if (!user.lastLearningDate) return;
  
  const lastLearning = new Date(user.lastLearningDate);
  const lastLearningDay = new Date(lastLearning.getFullYear(), lastLearning.getMonth(), lastLearning.getDate());
  
  const diffDays = Math.floor((today - lastLearningDay) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) {
    // Missed at least yesterday. Check if penalty already applied for the missed period.
    const lastPenalty = user.lastPenaltyDate ? new Date(user.lastPenaltyDate) : null;
    let shouldApply = false;
    
    if (!lastPenalty) {
      shouldApply = true;
    } else {
      const lastPenaltyDay = new Date(lastPenalty.getFullYear(), lastPenalty.getMonth(), lastPenalty.getDate());
      // If we haven't penalized them today or yesterday for the missed days
      if (lastPenaltyDay < today) {
        shouldApply = true;
      }
    }
    
    if (shouldApply) {
      user.points = user.points - 5;
      user.currentStreak = 0;
      user.lastPenaltyDate = now;
      user.lastPenaltyReason = "Penalty: -5 points for not logging learning progress yesterday.";
      await user.save();
    }
  }
};

// Analyze Learning Text Logic
const analyzeLearningText = (text) => {
  const lowerText = text.toLowerCase();
  
  const nonProductiveWords = ['reels', 'instagram', 'social media', 'surfing', 'movie', 'tiktok', 'scrolled', 'youtube shorts', 'entertainment', 'eating', 'sleeping', 'playing', 'gaming', 'chatting', 'nothing', 'chilling', 'resting', 'wasting', 'tv', 'netflix', 'slept', 'ate'];
  const partiallyProductiveWords = ['watched', 'read', 'tutorial', 'video', 'documentation', 'article'];
  const highlyProductiveWords = ['solved', 'built', 'implemented', 'practice', 'project', 'exercise', 'coding', 'applied', 'developed'];

  // Check non-productive first
  for (const word of nonProductiveWords) {
    if (lowerText.includes(word)) {
      return {
        multiplier: 0,
        quality: 'Needs Improvement',
        feedback: 'This activity does not contribute to measurable learning progress. No points awarded.',
      };
    }
  }

  // Check highly productive
  for (const word of highlyProductiveWords) {
    if (lowerText.includes(word)) {
      return {
        multiplier: 1.0,
        quality: 'Excellent',
        feedback: 'Excellent learning activity. Practical implementation detected.',
      };
    }
  }

  // Check partially productive
  for (const word of partiallyProductiveWords) {
    if (lowerText.includes(word)) {
      return {
        multiplier: 0.5,
        quality: 'Average',
        feedback: 'Good learning effort. Consider applying what you learned through exercises or projects.',
      };
    }
  }

  // Fallback (e.g. they typed something productive without specific keywords)
  // We'll give them good quality to be generous.
  return {
    multiplier: 1.0,
    quality: 'Good',
    feedback: 'Good work! You learned a concept and applied it practically.',
  };
};

// @desc    Submit daily learning log
// @route   POST /api/users/learning
// @access  Private
const submitLearningLog = async (req, res) => {
  try {
    const { learningText, category, duration, difficulty } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check penalty first
    await checkAndApplyPenalty(user);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Analyze text to get quality, multiplier and feedback
    const analysis = analyzeLearningText(learningText);

    // 2. Calculate Base Points
    let basePoints = 0;
    if (duration === '0-30') basePoints += 5;
    else if (duration === '30-60') basePoints += 10;
    else if (duration === '1-2') basePoints += 20;
    else if (duration === '2+') basePoints += 30;

    // 3. Add Difficulty Bonus
    if (difficulty === 'Intermediate') basePoints += 5;
    else if (difficulty === 'Advanced') basePoints += 10;

    // Apply multiplier
    let points = Math.floor(basePoints * analysis.multiplier);

    // 4. Update Streak (Only if they actually got points, to prevent cheating streak with non-productive)
    let newStreak = user.currentStreak;
    if (points > 0) {
      if (user.lastLearningDate) {
        const lastLearning = new Date(user.lastLearningDate);
        const lastLearningDay = new Date(lastLearning.getFullYear(), lastLearning.getMonth(), lastLearning.getDate());
        const diffDays = Math.floor((todayStart - lastLearningDay) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak = user.currentStreak + 1;
        } else if (diffDays === 0) {
          newStreak = user.currentStreak;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
      user.currentStreak = newStreak;
      if (newStreak > user.longestStreak) {
        user.longestStreak = newStreak;
      }
    }

    // 5. Add Streak Bonus
    if (points > 0) {
      if (newStreak === 3) points += 10;
      else if (newStreak === 7) points += 25;
      else if (newStreak === 30) points += 100;
    }

    // 6. Save Log
    const log = await LearningLog.create({
      userId: user._id,
      learningText,
      category,
      duration,
      difficulty,
      pointsAwarded: points,
      quality: analysis.quality,
      feedback: analysis.feedback,
    });

    // 7. Update User
    if (points > 0) {
      user.points += points;
      user.lastLearningDate = now;
      user.activityLogs.push({ action: 'Submitted Learning Log', timestamp: now });
      if (user.activityLogs.length > 50) user.activityLogs = user.activityLogs.slice(-50);
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: analysis.feedback,
      pointsAwarded: points,
      currentStreak: user.currentStreak,
      totalPoints: user.points,
      quality: analysis.quality
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error submitting learning log' });
  }
};

// @desc    Get current user's learning stats
// @route   GET /api/users/learning/stats
// @access  Private
const getLearningStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await checkAndApplyPenalty(user);

    const logs = await LearningLog.find({ userId: user._id });
    const totalLogs = logs.length;
    
    // Calculate overall rating
    let qualityRating = 'Not Rated';
    if (totalLogs > 0) {
      let scoreSum = 0;
      logs.forEach(log => {
        if (log.quality === 'Excellent') scoreSum += 3;
        else if (log.quality === 'Good') scoreSum += 2;
        else if (log.quality === 'Average') scoreSum += 1;
        // Needs Improvement = 0
      });
      const avgScore = scoreSum / totalLogs;
      if (avgScore >= 2.5) qualityRating = 'Excellent';
      else if (avgScore >= 1.5) qualityRating = 'Good';
      else if (avgScore >= 0.5) qualityRating = 'Average';
      else qualityRating = 'Needs Improvement';
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isCompletedToday = user.lastLearningDate && new Date(user.lastLearningDate) >= todayStart;

    res.status(200).json({
      success: true,
      stats: {
        points: user.points,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        todayStatus: isCompletedToday ? 'Completed' : 'Pending',
        totalLogs,
        qualityRating,
        lastPenaltyReason: user.lastPenaltyReason
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching learning stats' });
  }
};

// @desc    Get top 10 leaderboard
// @route   GET /api/users/learning/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false })
      .sort({ points: -1 })
      .limit(10)
      .select('name points');
    
    res.status(200).json({
      success: true,
      leaderboard: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching leaderboard' });
  }
};

// @desc    Get learning analytics (Admin)
// @route   GET /api/users/learning/analytics
// @access  Private/Admin
const getAdminLearningAnalytics = async (req, res) => {
  try {
    const totalLogs = await LearningLog.countDocuments();
    
    const allUsers = await User.find({ isDeleted: false }).select('points lastLearningDate name');
    
    let totalPoints = 0;
    let highestPointsUser = null;
    let mostActiveUser = null;
    let missingTodayCount = 0;
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    allUsers.forEach(u => {
      totalPoints += u.points || 0;
      
      if (!highestPointsUser || (u.points > highestPointsUser.points)) {
        highestPointsUser = u;
      }
      
      const isCompletedToday = u.lastLearningDate && new Date(u.lastLearningDate) >= todayStart;
      if (!isCompletedToday) {
        missingTodayCount++;
      }
    });

    const averagePoints = allUsers.length > 0 ? Math.round(totalPoints / allUsers.length) : 0;

    // Find most active user (most logs)
    const logsAggregate = await LearningLog.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    
    if (logsAggregate.length > 0) {
      const activeU = await User.findById(logsAggregate[0]._id).select('name');
      mostActiveUser = activeU ? activeU.name : 'Unknown';
    }

    res.status(200).json({
      success: true,
      analytics: {
        totalLogs,
        averagePoints,
        highestPointsUser: highestPointsUser ? highestPointsUser.name : 'N/A',
        highestPoints: highestPointsUser ? highestPointsUser.points : 0,
        mostActiveUser: mostActiveUser || 'N/A',
        missingTodayCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching learning analytics' });
  }
};

module.exports = {
  submitLearningLog,
  getLearningStats,
  getLeaderboard,
  getAdminLearningAnalytics
};
