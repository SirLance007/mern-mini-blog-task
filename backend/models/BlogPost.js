const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    minlength: [10, 'Content must be at least 10 characters']
  },
  excerpt: {
    type: String,
    maxlength: [200, 'Excerpt cannot be more than 200 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: ['technology', 'lifestyle', 'travel', 'food', 'health', 'business', 'entertainment', 'other'],
    default: 'other'
  },
  // Image upload support with Cloudinary URLs
  featuredImage: {
    publicId: String,
    url: String,
    alt: String
  },
  // Like system with user references
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // View count tracking
  viewCount: {
    type: Number,
    default: 0
  },
  viewHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String
  }],
  // Reading time calculation
  readingTime: {
    type: Number,
    default: 0
  },
  // Trending score calculation
  trendingScore: {
    type: Number,
    default: 0
  },
  // Post status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  // SEO fields
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot be more than 160 characters']
  },
  // Engagement metrics
  commentCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  // Featured post flag
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Publish date
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for search functionality
blogPostSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogPostSchema.index({ author: 1, createdAt: -1 });
blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ trendingScore: -1 });
blogPostSchema.index({ category: 1, status: 1 });

// Virtual for like count
blogPostSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for isLiked (to be used with user context)
blogPostSchema.virtual('isLiked').get(function() {
  return false; // This will be set dynamically based on user
});

// Pre-save middleware to calculate reading time
blogPostSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  next();
});

// Method to calculate trending score
blogPostSchema.methods.calculateTrendingScore = function() {
  const now = new Date();
  const hoursSincePublished = (now - this.publishedAt) / (1000 * 60 * 60);
  
  // Base score from likes and views
  const likeScore = this.likes.length * 10;
  const viewScore = this.viewCount * 0.1;
  const commentScore = this.commentCount * 5;
  
  // Time decay factor (posts lose relevance over time)
  const timeDecay = Math.max(0.1, 1 - (hoursSincePublished / 168)); // 1 week = 168 hours
  
  // Trending score formula
  this.trendingScore = Math.round((likeScore + viewScore + commentScore) * timeDecay);
  
  return this.save();
};

// Method to increment view count
blogPostSchema.methods.incrementView = function(userId = null, ipAddress = null) {
  this.viewCount += 1;
  
  // Add to view history if user is logged in
  if (userId) {
    this.viewHistory.push({
      user: userId,
      viewedAt: new Date(),
      ipAddress
    });
  }
  
  return this.save();
};

// Method to toggle like
blogPostSchema.methods.toggleLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    // Unlike
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  } else {
    // Like
    this.likes.push({
      user: userId,
      likedAt: new Date()
    });
  }
  
  return this.save();
};

// Method to check if user has liked the post
blogPostSchema.methods.hasUserLiked = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Static method to get trending posts
blogPostSchema.statics.getTrendingPosts = function(limit = 10, timeFrame = 'week') {
  const now = new Date();
  let startDate;
  
  switch (timeFrame) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  
  return this.find({
    status: 'published',
    publishedAt: { $gte: startDate }
  })
  .sort({ trendingScore: -1 })
  .limit(limit)
  .populate('author', 'name avatar');
};

// Static method to search posts
blogPostSchema.statics.searchPosts = function(query, options = {}) {
  const { 
    page = 1, 
    limit = 10, 
    category, 
    status = 'published',
    sortBy = 'relevance',
    timeFrame = 'all'
  } = options;
  const skip = (page - 1) * limit;
  
  // Build search query
  const searchQuery = {
    status
  };
  
  // Text search
  if (query && query.trim()) {
    searchQuery.$text = { $search: query };
  }
  
  // Category filter
  if (category && category !== 'all') {
    searchQuery.category = category;
  }
  
  // Time frame filter
  if (timeFrame && timeFrame !== 'all') {
    const now = new Date();
    let startDate;
    
    switch (timeFrame) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = null;
    }
    
    if (startDate) {
      searchQuery.createdAt = { $gte: startDate };
    }
  }
  
  // Build sort object
  let sortObject = {};
  switch (sortBy) {
    case 'relevance':
      if (query && query.trim()) {
        sortObject = { score: { $meta: 'textScore' } };
      } else {
        sortObject = { createdAt: -1 };
      }
      break;
    case 'recent':
      sortObject = { createdAt: -1 };
      break;
    case 'popular':
      sortObject = { 'likes.length': -1, viewCount: -1 };
      break;
    case 'likes':
      sortObject = { 'likes.length': -1 };
      break;
    case 'views':
      sortObject = { viewCount: -1 };
      break;
    default:
      sortObject = { createdAt: -1 };
  }
  
  return this.find(searchQuery)
    .sort(sortObject)
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar');
};

module.exports = mongoose.model('BlogPost', blogPostSchema); 