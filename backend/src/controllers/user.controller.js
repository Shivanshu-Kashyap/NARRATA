import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { Story } from '../models/story.model.js';
import { LeaderboardEntry } from '../models/leaderboard.model.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../utils/constants.js';
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
  extractPublicId,
} from '../utils/cloudinary.js';

const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, 'Username is required');
  }

  const user = await User.findOne({ 
    username: username.toLowerCase(),
    isActive: true 
  }).select('-password -refreshToken -emailVerificationToken -passwordResetToken');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Get user's published stories count
  const publishedStoriesCount = await Story.countDocuments({
    author: user._id,
    status: 'published'
  });

  // Get leaderboard entry
  const leaderboardEntry = await LeaderboardEntry.findOne({ user: user._id });

  const userProfile = {
    ...user.toObject(),
    publishedStoriesCount,
    leaderboardRank: leaderboardEntry?.currentRank?.overall || 0,
    totalScore: leaderboardEntry?.totalScore || 0
  };

  return res
    .status(200)
    .json(new ApiResponse(200, userProfile, 'User profile fetched successfully'));
});

const getUserStories = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { 
    page = 1, 
    limit = DEFAULT_PAGE_SIZE, 
    status = 'published',
    category,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  if (!username?.trim()) {
    throw new ApiError(400, 'Username is required');
  }

  const user = await User.findOne({ 
    username: username.toLowerCase(),
    isActive: true 
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));
  const skip = (pageNumber - 1) * limitNumber;

  // Build query
  const query = { author: user._id };

  // If requesting user is not the profile owner, only show published stories
  if (!req.user || req.user._id.toString() !== user._id.toString()) {
    query.status = 'published';
  } else if (status && status !== 'all') {
    query.status = status;
  }

  if (category && category !== 'all') {
    query.category = category;
  }

  // Build sort object
  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const stories = await Story.find(query)
    .populate('author', 'username fullName avatar')
    .sort(sortObj)
    .skip(skip)
    .limit(limitNumber)
    .select('-content'); // Don't send full content in list

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
    }, 'User stories fetched successfully'));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = DEFAULT_PAGE_SIZE,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));
  const skip = (pageNumber - 1) * limitNumber;

  // Build query
  const query = { isActive: true };

  if (search?.trim()) {
    query.$or = [
      { username: { $regex: search.trim(), $options: 'i' } },
      { fullName: { $regex: search.trim(), $options: 'i' } }
    ];
  }

  // Build sort object
  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const users = await User.find(query)
    .select('username fullName avatar bio location stats createdAt')
    .sort(sortObj)
    .skip(skip)
    .limit(limitNumber);

  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limitNumber);

  return res
    .status(200)
    .json(new ApiResponse(200, {
      users,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalUsers,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      }
    }, 'Users fetched successfully'));
});
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, bio, location, website, socialLinks, preferences } = req.body;

  const updateFields = {};

  if (fullName?.trim()) updateFields.fullName = fullName.trim();
  if (bio !== undefined) updateFields.bio = bio.trim();
  if (location !== undefined) updateFields.location = location.trim();
  if (website !== undefined) updateFields.website = website.trim();
  if (socialLinks) updateFields.socialLinks = socialLinks;
  if (preferences) updateFields.preferences = { ...req.user.preferences, ...preferences };

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: updateFields },
    { new: true }
  ).select('-password -refreshToken -emailVerificationToken -passwordResetToken');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Account details updated successfully'));
});
const updateUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Avatar file is required');
  }

  // Upload new avatar
  const avatarUploadResult = await uploadOnCloudinary(req.file.path, 'narrata/avatars');

  if (!avatarUploadResult) {
    throw new ApiError(400, 'Error while uploading avatar');
  }

  // Delete old avatar if exists
  if (req.user.avatar) {
    const oldAvatarPublicId = extractPublicId(req.user.avatar);
    if (oldAvatarPublicId) {
      await deleteFromCloudinary(oldAvatarPublicId);
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatarUploadResult.secure_url
      }
    },
    { new: true }
  ).select('-password -refreshToken -emailVerificationToken -passwordResetToken');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Avatar updated successfully'));
});

const followUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
        throw new ApiError(400, 'You cannot follow yourself');
    }

    const userToFollow = await User.findById(userId);

    if (!userToFollow || !userToFollow.isActive) {
        throw new ApiError(404, 'User not found');
    }

    // Use Promise.all to update both users concurrently
    const [followedUser, currentUser] = await Promise.all([
        // Add current user's ID to the other user's followers list
        // and increment their follower count. $addToSet prevents duplicates.
        User.findByIdAndUpdate(
            userId,
            {
                $addToSet: { followers: currentUserId },
                $inc: { 'stats.followerCount': 1 },
            },
            { new: true }
        ),
        // Add the other user's ID to the current user's following list
        // and increment their following count.
        User.findByIdAndUpdate(
            currentUserId,
            {
                $addToSet: { following: userId },
                $inc: { 'stats.followingCount': 1 },
            },
            { new: true }
        ),
    ]);

    if (!followedUser || !currentUser) {
        throw new ApiError(500, "Failed to complete follow action");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { followerCount: followedUser.stats.followerCount }, 'User followed successfully'));
});

const unfollowUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
        throw new ApiError(400, 'You cannot unfollow yourself');
    }

    const userToUnfollow = await User.findById(userId);

    if (!userToUnfollow || !userToUnfollow.isActive) {
        throw new ApiError(404, 'User not found');
    }
    
    // Use Promise.all to update both users concurrently
    const [unfollowedUser, currentUser] = await Promise.all([
        // Remove current user's ID from the other user's followers list
        // and decrement their follower count.
        User.findByIdAndUpdate(
            userId,
            {
                $pull: { followers: currentUserId },
                $inc: { 'stats.followerCount': -1 },
            },
            { new: true }
        ),
        // Remove the other user's ID from the current user's following list
        // and decrement their following count.
        User.findByIdAndUpdate(
            currentUserId,
            {
                $pull: { following: userId },
                $inc: { 'stats.followingCount': -1 },
            },
            { new: true }
        ),
    ]);
    
    if (!unfollowedUser || !currentUser) {
        throw new ApiError(500, "Failed to complete unfollow action");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { followerCount: unfollowedUser.stats.followerCount }, 'User unfollowed successfully'));
});

const getUserStats = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, 'Username is required');
  }

  const user = await User.findOne({ 
    username: username.toLowerCase(),
    isActive: true 
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Get detailed stats
  const [
    totalStories,
    publishedStories,
    draftStories,
    totalViews,
    totalLikes,
    totalComments,
    leaderboardEntry
  ] = await Promise.all([
    Story.countDocuments({ author: user._id }),
    Story.countDocuments({ author: user._id, status: 'published' }),
    Story.countDocuments({ author: user._id, status: 'draft' }),
    Story.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: null, total: { $sum: '$stats.views' } } }
    ]),
    Story.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: null, total: { $sum: '$stats.likes' } } }
    ]),
    Story.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: null, total: { $sum: '$stats.comments' } } }
    ]),
    LeaderboardEntry.findOne({ user: user._id })
  ]);

  const stats = {
    stories: {
      total: totalStories,
      published: publishedStories,
      draft: draftStories
    },
    engagement: {
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      totalComments: totalComments[0]?.total || 0
    },
    leaderboard: {
      currentRank: leaderboardEntry?.currentRank || {},
      totalScore: leaderboardEntry?.totalScore || 0,
      badges: leaderboardEntry?.badges || [],
      achievements: leaderboardEntry?.achievements || []
    }
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, 'User stats fetched successfully'));
});

const searchUsers = asyncHandler(async (req, res) => {
  const { q: query, limit = 10 } = req.query;

  if (!query?.trim()) {
    throw new ApiError(400, 'Search query is required');
  }

  const limitNumber = Math.min(20, Math.max(1, parseInt(limit)));

  const users = await User.find({
    isActive: true,
    $or: [
      { username: { $regex: query.trim(), $options: 'i' } },
      { fullName: { $regex: query.trim(), $options: 'i' } }
    ]
  })
  .select('username fullName avatar bio stats')
  .limit(limitNumber)
  .sort({ 'stats.followerCount': -1, username: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, users, 'Users search completed'));
});

export {
  getUserProfile,
  getUserStories,
  getAllUsers,
  followUser,
  unfollowUser,
  getUserStats,
  searchUsers,
  updateAccountDetails,
  updateUserAvatar  
};
