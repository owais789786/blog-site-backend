const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    coverImage: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    readingTime: { type: Number, default: 3 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

postSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200) || 1;
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);

