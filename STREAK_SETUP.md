# Streak Tracking System Setup Guide

## Overview

This comprehensive streak tracking system has been implemented with the following features:

### Backend Features
- ✅ Daily contribution tracking with date and post count
- ✅ Streak calculation logic for consecutive days
- ✅ Streak reset logic when streak breaks
- ✅ Background job checking for streak maintenance
- ✅ API endpoints for streak data and calendar visualization
- ✅ Badge system with automatic awarding
- ✅ Leaderboard functionality

### Frontend Features
- ✅ GitHub-style contribution calendar component
- ✅ Streak stats display (current, longest, total posts)
- ✅ Calendar grid with color-coded activity levels
- ✅ Responsive design for mobile and desktop
- ✅ Smooth animations and hover effects
- ✅ Badge display and progress tracking

## Database Schema Updates

The User model has been enhanced with:

```javascript
// Streak tracking system
dailyContributions: [{
  date: { type: Date, required: true },
  posts: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 }
}],

// Badge system
earnedBadges: [{
  badgeId: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  icon: String,
  earnedAt: { type: Date, default: Date.now }
}],

// User stats
totalPosts: { type: Number, default: 0 },
currentStreak: { type: Number, default: 0 },
longestStreak: { type: Number, default: 0 },
totalBadges: { type: Number, default: 0 },
totalPoints: { type: Number, default: 0 }
```

## Installation Steps

### 1. Backend Dependencies

The following dependencies have been added to `package.json`:

```bash
npm install node-cron
```

### 2. Backend Files Created/Modified

#### New Files:
- `services/streakService.js` - Core streak logic and calculations
- `services/scheduler.js` - Background job scheduler
- `routes/streak.js` - API endpoints for streak functionality

#### Modified Files:
- `server.js` - Added streak routes and scheduler initialization
- `controllers/postController.js` - Added streak updates for post creation
- `controllers/commentController.js` - Added streak updates for comments
- `models/User.js` - Enhanced with streak tracking fields

### 3. Frontend Files Created

#### New Components:
- `components/ContributionCalendar.jsx` - GitHub-style calendar
- `components/StreakStats.jsx` - Streak statistics display
- `components/BadgesDisplay.jsx` - Badge showcase
- `pages/StreakPage.jsx` - Main streak dashboard

#### Modified Files:
- `App.jsx` - Added streak route
- `components/Navbar.jsx` - Added streak navigation link

## API Endpoints

### Streak Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/streak/user/:userId` | Get user's streak data |
| GET | `/api/streak/calendar/:userId` | Get calendar data for visualization |
| POST | `/api/streak/update/:userId` | Update user's daily contribution |
| GET | `/api/streak/stats` | Get global streak statistics |
| POST | `/api/streak/reset-inactive` | Reset streaks for inactive users (admin) |
| GET | `/api/streak/leaderboard` | Get streak leaderboard |
| GET | `/api/streak/badges/:userId` | Get user's badges |

## Features

### 1. Daily Contribution Tracking
- Tracks posts, likes, and comments per day
- Automatically updates when users create posts, like posts, or comment
- Maintains historical data for calendar visualization

### 2. Streak Calculation
- Current streak: Consecutive days with activity
- Longest streak: Best streak achieved
- Resets automatically when user misses a day

### 3. Badge System
- **First Post**: Awarded for first blog post
- **Week Warrior**: 7-day streak
- **Monthly Master**: 30-day streak  
- **Century Club**: 100-day streak

### 4. Background Jobs
- Daily streak reset at 2 AM UTC
- Global stats update at 3 AM UTC
- Weekly cleanup at 4 AM UTC (Sundays)

### 5. Calendar Visualization
- GitHub-style contribution grid
- Color-coded activity levels
- Interactive tooltips
- Responsive design

## Usage

### For Users
1. Navigate to `/streak` to view your streak dashboard
2. Create posts, like posts, or comment to build your streak
3. View your contribution calendar and statistics
4. Earn badges by maintaining streaks

### For Developers
1. The system automatically tracks activity
2. Streaks update in real-time
3. Badges are awarded automatically
4. Background jobs handle maintenance

## Configuration

### Environment Variables
No additional environment variables required. The system uses existing database connections.

### Scheduler Configuration
The scheduler runs the following jobs:
- **Daily at 2 AM**: Reset inactive streaks
- **Daily at 3 AM**: Update global statistics
- **Weekly at 4 AM**: Cleanup old data

## Error Handling

The system includes comprehensive error handling:
- Database connection errors
- Invalid user IDs
- Missing data scenarios
- Network timeouts
- Rate limiting protection

## Performance Considerations

- Indexed database queries for fast streak calculations
- Efficient calendar data generation
- Background job processing to avoid blocking
- Cached user statistics

## Testing

To test the streak system:

1. Create a new post → Should increment daily posts
2. Like a post → Should increment daily likes  
3. Comment on a post → Should increment daily comments
4. Visit `/streak` → Should see updated calendar and stats
5. Maintain activity for 7+ days → Should earn Week Warrior badge

## Troubleshooting

### Common Issues

1. **Streak not updating**: Check if user is authenticated
2. **Calendar not showing**: Verify API endpoint is accessible
3. **Badges not appearing**: Check if user meets badge requirements
4. **Background jobs not running**: Verify node-cron is installed

### Debug Steps

1. Check server logs for error messages
2. Verify database connections
3. Test API endpoints directly
4. Check user authentication status

## Future Enhancements

Potential improvements:
- More badge types
- Streak sharing features
- Social features (streak challenges)
- Advanced analytics
- Export functionality
- Mobile app integration

## Support

For issues or questions:
1. Check server logs for errors
2. Verify all dependencies are installed
3. Test API endpoints individually
4. Review database schema updates

The streak tracking system is now fully integrated and ready to use! 