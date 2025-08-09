import mongoose, { Schema } from 'mongoose';
import { COMMENT_STATUS } from '../utils/constants.js';

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minLength: [1, 'Comment cannot be empty'],
      maxLength: [1000, 'Comment cannot exceed 1000 characters']
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    story: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
      index: true
    },
    // For nested comments (replies)
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true
    },
    // Comment threading level (0 = top-level, 1 = reply, 2 = reply to reply, etc.)
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 3 // Limit nesting to 3 levels
    },
    status: {
      type: String,
      enum: Object.values(COMMENT_STATUS),
      default: COMMENT_STATUS.ACTIVE,
      index: true
    },
    // Comment statistics
    stats: {
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
      replies: { type: Number, default: 0 }
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
    // Moderation
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date,
      default: null
    },
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    moderatedAt: {
      type: Date,
      default: null
    },
    moderationReason: {
      type: String,
      maxLength: [200, 'Moderation reason cannot exceed 200 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
commentSchema.index({ story: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });
commentSchema.index({ status: 1 });

// Virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

// Update parent comment reply count
commentSchema.pre('save', async function (next) {
  if (this.isNew && this.parentComment) {
    await this.constructor.findByIdAndUpdate(
      this.parentComment,
      { $inc: { 'stats.replies': 1 } }
    );
  }
  next();
});

// Update story comment count
commentSchema.pre('save', async function (next) {
  if (this.isNew) {
    await mongoose.model('Story').findByIdAndUpdate(
      this.story,
      { $inc: { 'stats.comments': 1 } }
    );
  }
  next();
});

// Decrease counts when comment is deleted
commentSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  // Decrease parent comment reply count
  if (this.parentComment) {
    await this.constructor.findByIdAndUpdate(
      this.parentComment,
      { $inc: { 'stats.replies': -1 } }
    );
  }
  
  // Decrease story comment count
  await mongoose.model('Story').findByIdAndUpdate(
    this.story,
    { $inc: { 'stats.comments': -1 } }
  );
  
  next();
});

// Methods
commentSchema.methods.toggleLike = async function (userId) {
  const isLiked = this.likedBy.includes(userId);
  const isDisliked = this.dislikedBy.includes(userId);
  
  if (isLiked) {
    this.likedBy.pull(userId);
    this.stats.likes -= 1;
  } else {
    this.likedBy.push(userId);
    this.stats.likes += 1;
    
    if (isDisliked) {
      this.dislikedBy.pull(userId);
      this.stats.dislikes -= 1;
    }
  }
  
  return this.save({ validateBeforeSave: false });
};

commentSchema.methods.toggleDislike = async function (userId) {
  const isLiked = this.likedBy.includes(userId);
  const isDisliked = this.dislikedBy.includes(userId);
  
  if (isDisliked) {
    this.dislikedBy.pull(userId);
    this.stats.dislikes -= 1;
  } else {
    this.dislikedBy.push(userId);
    this.stats.dislikes += 1;
    
    if (isLiked) {
      this.likedBy.pull(userId);
      this.stats.likes -= 1;
    }
  }
  
  return this.save({ validateBeforeSave: false });
};

commentSchema.methods.markAsEdited = function () {
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

commentSchema.methods.moderate = function (moderatorId, reason, status = COMMENT_STATUS.HIDDEN) {
  this.status = status;
  this.moderatedBy = moderatorId;
  this.moderatedAt = new Date();
  this.moderationReason = reason;
  return this.save();
};

export const Comment = mongoose.model('Comment', commentSchema);
