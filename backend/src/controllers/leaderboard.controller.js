import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { LeaderboardEntry } from '../models/leaderboard.model.js';
import { User } from '../models/user.model.js';
import { Story } from '../models/story.model.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, STORY_CATEGORIES } from '../utils/constants.js';

const getLeaderboard = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    timeframe = 'overall',
    category
  } = req.query;

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));

  const leaderboardData = await LeaderboardEntry.getTopUsers(limitNumber * pageNumber, timeframe);

  // Paginate the results
  const startIndex = (pageNumber - 1) * limitNumber;
  const paginatedData = leaderboardData.slice(startIndex, startIndex + limitNumber);

  // Add rank numbers
  const rankedData = paginatedData.map((entry, index) => ({
    ...entry.toObject(),
    rank: startIndex + index + 1
  }));

  const totalEntries = await LeaderboardEntry.countDocuments({ isActive: true });
  const totalPages = Math.ceil(totalEntries / limitNumber);

  return res
    .status(200)
    .json(new ApiResponse(200, {
      leaderboard: rankedData,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalEntries,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      }
    }, 'Leaderboard fetched successfully'));
});

const getUserRank = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { timeframe = 'overall' } = req.query;

  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }

  const leaderboardEntry = await LeaderboardEntry.findOne({ user: userId })
    .populate('user', 'username fullName avatar');

  if (!leaderboardEntry) {
    throw new ApiError(404, 'User not found in leaderboard');
  }

  let rank;
  switch (timeframe) {
    case 'weekly':
      rank = leaderboardEntry.currentRank.weekly;
      break;
    case 'monthly':
      rank = leaderboardEntry.currentRank.monthly;
      break;
    default:
      rank = leaderboardEntry.currentRank.overall;
  }

  const rankData = {
    ...leaderboardEntry.toObject(),
    currentRank: rank,
    timeframe
  };

  return res
    .status(200)
    .json(new ApiResponse(200, rankData, 'User rank fetched successfully'));
});

const updateUserScore = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  // Only allow users to update their own score or admin to update any
  if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only update your own score');
  }

  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }

  let leaderboardEntry = await LeaderboardEntry.findOne({ user: userId });

  if (!leaderboardEntry) {
    // Create new leaderboard entry if doesn't exist
    leaderboardEntry = await LeaderboardEntry.create({ user: userId });
  }

  await leaderboardEntry.calculateScore();

  return res
    .status(200)
    .json(new ApiResponse(200, leaderboardEntry, 'User score updated successfully'));
});

const getTopWriters = asyncHandler(async (req, res) => {
  const {
    limit = 10,
    timeframe = 'overall',
    category
  } = req.query;

  const limitNumber = Math.min(50, Math.max(1, parseInt(limit)));

  let matchStage = { status: 'published' };
  
  if (category && category !== 'all' && STORY_CATEGORIES.includes(category)) {
    matchStage.category = category;
  }

  // Get date threshold for timeframe
  let dateThreshold = new Date(0); // Beginning of time for 'overall'
  if (timeframe !== 'overall') {
    dateThreshold = new Date();
    switch (timeframe) {
      case 'weekly':
        dateThreshold.setDate(dateThreshold.getDate() - 7);
        break;
      case 'monthly':
        dateThreshold.setDate(dateThreshold.getDate() - 30);
        break;
      case 'yearly':
        dateThreshold.setFullYear(dateThreshold.getFullYear() - 1);
        break;
    }
    matchStage.publishedAt = { $gte: dateThreshold };
  }

  const topWriters = await Story.aggregate([
    {
      $match: matchStage
    },
    {
      $group: {
        _id: '$author',
        totalStories: { $sum: 1 },
        totalViews: { $sum: '$stats.views' },
        totalLikes: { $sum: '$stats.likes' },
        totalComments: { $sum: '$stats.comments' },
        averageRating: { $avg: '$rating' },
        engagementScore: {
          $sum: {
            $add: [
              { $multiply: ['$stats.views', 0.1] },
              { $multiply: ['$stats.likes', 2] },
              { $multiply: ['$stats.comments', 3] }
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              stats: 1
            }
          }
        ]
      }
    },
    {
      $unwind: '$user'
    },
    {
      $addFields: {
        qualityScore: {
          $cond: {
            if: { $gt: ['$totalViews', 0] },
            then: { $divide: ['$totalLikes', '$totalViews'] },
            else: 0
          }
        }
      }
    },
    {
      $sort: { engagementScore: -1 }
    },
    {
      $limit: limitNumber
    }
  ]);

  // Add rank numbers
  const rankedWriters = topWriters.map((writer, index) => ({
    ...writer,
    rank: index + 1
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, rankedWriters, 'Top writers fetched successfully'));
});

const getUserBadges = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }

  const leaderboardEntry = await LeaderboardEntry.findOne({ user: userId })
    .select('badges achievements');

  if (!leaderboardEntry) {
    return res
      .status(200)
      .json(new ApiResponse(200, { badges: [], achievements: [] }, 'User badges fetched successfully'));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {
      badges: leaderboardEntry.badges || [],
      achievements: leaderboardEntry.achievements || []
    }, 'User badges fetched successfully'));
});

const awardBadge = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, description, icon } = req.body;

  // Only admins can award badges
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only administrators can award badges');
  }

  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, 'Badge name and description are required');
  }

  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found');
  }

  let leaderboardEntry = await LeaderboardEntry.findOne({ user: userId });

  if (!leaderboardEntry) {
    leaderboardEntry = await LeaderboardEntry.create({ user: userId });
  }

  await leaderboardEntry.addBadge(name.trim(), description.trim(), icon || '🏆');

  return res
    .status(200)
    .json(new ApiResponse(200, leaderboardEntry, 'Badge awarded successfully'));
});

const getLeaderboardStats = asyncHandler(async (req, res) => {
  const stats = await Promise.all([
    LeaderboardEntry.countDocuments({ isActive: true }),
    Story.countDocuments({ status: 'published' }),
    Story.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, totalViews: { $sum: '$stats.views' } } }
    ]),
    User.countDocuments({ isActive: true }),
    LeaderboardEntry.findOne().sort({ totalScore: -1 }).populate('user', 'username fullName')
  ]);

  const [
    totalParticipants,
    totalStories,
    viewsResult,
    totalUsers,
    topScorer
  ] = stats;

  const leaderboardStats = {
    totalParticipants,
    totalStories,
    totalViews: viewsResult[0]?.totalViews || 0,
    totalUsers,
    topScorer: topScorer || null
  };

  return res
    .status(200)
    .json(new ApiResponse(200, leaderboardStats, 'Leaderboard stats fetched successfully'));
});

export {
  getLeaderboard,
  getUserRank,
  updateUserScore,
  getTopWriters,
  getUserBadges,
  awardBadge,
  getLeaderboardStats
};
