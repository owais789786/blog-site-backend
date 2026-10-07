const router = require('express').Router();
const { getAllPosts, getPostBySlug, createPost } = require('./post.controller');
const { protect } = require('../auth/auth.middleware');

router.get('/', getAllPosts);
router.post('/', protect, createPost);
router.get('/:slug', getPostBySlug);

module.exports = router;

