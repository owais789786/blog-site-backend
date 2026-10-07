const Post = require('./post.model');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

// 1. Get All Published Blogs (Public)
const getAllPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const query = {
    status: 'published',
    title: { $regex: search, $options: 'i' },
  };

  const posts = await Post.find(query)
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Post.countDocuments(query);

  res.json({
    posts,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  });
});

// 2. Get Single Blog By Slug (Public)
const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate('author', 'name avatar email');
  if (!post) {
    throw new AppError('Blog post not found', 404);
  }
  res.json(post);
});

// 3. Create New Blog (Protected Route)
const createPost = asyncHandler(async (req, res) => {
  const { title, content, excerpt, coverImage, tags } = req.body;

  const newPost = await Post.create({
    title,
    content,
    excerpt,
    coverImage,
    tags,
    author: req.user._id,
  });

  res.status(201).json(newPost);
});

module.exports = { getAllPosts, getPostBySlug, createPost };

