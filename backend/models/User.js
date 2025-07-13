const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/dejyntlu6/image/upload/v1/default-avatar.png'
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot be more than 200 characters']
  },
  // Streak tracking system
  dailyContributions: [{
    date: {
      type: Date,
      required: true
    },
    posts: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    }
  }],
  // Badge system
  earnedBadges: [{
    badgeId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // User stats
  totalPosts: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalBadges: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  // Profile information
  website: String,
  location: String,
  socialLinks: {
    twitter: String,
    linkedin: String,
    github: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // User's liked posts
  likedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost'
  }],
  // User's saved posts
  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost'
  }]
}, {
  timestamps: true
});

// Virtual fields for calculated data
userSchema.virtual('fullProfile').get(function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    bio: this.bio,
    stats: {
      totalPosts: this.totalPosts,
      currentStreak: this.currentStreak,
      longestStreak: this.longestStreak,
      totalBadges: this.totalBadges,
      totalPoints: this.totalPoints
    },
    badges: this.earnedBadges,
    socialLinks: this.socialLinks,
    isVerified: this.isVerified,
    role: this.role,
    createdAt: this.createdAt
  };
});

// Index for search functionality
userSchema.index({ name: 'text', email: 'text', bio: 'text' });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// JWT token generation method
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { userId: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRETKEY,
    { expiresIn: '7d' }
  );
};

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update streak method
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayContribution = this.dailyContributions.find(
    contribution => contribution.date.getTime() === today.getTime()
  );
  
  if (todayContribution && (todayContribution.posts > 0 || todayContribution.likes > 0 || todayContribution.comments > 0)) {
    this.currentStreak += 1;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  } else {
    this.currentStreak = 0;
  }
  
  return this.save();
};

// Add badge method
userSchema.methods.addBadge = function(badgeData) {
  const existingBadge = this.earnedBadges.find(badge => badge.badgeId === badgeData.badgeId);
  
  if (!existingBadge) {
    this.earnedBadges.push(badgeData);
    this.totalBadges = this.earnedBadges.length;
    return this.save();
  }
  
  return this;
};

module.exports = mongoose.model('User', userSchema); 