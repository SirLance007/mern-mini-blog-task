const BlogPost = require('../models/BlogPost');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get user's liked posts
const getLikedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get posts that the user has liked
    const posts = await BlogPost.find({
      '_id': { $in: user.likedPosts || [] },
      'status': 'published'
    }).populate('author', 'name avatar');

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Get liked posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's saved posts
const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get posts that the user has saved
    const posts = await BlogPost.find({
      '_id': { $in: user.savedPosts || [] },
      'status': 'published'
    }).populate('author', 'name avatar');

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all posts with pagination
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const posts = await BlogPost.find(query)
      .populate('author', 'name avatar')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id)
      .populate('author', 'name avatar bio')
      .populate('likes.user', 'name avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await post.incrementView(req.user?._id, req.ip);

    // Check if user has liked the post
    if (req.user) {
      post.isLiked = post.hasUserLiked(req.user._id);
    }

    // Get comments for the post
    const Comment = require('../models/Comment');
    const comments = await Comment.find({ 
      post: id, 
      status: 'active',
      parentComment: null // Only top-level comments
    })
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(10);

    // Set isLiked for each comment if user is authenticated
    const commentsWithLikes = comments.map(comment => {
      const commentObj = comment.toObject();
      commentObj.isLiked = req.user ? comment.likes.some(like => like.user.toString() === req.user._id.toString()) : false;
      return commentObj;
    });

    res.json({
      success: true,
      data: { 
        post: {
          ...post.toObject(),
          comments: commentsWithLikes
        }
      }
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new post
const createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, excerpt, tags, category, status = 'draft', featuredImage } = req.body;

    const post = new BlogPost({
      title,
      content,
      excerpt,
      tags: tags || [],
      category,
      status,
      author: req.user._id,
      featuredImage,
      publishedAt: status === 'published' ? new Date() : null
    });

    await post.save();

    // Update streak for post creation
    const StreakService = require('../services/streakService.js');
    await StreakService.updateDailyContribution(req.user._id, 'posts');
    
    // Check for new badges
    const newBadges = await StreakService.checkAndAwardBadges(req.user._id);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { title, content, excerpt, tags, category, status, featuredImage } = req.body;

    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts'
      });
    }

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (tags) post.tags = tags;
    if (category) post.category = category;
    if (status) {
      post.status = status;
      if (status === 'published' && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }
    if (featuredImage) post.featuredImage = featuredImage;

    await post.save();

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    await BlogPost.findByIdAndDelete(id);

    // Update user stats and streak
    const StreakService = require('../services/streakService.js');
    await StreakService.decrementDailyContribution(req.user._id, 'posts');

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Like/unlike post
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const wasLiked = post.hasUserLiked(req.user._id);
    await post.toggleLike(req.user._id);

    // Update user's likedPosts array
    const user = await User.findById(req.user._id);
    if (wasLiked) {
      // Remove from liked posts
      user.likedPosts = user.likedPosts.filter(postId => postId.toString() !== id);
    } else {
      // Add to liked posts
      user.likedPosts.push(id);
      
      // Update streak for like activity
      const StreakService = require('../services/streakService.js');
      await StreakService.updateDailyContribution(req.user._id, 'likes');
    }
    await user.save();

    // Update streak for post author if they received a like
    if (!wasLiked && post.author.toString() !== req.user._id.toString()) {
      const StreakService = require('../services/streakService.js');
      await StreakService.updateDailyContribution(post.author.toString(), 'likes');
    }

    res.json({
      success: true,
      message: 'Like toggled successfully',
      data: {
        likeCount: post.likes.length,
        isLiked: post.hasUserLiked(req.user._id)
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Save post
const savePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add to user's saved posts
    const user = await User.findById(req.user._id);
    const alreadySaved = user.savedPosts.some(postId => postId.toString() === id);
    
    if (alreadySaved) {
      return res.status(400).json({
        success: false,
        message: 'Post is already saved'
      });
    }

    user.savedPosts.push(id);
    await user.save();

    res.json({
      success: true,
      message: 'Post saved successfully'
    });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Unsave post
const unsavePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Remove from user's saved posts
    const user = await User.findById(req.user._id);
    user.savedPosts = user.savedPosts.filter(postId => postId.toString() !== id);
    await user.save();

    res.json({
      success: true,
      message: 'Post removed from saved'
    });
  } catch (error) {
    console.error('Unsave post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get trending posts
const getTrendingPosts = async (req, res) => {
  try {
    const { timeFrame = 'week', limit = 10 } = req.query;

    const posts = await BlogPost.getTrendingPosts(parseInt(limit), timeFrame);

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Search posts
const searchPosts = async (req, res) => {
  try {
    const { 
      q: query, 
      page = 1, 
      limit = 10, 
      category,
      sortBy = 'relevance',
      timeFrame = 'all'
    } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const posts = await BlogPost.searchPosts(query, {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      sortBy,
      timeFrame
    });

    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's posts
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = { author: userId, status: 'published' };
    const skip = (page - 1) * limit;

    const posts = await BlogPost.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user's posts
const getMyPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = { author: req.user._id, status: 'published' };
    const skip = (page - 1) * limit;

    const posts = await BlogPost.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  savePost,
  unsavePost,
  getTrendingPosts,
  searchPosts,
  getUserPosts,
  getMyPosts,
  getLikedPosts,
  getSavedPosts
}; 