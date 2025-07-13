const express = require('express');
const router = express.Router();
const StreakService = require('../services/streakService.js');
const { auth } = require('../middleware/auth');

// Helper function to validate userId
const validateUserId = (userId) => {
  if (!userId || userId === "undefined" || userId === "null") {
    return false;
  }
  // Check if it's a valid MongoDB ObjectId format
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(userId);
};

// GET /api/streak/user/:userId - Get user's streak data
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!validateUserId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing userId'
      });
    }

    const { days = 365 } = req.query;

    const streakData = await StreakService.getStreakData(userId, parseInt(days));

    res.status(200).json({
      success: true,
      message: 'Streak data retrieved successfully',
      data: streakData
    });
  } catch (error) {
    console.error('Error getting streak data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get streak data',
      error: error.message
    });
  }
});

// GET /api/streak/calendar/:userId - Get calendar data for visualization
router.get('/calendar/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!validateUserId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing userId'
      });
    }

    const { days = 365 } = req.query;

    const streakData = await StreakService.getStreakData(userId, parseInt(days));

    // Format calendar data for frontend
    const calendarData = streakData.calendarData.map(day => ({
      date: day.date,
      activity: day.activity,
      posts: day.posts,
      likes: day.likes,
      comments: day.comments,
      level: day.activity === 0 ? 0 : 
             day.activity === 1 ? 1 : 
             day.activity === 2 ? 2 : 
             day.activity === 3 ? 3 : 4
    }));

    res.status(200).json({
      success: true,
      message: 'Calendar data retrieved successfully',
      data: {
        calendarData,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        totalPosts: streakData.totalPosts,
        totalLikesReceived: streakData.totalLikesReceived,
        totalContributions: streakData.totalContributions
      }
    });
  } catch (error) {
    console.error('Error getting calendar data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get calendar data',
      error: error.message
    });
  }
});

// POST /api/streak/update/:userId - Update user's daily contribution
router.post('/update/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!validateUserId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing userId'
      });
    }

    const { activityType = 'posts' } = req.body;

    const result = await StreakService.updateDailyContribution(userId, activityType);

    // Check for new badges
    const newBadges = await StreakService.checkAndAwardBadges(userId);

    res.status(200).json({
      success: true,
      message: 'Daily contribution updated successfully',
      data: {
        ...result,
        newBadges
      }
    });
  } catch (error) {
    console.error('Error updating daily contribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update daily contribution',
      error: error.message
    });
  }
});

// GET /api/streak/stats - Get global streak statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await StreakService.getStreakStats();

    res.status(200).json({
      success: true,
      message: 'Streak statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error getting streak stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get streak statistics',
      error: error.message
    });
  }
});

// POST /api/streak/reset-inactive - Reset streaks for inactive users (admin only)
router.post('/reset-inactive', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const resetCount = await StreakService.resetInactiveStreaks();

    res.status(200).json({
      success: true,
      message: 'Inactive streaks reset successfully',
      data: {
        resetCount
      }
    });
  } catch (error) {
    console.error('Error resetting inactive streaks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset inactive streaks',
      error: error.message
    });
  }
});

// GET /api/streak/leaderboard - Get streak leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const User = require('../models/User.js');
    
    const leaderboard = await User.aggregate([
      {
        $match: {
          currentStreak: { $gt: 0 }
        }
      },
      {
        $project: {
          name: 1,
          avatar: 1,
          currentStreak: 1,
          longestStreak: 1,
          totalPosts: 1
        }
      },
      {
        $sort: {
          currentStreak: -1,
          longestStreak: -1
        }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Leaderboard retrieved successfully',
      data: leaderboard
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard',
      error: error.message
    });
  }
});

// GET /api/streak/badges/:userId - Get user's badges
router.get('/badges/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!validateUserId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing userId'
      });
    }

    const User = require('../models/User.js');
    const user = await User.findById(userId).select('earnedBadges');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Badges retrieved successfully',
      data: {
        badges: user.earnedBadges
      }
    });
  } catch (error) {
    console.error('Error getting badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get badges',
      error: error.message
    });
  }
});

module.exports = router; 