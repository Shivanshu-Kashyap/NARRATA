import mongoose, { Schema } from 'mongoose';

const leaderboardEntrySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    // Scoring metrics
    totalScore: {
      type: Number,
      default: 0,
      index: true
    },
    storyScore: {
      type: Number,
      default: 0
    },
    engagementScore: {
      type: Number,
      default: 0
    },
    qualityScore: {
      type: Number,
      default: 0
    },
    // Individual metrics
    metrics: {
      totalStories: { type: Number, default: 0 },
      publishedStories: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 },
      totalShares: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      followerCount: { type: Number, default: 0 },
      // Engagement rates
      averageViewsPerStory: { type: Number, default: 0 },
      averageLikesPerStory: { type: Number, default: 0 },
      averageCommentsPerStory: { type: Number, default: 0 },
      // Quality indicators
      featuredStories: { type: Number, default: 0 },
      likesToViewsRatio: { type: Number, default: 0 },
      commentsToViewsRatio: { type: Number, default: 0 }
    },
    // Rankings
    currentRank: {
      overall: { type: Number, default: 0 },
      category: { type: Number, default: 0 },
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 }
    },
    previousRank: {
      overall: { type: Number, default: 0 },
      category: { type: Number, default: 0 },
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 }
    },
    // Badges and achievements
    badges: [{
      name: String,
      description: String,
      icon: String,
      earnedAt: { type: Date, default: Date.now }
    }],
    achievements: [{
      type: String,
      description: String,
      unlockedAt: { type: Date, default: Date.now },
      value: Number
    }],
    // Time-based scores for trending
    weeklyScore: {
      type: Number,
      default: 0,
      index: true
    },
    monthlyScore: {
      type: Number,
      default: 0,
      index: true
    },
    // Last calculation timestamp
    lastCalculatedAt: {
      type: Date,
      default: Date.now
    },
    // Activity tracking
    isActive: {
      type: Boolean,
      default: true
    },
    lastActivityAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for leaderboard queries
leaderboardEntrySchema.index({ totalScore: -1 });
leaderboardEntrySchema.index({ weeklyScore: -1 });
leaderboardEntrySchema.index({ monthlyScore: -1 });
leaderboardEntrySchema.index({ 'currentRank.overall': 1 });
leaderboardEntrySchema.index({ lastCalculatedAt: 1 });

// Virtual for rank change
leaderboardEntrySchema.virtual('rankChange').get(function () {
  return {
    overall: this.previousRank.overall - this.currentRank.overall,
    category: this.previousRank.category - this.currentRank.category,
    weekly: this.previousRank.weekly - this.currentRank.weekly,
    monthly: this.previousRank.monthly - this.currentRank.monthly
  };
});

// Methods
leaderboardEntrySchema.methods.calculateScore = async function () {
  const user = await mongoose.model('User').findById(this.user);
  const stories = await mongoose.model('Story').find({ 
    author: this.user, 
    status: 'published' 
  });
  
  // Reset metrics
  this.metrics = {
    totalStories: stories.length,
    publishedStories: stories.filter(s => s.status === 'published').length,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    averageRating: 0,
    followerCount: user.stats.followerCount || 0,
    averageViewsPerStory: 0,
    averageLikesPerStory: 0,
    averageCommentsPerStory: 0,
    featuredStories: 0,
    likesToViewsRatio: 0,
    commentsToViewsRatio: 0
  };
  
  // Calculate totals from stories
  stories.forEach(story => {
    this.metrics.totalViews += story.stats.views;
    this.metrics.totalLikes += story.stats.likes;
    this.metrics.totalComments += story.stats.comments;
    this.metrics.totalShares += story.stats.shares;
    if (story.settings.featured) this.metrics.featuredStories++;
  });
  
  // Calculate averages
  if (this.metrics.publishedStories > 0) {
    this.metrics.averageViewsPerStory = this.metrics.totalViews / this.metrics.publishedStories;
    this.metrics.averageLikesPerStory = this.metrics.totalLikes / this.metrics.publishedStories;
    this.metrics.averageCommentsPerStory = this.metrics.totalComments / this.metrics.publishedStories;
    
    // Calculate ratios
    if (this.metrics.totalViews > 0) {
      this.metrics.likesToViewsRatio = this.metrics.totalLikes / this.metrics.totalViews;
      this.metrics.commentsToViewsRatio = this.metrics.totalComments / this.metrics.totalViews;
    }
  }
  
  // Calculate scores
  this.storyScore = this.metrics.totalStories * 10 + this.metrics.featuredStories * 50;
  
  this.engagementScore = 
    this.metrics.totalViews * 0.1 +
    this.metrics.totalLikes * 2 +
    this.metrics.totalComments * 3 +
    this.metrics.totalShares * 5 +
    this.metrics.followerCount * 1;
  
  this.qualityScore = 
    this.metrics.likesToViewsRatio * 1000 +
    this.metrics.commentsToViewsRatio * 1500 +
    this.metrics.featuredStories * 100;
  
  // Total score with weighted components
  this.totalScore = 
    this.storyScore * 0.3 +
    this.engagementScore * 0.5 +
    this.qualityScore * 0.2;
  
  this.lastCalculatedAt = new Date();
  this.lastActivityAt = new Date();
  
  return this.save();
};

leaderboardEntrySchema.methods.addBadge = function (name, description, icon) {
  const existingBadge = this.badges.find(badge => badge.name === name);
  if (!existingBadge) {
    this.badges.push({ name, description, icon });
    return this.save();
  }
  return this;
};

leaderboardEntrySchema.methods.addAchievement = function (type, description, value) {
  const existingAchievement = this.achievements.find(ach => ach.type === type);
  if (!existingAchievement) {
    this.achievements.push({ type, description, value });
    return this.save();
  }
  return this;
};

// Static methods for leaderboard operations
leaderboardEntrySchema.statics.updateRankings = async function () {
  try {
    // Overall rankings
    const overallRankings = await this.find({ isActive: true })
      .sort({ totalScore: -1 })
      .exec();
    
    for (let i = 0; i < overallRankings.length; i++) {
      const entry = overallRankings[i];
      entry.previousRank.overall = entry.currentRank.overall;
      entry.currentRank.overall = i + 1;
      await entry.save({ validateBeforeSave: false });
    }
    
    // Weekly rankings
    const weeklyRankings = await this.find({ isActive: true })
      .sort({ weeklyScore: -1 })
      .exec();
    
    for (let i = 0; i < weeklyRankings.length; i++) {
      const entry = weeklyRankings[i];
      entry.previousRank.weekly = entry.currentRank.weekly;
      entry.currentRank.weekly = i + 1;
      await entry.save({ validateBeforeSave: false });
    }
    
    // Monthly rankings
    const monthlyRankings = await this.find({ isActive: true })
      .sort({ monthlyScore: -1 })
      .exec();
    
    for (let i = 0; i < monthlyRankings.length; i++) {
      const entry = monthlyRankings[i];
      entry.previousRank.monthly = entry.currentRank.monthly;
      entry.currentRank.monthly = i + 1;
      await entry.save({ validateBeforeSave: false });
    }
    
    console.log('Leaderboard rankings updated successfully');
  } catch (error) {
    console.error('Error updating leaderboard rankings:', error);
    throw error;
  }
};

leaderboardEntrySchema.statics.getTopUsers = async function (limit = 10, timeframe = 'overall') {
  let sortBy = { totalScore: -1 };
  
  switch (timeframe) {
    case 'weekly':
      sortBy = { weeklyScore: -1 };
      break;
    case 'monthly':
      sortBy = { monthlyScore: -1 };
      break;
    default:
      sortBy = { totalScore: -1 };
  }
  
  return this.find({ isActive: true })
    .populate('user', 'username fullName avatar stats')
    .sort(sortBy)
    .limit(limit)
    .exec();
};

export const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);
