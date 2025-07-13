const express = require('express');
const { body } = require('express-validator');
const { auth, optionalAuth } = require('../middleware/auth');
const {
  addComment,
  getComments,
  toggleCommentLike,
  deleteComment
} = require('../controllers/commentController');

const router = express.Router();

// Validation middleware
const addCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID')
];

// Routes
router.post('/posts/:postId/comments', auth, addCommentValidation, addComment);
router.get('/posts/:postId/comments', optionalAuth, getComments);
router.put('/comments/:commentId/like', auth, toggleCommentLike);
router.delete('/comments/:commentId', auth, deleteComment);

module.exports = router; 