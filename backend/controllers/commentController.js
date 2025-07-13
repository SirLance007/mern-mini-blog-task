const Comment = require('../models/Comment');
const BlogPost = require('../models/BlogPost');
const { validationResult } = require('express-validator');

// Add a comment to a post
const addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, parentCommentId } = req.body;
    const postId = req.params.postId;
    const userId = req.user._id;

    // Check if post exists
    const post = await BlogPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Create comment
    const commentData = {
      content,
      author: userId,
      post: postId
    };

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
      commentData.parentComment = parentCommentId;
    }

    const comment = new Comment(commentData);
    await comment.save();

    // Update post comment count
    post.commentCount += 1;
    await post.save();

    // Update streak for comment activity
    const StreakService = require('../services/streakService.js');
    await StreakService.updateDailyContribution(userId, 'comments');

    // Populate author details
    await comment.populate('author', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: {
          _id: comment._id,
          content: comment.content,
          author: comment.author,
          createdAt: comment.createdAt,
          likeCount: comment.likeCount,
          isLiked: false
        }
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get comments for a post
const getComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await BlogPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get comments with pagination
    const comments = await Comment.find({ 
      post: postId, 
      status: 'active',
      parentComment: null // Only top-level comments
    })
    .populate('author', 'name avatar')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'name avatar'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Get total count
    const totalComments = await Comment.countDocuments({ 
      post: postId, 
      status: 'active',
      parentComment: null
    });

    // Set isLiked for each comment if user is authenticated
    const userId = req.user?._id;
    const commentsWithLikes = comments.map(comment => {
      const commentObj = comment.toObject();
      commentObj.isLiked = userId ? comment.likes.some(like => like.user.toString() === userId.toString()) : false;
      return commentObj;
    });

    res.json({
      success: true,
      data: {
        comments: commentsWithLikes,
        pagination: {
          page,
          limit,
          total: totalComments,
          pages: Math.ceil(totalComments / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Like/unlike a comment
const toggleCommentLike = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    await comment.toggleLike(userId);

    res.json({
      success: true,
      message: 'Comment like toggled successfully',
      data: {
        isLiked: comment.likes.some(like => like.user.toString() === userId.toString()),
        likeCount: comment.likes.length
      }
    });
  } catch (error) {
    console.error('Toggle comment like error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete a comment (soft delete)
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author or an admin
    if (comment.author.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    await comment.softDelete();

    // Update post comment count
    const post = await BlogPost.findById(comment.post);
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1);
      await post.save();
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  addComment,
  getComments,
  toggleCommentLike,
  deleteComment
}; 