const express = require('express');
const { body } = require('express-validator');
const { auth, optionalAuth } = require('../middleware/auth');
const {
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
} = require('../controllers/postController');

const router = express.Router();

// Validation middleware
const createPostValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Excerpt cannot be more than 200 characters'),
  body('category')
    .optional()
    .isIn(['technology', 'lifestyle', 'travel', 'food', 'health', 'business', 'entertainment', 'other'])
    .withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const updatePostValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Excerpt cannot be more than 200 characters'),
  body('category')
    .optional()
    .isIn(['technology', 'lifestyle', 'travel', 'food', 'health', 'business', 'entertainment', 'other'])
    .withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// Public routes
router.get('/', optionalAuth, getAllPosts);
router.get('/trending', optionalAuth, getTrendingPosts);
router.get('/search', optionalAuth, searchPosts);
router.get('/user/:userId', optionalAuth, getUserPosts);

// Protected routes
router.post('/', auth, createPostValidation, createPost);
router.put('/:id', auth, updatePostValidation, updatePost);
router.delete('/:id', auth, deletePost);
router.put('/:id/like', auth, toggleLike);
router.post('/:id/save', auth, savePost);
router.delete('/:id/save', auth, unsavePost);

// Specific routes must come before parameterized routes
router.get('/my', auth, getMyPosts);
router.get('/liked', auth, getLikedPosts);
router.get('/saved', auth, getSavedPosts);

// Parameterized routes must come last
router.get('/:id', optionalAuth, getPostById);

module.exports = router; 