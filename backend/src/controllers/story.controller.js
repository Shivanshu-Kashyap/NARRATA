import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Story } from '../models/story.model.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary, deleteFromCloudinary, extractPublicId } from '../utils/cloudinary.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, STORY_CATEGORIES, STORY_STATUS } from '../utils/constants.js';

const createStory = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "User not authenticated. Please log in to create a story.");
  }

  const { title, content, excerpt, category, tags, metaTitle, metaDescription } = req.body;

  if (!title?.trim() || !content?.trim() || !category) {
    throw new ApiError(400, 'Title, content, and category are required');
  }

  if (!STORY_CATEGORIES.includes(category)) {
    throw new ApiError(400, 'A valid story category is required');
  }

  let coverImageUrl = null;
  if (req.file) {
    const coverImageUploadResult = await uploadOnCloudinary(req.file.path, 'narrata/covers');
    if (coverImageUploadResult) {
      coverImageUrl = coverImageUploadResult.secure_url;
    }
  } else {
    throw new ApiError(400, 'A cover image is required to create a story.');
  }

  const processedTags = tags ? 
    tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean) : [];

  // Create story
  const story = await Story.create({
    title: title.trim(),
    content: content.trim(),
    excerpt: excerpt?.trim(),
    coverImage: coverImageUrl,
    author: req.user._id,
    category,
    tags: processedTags,
    // **FIX:** Explicitly set the status to 'published' on creation.
    status: STORY_STATUS.PUBLISHED,
    // **FIX:** Set the publication date.
    publishedAt: new Date(),
    metaTitle: metaTitle?.trim(),
    metaDescription: metaDescription?.trim()
  });

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { 'stats.totalStories': 1 }
  });

  const createdStory = await Story.findById(story._id)
    .populate('author', 'username fullName avatar');

  return res
    .status(201)
    .json(new ApiResponse(201, createdStory, 'Story created successfully'));
});

const updateStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const { title, content, excerpt, category, tags, metaTitle, metaDescription } = req.body;

  if (!storyId) {
    throw new ApiError(400, 'Story ID is required');
  }

  const story = await Story.findById(storyId);

  if (!story) {
    throw new ApiError(404, 'Story not found');
  }

  if (story.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only update your own stories');
  }

  const updateFields = {};
  if (title?.trim()) updateFields.title = title.trim();
  if (content?.trim()) updateFields.content = content.trim();
  if (excerpt !== undefined) updateFields.excerpt = excerpt?.trim();
  if (category && STORY_CATEGORIES.includes(category)) updateFields.category = category;
  if (metaTitle !== undefined) updateFields.metaTitle = metaTitle?.trim();
  if (metaDescription !== undefined) updateFields.metaDescription = metaDescription?.trim();

  if (tags !== undefined) {
    updateFields.tags = tags ? 
      tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean) : [];
  }

  if (req.file) {
    const coverImageUploadResult = await uploadOnCloudinary(req.file.path, 'narrata/covers');
    if (coverImageUploadResult) {
      if (story.coverImage) {
        const oldImagePublicId = extractPublicId(story.coverImage);
        if (oldImagePublicId) await deleteFromCloudinary(oldImagePublicId);
      }
      updateFields.coverImage = coverImageUploadResult.secure_url;
    }
  }

  const updatedStory = await Story.findByIdAndUpdate(
    storyId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).populate('author', 'username fullName avatar');

  return res
    .status(200)
    .json(new ApiResponse(200, updatedStory, 'Story updated successfully'));
});

const deleteStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  if (!storyId) {
    throw new ApiError(400, 'Story ID is required');
  }

  const story = await Story.findById(storyId);

  if (!story) {
    throw new ApiError(404, 'Story not found');
  }

  // Check ownership
  if (story.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own stories');
  }

  // Delete cover image from cloudinary
  if (story.coverImage) {
    const coverImagePublicId = extractPublicId(story.coverImage);
    if (coverImagePublicId) {
      await deleteFromCloudinary(coverImagePublicId);
    }
  }

  await Story.findByIdAndDelete(storyId);

  // Update user stats
  await User.findByIdAndUpdate(story.author, {
    $inc: { 
      'stats.totalStories': -1,
      'stats.totalViews': -story.stats.views,
      'stats.totalLikes': -story.stats.likes,
      'stats.totalComments': -story.stats.comments
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Story deleted successfully'));
});

const getStoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    throw new ApiError(400, 'Story slug is required');
  }

  const story = await Story.findOne({ slug, status: 'published' })
    .populate('author', 'username fullName avatar bio location stats followers');

  if (!story) {
    throw new ApiError(404, 'Story not found');
  }

  // Increment views (only if not the author viewing their own story)
  if (!req.user || req.user._id.toString() !== story.author._id.toString()) {
    await story.incrementViews();
  }

  // Check if user has liked/disliked the story
  let userEngagement = {
    hasLiked: false,
    hasDisliked: false
  };

  if (req.user) {
    userEngagement.hasLiked = story.likedBy.includes(req.user._id);
    userEngagement.hasDisliked = story.dislikedBy.includes(req.user._id);
  }

  const storyWithEngagement = {
    ...story.toObject(),
    userEngagement
  };

  // Remove sensitive arrays from response
  delete storyWithEngagement.likedBy;
  delete storyWithEngagement.dislikedBy;

  return res
    .status(200)
    .json(new ApiResponse(200, storyWithEngagement, 'Story fetched successfully'));
});

const getAllStories = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    category,
    search,
    tags,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    featured
  } = req.query;

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));
  const skip = (pageNumber - 1) * limitNumber;

  // Build query
  const query = { status: 'published' };

  if (category && category !== 'all' && STORY_CATEGORIES.includes(category)) {
    query.category = category;
  }

  if (search?.trim()) {
    query.$text = { $search: search.trim() };
  }

  if (tags?.trim()) {
    const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
    query.tags = { $in: tagArray };
  }

  if (featured === 'true') {
    query['settings.featured'] = true;
  }

  // Build sort object
  const sortObj = {};
  if (search?.trim()) {
    sortObj.score = { $meta: 'textScore' };
  }
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const stories = await Story.find(query)
    .populate('author', 'username fullName avatar')
    .sort(sortObj)
    .skip(skip)
    .limit(limitNumber)
    .select('-content -likedBy -dislikedBy'); // Exclude full content and engagement arrays

  const totalStories = await Story.countDocuments(query);
  const totalPages = Math.ceil(totalStories / limitNumber);

  return res
    .status(200)
    .json(new ApiResponse(200, {
      stories,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalStories,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      }
    }, 'Stories fetched successfully'));
});

const publishStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  if (!storyId) {
    throw new ApiError(400, 'Story ID is required');
  }

  const story = await Story.findById(storyId);

  if (!story) {
    throw new ApiError(404, 'Story not found');
  }

  // Check ownership
  if (story.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only publish your own stories');
  }

  if (story.status === 'published') {
    throw new ApiError(400, 'Story is already published');
  }

  await story.publish();

  return res
    .status(200)
    .json(new ApiResponse(200, story, 'Story published successfully'));
});

const unpublishStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  if (!storyId) {
    throw new ApiError(400, 'Story ID is required');
  }

  const story = await Story.findById(storyId);

  if (!story) {
    throw new ApiError(404, 'Story not found');
  }

  // Check ownership
  if (story.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only unpublish your own stories');
  }

  if (story.status !== 'published') {
    throw new ApiError(400, 'Story is not published');
  }

  await story.unpublish();

  return res
    .status(200)
    .json(new ApiResponse(200, story, 'Story unpublished successfully'));
});

const likeStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  if (!storyId) {
    throw new ApiError(400, 'Story ID is required');
  }

  const story = await Story.findById(storyId);

  if (!story) {
    throw new ApiError(404, 'Story not found');
  }

  if (story.status !== 'published') {
    throw new ApiError(400, 'Cannot like unpublished story');
  }

  await story.toggleLike(req.user._id);

  const isLiked = story.likedBy.includes(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { 
      liked: isLiked,
      likesCount: story.stats.likes 
    }, isLiked ? 'Story liked successfully' : 'Story like removed'));
});

const dislikeStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;

  if (!storyId) {
    throw new ApiError(400, 'Story ID is required');
  }

  const story = await Story.findById(storyId);

  if (!story) {
    throw new ApiError(404, 'Story not found');
  }

  if (story.status !== 'published') {
    throw new ApiError(400, 'Cannot dislike unpublished story');
  }

  await story.toggleDislike(req.user._id);

  const isDisliked = story.dislikedBy.includes(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { 
      disliked: isDisliked,
      dislikesCount: story.stats.dislikes 
    }, isDisliked ? 'Story disliked successfully' : 'Story dislike removed'));
});

const getTrendingStories = asyncHandler(async (req, res) => {
  const { limit = 10, timeframe = '7d' } = req.query;

  const limitNumber = Math.min(50, Math.max(1, parseInt(limit)));

  // Calculate date threshold based on timeframe
  let dateThreshold = new Date();
  switch (timeframe) {
    case '1d':
      dateThreshold.setDate(dateThreshold.getDate() - 1);
      break;
    case '7d':
      dateThreshold.setDate(dateThreshold.getDate() - 7);
      break;
    case '30d':
      dateThreshold.setDate(dateThreshold.getDate() - 30);
      break;
    default:
      dateThreshold.setDate(dateThreshold.getDate() - 7);
  }

  const trendingStories = await Story.aggregate([
    {
      $match: {
        status: 'published',
        publishedAt: { $gte: dateThreshold }
      }
    },
    {
      $addFields: {
        trendingScore: {
          $add: [
            { $multiply: ['$stats.views', 0.1] },
            { $multiply: ['$stats.likes', 2] },
            { $multiply: ['$stats.comments', 3] },
            { $multiply: ['$stats.shares', 5] }
          ]
        }
      }
    },
    {
      $sort: { trendingScore: -1 }
    },
    {
      $limit: limitNumber
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $unwind: '$author'
    },
    {
      $project: {
        content: 0,
        likedBy: 0,
        dislikedBy: 0
      }
    }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, trendingStories, 'Trending stories fetched successfully'));
});

const getStoryCategories = asyncHandler(async (req, res) => {
  // Get categories with story counts
  const categoriesWithCounts = await Story.aggregate([
    {
      $match: { status: 'published' }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const categories = STORY_CATEGORIES.map(category => {
    const categoryData = categoriesWithCounts.find(item => item._id === category);
    return {
      name: category,
      count: categoryData ? categoryData.count : 0
    };
  });

  return res
    .status(200)
    .json(new ApiResponse(200, categories, 'Story categories fetched successfully'));
});

const getRelatedStories = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const { limit = 5 } = req.query;

  if (!storyId) {
    throw new ApiError(400, 'Story ID is required');
  }

  const story = await Story.findById(storyId);

  if (!story) {
    throw new ApiError(404, 'Story not found');
  }

  const limitNumber = Math.min(10, Math.max(1, parseInt(limit)));

  // Find related stories based on category and tags
  const relatedStories = await Story.find({
    _id: { $ne: storyId },
    status: 'published',
    $or: [
      { category: story.category },
      { tags: { $in: story.tags } }
    ]
  })
  .populate('author', 'username fullName avatar')
  .select('-content -likedBy -dislikedBy')
  .sort({ 'stats.views': -1 })
  .limit(limitNumber);

  return res
    .status(200)
    .json(new ApiResponse(200, relatedStories, 'Related stories fetched successfully'));
});

export {
  createStory,
  updateStory,
  deleteStory,
  getStoryBySlug,
  getAllStories,
  publishStory,
  unpublishStory,
  likeStory,
  dislikeStory,
  getTrendingStories,
  getStoryCategories,
  getRelatedStories
};
