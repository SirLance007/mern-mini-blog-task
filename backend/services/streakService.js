const User = require('../models/User.js');
const BlogPost = require('../models/BlogPost.js');

class StreakService {
  // Calculate streak based on daily contributions
  static calculateStreak(dailyContributions) {
    if (!dailyContributions || dailyContributions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort contributions by date (newest first)
    const sortedContributions = dailyContributions.sort((a, b) => b.date - a.date);

    // Check if user has activity today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayContribution = sortedContributions.find(
      contribution => contribution.date.getTime() === today.getTime()
    );

    // If no activity today, reset current streak
    if (!todayContribution || (todayContribution.posts === 0 && todayContribution.likes === 0 && todayContribution.comments === 0)) {
      currentStreak = 0;
    } else {
      // Calculate current streak
      let consecutiveDays = 0;
      let checkDate = new Date(today);
      
      for (let i = 0; i < 365; i++) { // Check up to 1 year
        const contribution = sortedContributions.find(
          c => c.date.getTime() === checkDate.getTime()
        );
        
        if (contribution && (contribution.posts > 0 || contribution.likes > 0 || contribution.comments > 0)) {
          consecutiveDays++;
          tempStreak = Math.max(tempStreak, consecutiveDays);
        } else {
          break;
        }
        
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      currentStreak = consecutiveDays;
    }

    // Calculate longest streak from all contributions
    let maxStreak = 0;
    let currentMaxStreak = 0;
    
    for (let i = 0; i < sortedContributions.length; i++) {
      const contribution = sortedContributions[i];
      if (contribution.posts > 0 || contribution.likes > 0 || contribution.comments > 0) {
        currentMaxStreak++;
        maxStreak = Math.max(maxStreak, currentMaxStreak);
      } else {
        currentMaxStreak = 0;
      }
    }

    longestStreak = maxStreak;

    return { currentStreak, longestStreak };
  }

  // Update user's daily contribution
  static async updateDailyContribution(userId, activityType = 'posts') {
    try {
      console.log(`[StreakService] Updating daily contribution for user ${userId}, activity: ${activityType}`);
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find today's contribution or create new one
      let todayContribution = user.dailyContributions.find(
        contribution => contribution.date.getTime() === today.getTime()
      );

      if (!todayContribution) {
        todayContribution = {
          date: today,
          posts: 0,
          likes: 0,
          comments: 0
        };
        user.dailyContributions.push(todayContribution);
        console.log(`[StreakService] Created new daily contribution for today`);
      }

      // Increment the appropriate activity
      todayContribution[activityType] += 1;
      console.log(`[StreakService] Updated ${activityType} to ${todayContribution[activityType]}`);

      // Update totalPosts if this is a post activity
      if (activityType === 'posts') {
        user.totalPosts += 1;
        console.log(`[StreakService] Updated totalPosts to ${user.totalPosts}`);
      }

      // Calculate new streaks
      const { currentStreak, longestStreak } = this.calculateStreak(user.dailyContributions);
      
      user.currentStreak = currentStreak;
      user.longestStreak = Math.max(user.longestStreak, longestStreak);

      await user.save();
      console.log(`[StreakService] Saved user data. Current streak: ${user.currentStreak}, Longest streak: ${user.longestStreak}`);
      
      return {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        todayContribution: todayContribution,
        totalPosts: user.totalPosts
      };
    } catch (error) {
      console.error('Error updating daily contribution:', error);
      throw error;
    }
  }

  // Decrement user's daily contribution (for post deletion)
  static async decrementDailyContribution(userId, activityType = 'posts') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find today's contribution
      let todayContribution = user.dailyContributions.find(
        contribution => contribution.date.getTime() === today.getTime()
      );

      if (todayContribution && todayContribution[activityType] > 0) {
        // Decrement the appropriate activity
        todayContribution[activityType] = Math.max(0, todayContribution[activityType] - 1);

        // Update totalPosts if this is a post activity
        if (activityType === 'posts') {
          user.totalPosts = Math.max(0, user.totalPosts - 1);
        }

        // Recalculate streaks
        const { currentStreak, longestStreak } = this.calculateStreak(user.dailyContributions);
        
        user.currentStreak = currentStreak;
        user.longestStreak = Math.max(user.longestStreak, longestStreak);

        await user.save();
        
        return {
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          todayContribution: todayContribution,
          totalPosts: user.totalPosts
        };
      }

      return {
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        todayContribution: todayContribution,
        totalPosts: user.totalPosts
      };
    } catch (error) {
      console.error('Error decrementing daily contribution:', error);
      throw error;
    }
  }

  // Get streak data for calendar visualization
  static async getStreakData(userId, days = 365) {
    try {
      console.log(`[StreakService] Getting streak data for user ${userId}`);
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const calendarData = [];
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const date = new Date(d);
        const contribution = user.dailyContributions.find(
          c => c.date.getTime() === date.getTime()
        );

        const totalActivity = contribution 
          ? (contribution.posts + contribution.likes + contribution.comments)
          : 0;

        const dayData = {
          date: date.toISOString().split('T')[0],
          activity: totalActivity,
          posts: contribution?.posts || 0,
          likes: contribution?.likes || 0,
          comments: contribution?.comments || 0
        };
        
        if (dayData.posts > 0) {
          console.log(`[StreakService] Found day with posts: ${dayData.date}, posts: ${dayData.posts}`);
        }
        
        calendarData.push(dayData);
      }

      const { currentStreak, longestStreak } = this.calculateStreak(user.dailyContributions);

      // Get total likes received on user's posts
      const userPosts = await BlogPost.find({ author: userId });
      const totalLikesReceived = userPosts.reduce((total, post) => total + post.likes.length, 0);

      const result = {
        calendarData,
        currentStreak,
        longestStreak,
        totalPosts: user.totalPosts,
        totalLikesReceived,
        totalContributions: user.dailyContributions.length
      };
      
      console.log(`[StreakService] Returning streak data:`, {
        totalPosts: result.totalPosts,
        totalLikesReceived: result.totalLikesReceived,
        currentStreak: result.currentStreak,
        daysWithPosts: result.calendarData.filter(d => d.posts > 0).length
      });

      return result;
    } catch (error) {
      console.error('Error getting streak data:', error);
      throw error;
    }
  }

  // Reset streaks for users who haven't been active
  static async resetInactiveStreaks() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const users = await User.find({
        currentStreak: { $gt: 0 }
      });

      let resetCount = 0;

      for (const user of users) {
        const yesterdayContribution = user.dailyContributions.find(
          contribution => contribution.date.getTime() === yesterday.getTime()
        );

        // If no activity yesterday, reset streak
        if (!yesterdayContribution || 
            (yesterdayContribution.posts === 0 && 
             yesterdayContribution.likes === 0 && 
             yesterdayContribution.comments === 0)) {
          
          user.currentStreak = 0;
          await user.save();
          resetCount++;
        }
      }

      console.log(`Reset streaks for ${resetCount} inactive users`);
      return resetCount;
    } catch (error) {
      console.error('Error resetting inactive streaks:', error);
      throw error;
    }
  }

  // Get streak statistics for all users
  static async getStreakStats() {
    try {
      const stats = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            avgCurrentStreak: { $avg: '$currentStreak' },
            avgLongestStreak: { $avg: '$longestStreak' },
            maxCurrentStreak: { $max: '$currentStreak' },
            maxLongestStreak: { $max: '$longestStreak' },
            totalPosts: { $sum: '$totalPosts' }
          }
        }
      ]);

      return stats[0] || {
        totalUsers: 0,
        avgCurrentStreak: 0,
        avgLongestStreak: 0,
        maxCurrentStreak: 0,
        maxLongestStreak: 0,
        totalPosts: 0
      };
    } catch (error) {
      console.error('Error getting streak stats:', error);
      throw error;
    }
  }

  // Check and award badges based on streaks
  static async checkAndAwardBadges(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const badges = [];

      // First post badge
      if (user.totalPosts >= 1 && !user.earnedBadges.some(b => b.badgeId === 'first-post')) {
        badges.push({
          badgeId: 'first-post',
          name: 'First Post',
          description: 'Published your first blog post',
          icon: '📝'
        });
      }

      // Streak badges
      if (user.currentStreak >= 7) {
        badges.push({
          badgeId: 'week-streak',
          name: 'Week Warrior',
          description: 'Maintained a 7-day streak',
          icon: '🔥'
        });
      }

      if (user.currentStreak >= 30) {
        badges.push({
          badgeId: 'month-streak',
          name: 'Monthly Master',
          description: 'Maintained a 30-day streak',
          icon: '⭐'
        });
      }

      if (user.longestStreak >= 100) {
        badges.push({
          badgeId: 'century-streak',
          name: 'Century Club',
          description: 'Achieved a 100-day streak',
          icon: '🏆'
        });
      }

      // Add badges to user
      for (const badge of badges) {
        await user.addBadge(badge);
      }

      return badges;
    } catch (error) {
      console.error('Error checking badges:', error);
      throw error;
    }
  }
}

module.exports = StreakService; 