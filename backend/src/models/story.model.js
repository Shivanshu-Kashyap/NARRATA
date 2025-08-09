import mongoose, { Schema } from 'mongoose';
import { STORY_STATUS, STORY_CATEGORIES } from '../utils/constants.js';

const storySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Story title is required'],
      trim: true,
      maxLength: [200, 'Title cannot exceed 200 characters'],
      minLength: [3, 'Title must be at least 3 characters long']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    content: {
      type: String,
      required: [true, 'Story content is required'],
      minLength: [100, 'Story content must be at least 100 characters long']
    },
    excerpt: {
      type: String,
      maxLength: [500, 'Excerpt cannot exceed 500 characters'],
      trim: true
    },
    coverImage: {
      type: String, // Cloudinary URL
      default: null
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: STORY_CATEGORIES,
      required: [true, 'Story category is required'],
      index: true
    },
    tags: [{
      type: String,
      lowercase: true,
      trim: true,
      maxLength: [30, 'Tag cannot exceed 30 characters']
    }],
    status: {
      type: String,
      enum: Object.values(STORY_STATUS),
      default: STORY_STATUS.DRAFT,
      index: true
    },
    // Story statistics
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      readTime: { type: Number, default: 0 } // in minutes
    },
    // Engagement tracking
    likedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    dislikedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    // Publication details
    publishedAt: {
      type: Date,
      default: null,
      index: true
    },
    lastModifiedAt: {
      type: Date,
      default: Date.now
    },
    // Content metadata
    wordCount: {
      type: Number,
      default: 0
    },
    language: {
      type: String,
      default: 'en',
      lowercase: true
    },
    // Story settings
    settings: {
      allowComments: { type: Boolean, default: true },
      featured: { type: Boolean, default: false },
      mature: { type: Boolean, default: false },
      draft: { type: Boolean, default: true }
    },
    // SEO fields
    metaTitle: {
      type: String,
      maxLength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxLength: [160, 'Meta description cannot exceed 160 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ status: 1, publishedAt: -1 });
storySchema.index({ category: 1, publishedAt: -1 });
storySchema.index({ tags: 1 });
storySchema.index({ 'stats.views': -1 });
storySchema.index({ 'stats.likes': -1 });
storySchema.index({ slug: 1 });
storySchema.index({ title: 'text', content: 'text', tags: 'text' });

// Virtual for comments
storySchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'story'
});

// Virtual for rating calculation
storySchema.virtual('rating').get(function () {
  const totalVotes = this.stats.likes + this.stats.dislikes;
  if (totalVotes === 0) return 0;
  return (this.stats.likes / totalVotes) * 5; // 5-star rating
});

// Virtual for engagement score
storySchema.virtual('engagementScore').get(function () {
  return this.stats.views * 0.1 + 
         this.stats.likes * 2 + 
         this.stats.comments * 3 + 
         this.stats.shares * 5;
});

// Generate slug before saving
storySchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();
  
  try {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let slug = baseSlug;
    let counter = 0;
    
    // Check for existing slugs and increment counter if needed
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
    
    this.slug = slug;
    next();
  } catch (error) {
    next(error);
  }
});

// Calculate read time and word count before saving
storySchema.pre('save', function (next) {
  if (this.isModified('content')) {
    // Calculate word count
    const words = this.content.trim().split(/\s+/);
    this.wordCount = words.length;
    
    // Calculate read time (average 200 words per minute)
    this.stats.readTime = Math.ceil(this.wordCount / 200);
    
    // Generate excerpt if not provided
    if (!this.excerpt) {
      const plainText = this.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
      this.excerpt = plainText.substring(0, 300) + (plainText.length > 300 ? '...' : '');
    }
  }
  next();
});

// Update lastModifiedAt on save
storySchema.pre('save', function (next) {
  this.lastModifiedAt = new Date();
  next();
});

// Methods
storySchema.methods.publish = function () {
  this.status = STORY_STATUS.PUBLISHED;
  this.publishedAt = new Date();
  this.settings.draft = false;
  return this.save();
};

storySchema.methods.unpublish = function () {
  this.status = STORY_STATUS.DRAFT;
  this.publishedAt = null;
  this.settings.draft = true;
  return this.save();
};

storySchema.methods.incrementViews = function () {
  this.stats.views += 1;
  return this.save({ validateBeforeSave: false });
};

storySchema.methods.toggleLike = async function (userId) {
  const isLiked = this.likedBy.includes(userId);
  const isDisliked = this.dislikedBy.includes(userId);
  
  if (isLiked) {
    // Remove like
    this.likedBy.pull(userId);
    this.stats.likes -= 1;
  } else {
    // Add like
    this.likedBy.push(userId);
    this.stats.likes += 1;
    
    // Remove dislike if exists
    if (isDisliked) {
      this.dislikedBy.pull(userId);
      this.stats.dislikes -= 1;
    }
  }
  
  return this.save({ validateBeforeSave: false });
};

storySchema.methods.toggleDislike = async function (userId) {
  const isLiked = this.likedBy.includes(userId);
  const isDisliked = this.dislikedBy.includes(userId);
  
  if (isDisliked) {
    // Remove dislike
    this.dislikedBy.pull(userId);
    this.stats.dislikes -= 1;
  } else {
    // Add dislike
    this.dislikedBy.push(userId);
    this.stats.dislikes += 1;
    
    // Remove like if exists
    if (isLiked) {
      this.likedBy.pull(userId);
      this.stats.likes -= 1;
    }
  }
  
  return this.save({ validateBeforeSave: false });
};

export const Story = mongoose.model('Story', storySchema);
