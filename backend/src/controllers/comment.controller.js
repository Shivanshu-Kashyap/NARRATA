import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Comment } from '../models/comment.model.js';
import { Story } from '../models/story.model.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, COMMENT_STATUS } from '../utils/constants.js';

const createComment = asyncHandler(async (req, res) => {
  const { content, storyId, parentCommentId } = req.body;

  // Validation
  if (!content?.trim()) {
    throw new ApiError(400, 'Comment content is required');
  }

  if (!storyId) {
    throw new ApiError(400, 'Story ID is required');
  }

  // Check if story exists and allows comments
  const story = await Story.findById(storyId);

  if (!story) {
    throw new ApiError(404, 'Story not found');
  }

  if (story.status !== 'published') {
    throw new ApiError(400, 'Cannot comment on unpublished story');
  }

  if (!story.settings.allowComments) {
    throw new ApiError(400, 'Comments are not allowed on this story');
  }

  let level = 0;
  let parentComment = null;

  // Handle nested comments
  if (parentCommentId) {
    parentComment = await Comment.findById(parentCommentId);

    if (!parentComment) {
      throw new ApiError(404, 'Parent comment not found');
    }

    if (parentComment.story.toString() !== storyId) {
      throw new ApiError(400, 'Parent comment does not belong to this story');
    }

    level = Math.min(parentComment.level + 1, 3); // Max 3 levels of nesting

    if (level > 3) {
      throw new ApiError(400, 'Comment nesting level exceeded');
    }
  }

  // Create comment
  const comment = await Comment.create({
    content: content.trim(),
    author: req.user._id,
    story: storyId,
    parentComment: parentCommentId || null,
    level
  });

  const createdComment = await Comment.findById(comment._id)
    .populate('author', 'username fullName avatar')
    .populate('parentComment', 'author content');

  return res
    .status(201)
    .json(new ApiResponse(201, createdComment, 'Comment created successfully'));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) {
    throw new ApiError(400, 'Comment ID is required');
  }

  if (!content?.trim()) {
    throw new ApiError(400, 'Comment content is required');
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  // Check ownership
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only update your own comments');
  }

  if (comment.status !== COMMENT_STATUS.ACTIVE) {
    throw new ApiError(400, 'Cannot update inactive comment');
  }

  comment.content = content.trim();
  await comment.markAsEdited();

  const updatedComment = await Comment.findById(commentId)
    .populate('author', 'username fullName avatar');

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, 'Comment updated successfully'));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, 'Comment ID is required');
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  // Check ownership or admin role
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own comments');
  }

  // If comment has replies, mark as deleted instead of actual deletion
  const hasReplies = await Comment.countDocuments({ parentComment: commentId });

  if (hasReplies > 0) {
    comment.content = '[deleted]';
    comment.status = COMMENT_STATUS.DELETED;
    await comment.save();
  } else {
    await comment.deleteOne();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Comment deleted successfully'));
});

const getStoryComments = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const {
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  if (!storyId) {
    throw new ApiError(400, 'Story ID is required');
  }

  // Check if story exists
  const story = await Story.findById(storyId);
  if (!story) {
    throw new ApiError(404, 'Story not found');
  }

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));
  const skip = (pageNumber - 1) * limitNumber;

  // Build sort object
  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Get top-level comments only
  const comments = await Comment.find({
    story: storyId,
    parentComment: null,
    status: COMMENT_STATUS.ACTIVE
  })
  .populate('author', 'username fullName avatar')
  .populate({
    path: 'replies',
    match: { status: COMMENT_STATUS.ACTIVE },
    populate: {
      path: 'author',
      select: 'username fullName avatar'
    },
    options: { 
      sort: { createdAt: 1 },
      limit: 3 // Limit initial replies shown
    }
  })
  .sort(sortObj)
  .skip(skip)
  .limit(limitNumber);

  // Add user engagement data if user is authenticated
  if (req.user) {
    for (let comment of comments) {
      comment.userEngagement = {
        hasLiked: comment.likedBy.includes(req.user._id),
        hasDisliked: comment.dislikedBy.includes(req.user._id)
      };
      
      // Remove sensitive arrays
      comment.likedBy = undefined;
      comment.dislikedBy = undefined;
    }
  }

  const totalComments = await Comment.countDocuments({
    story: storyId,
    parentComment: null,
    status: COMMENT_STATUS.ACTIVE
  });

  const totalPages = Math.ceil(totalComments / limitNumber);

  return res
    .status(200)
    .json(new ApiResponse(200, {
      comments,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalComments,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      }
    }, 'Comments fetched successfully'));
});

const getCommentReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const {
    page = 1,
    limit = DEFAULT_PAGE_SIZE
  } = req.query;

  if (!commentId) {
    throw new ApiError(400, 'Comment ID is required');
  }

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit)));
  const skip = (pageNumber - 1) * limitNumber;

  const replies = await Comment.find({
    parentComment: commentId,
    status: COMMENT_STATUS.ACTIVE
  })
  .populate('author', 'username fullName avatar')
  .sort({ createdAt: 1 })
  .skip(skip)
  .limit(limitNumber);

  // Add user engagement data if user is authenticated
  if (req.user) {
    for (let reply of replies) {
      reply.userEngagement = {
        hasLiked: reply.likedBy.includes(req.user._id),
        hasDisliked: reply.dislikedBy.includes(req.user._id)
      };
      
      // Remove sensitive arrays
      reply.likedBy = undefined;
      reply.dislikedBy = undefined;
    }
  }

  const totalReplies = await Comment.countDocuments({
    parentComment: commentId,
    status: COMMENT_STATUS.ACTIVE
  });

  const totalPages = Math.ceil(totalReplies / limitNumber);

  return res
    .status(200)
    .json(new ApiResponse(200, {
      replies,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalReplies,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1
      }
    }, 'Replies fetched successfully'));
});

const likeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, 'Comment ID is required');
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  if (comment.status !== COMMENT_STATUS.ACTIVE) {
    throw new ApiError(400, 'Cannot like inactive comment');
  }

  await comment.toggleLike(req.user._id);

  const isLiked = comment.likedBy.includes(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {
      liked: isLiked,
      likesCount: comment.stats.likes
    }, isLiked ? 'Comment liked successfully' : 'Comment like removed'));
});

const dislikeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, 'Comment ID is required');
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  if (comment.status !== COMMENT_STATUS.ACTIVE) {
    throw new ApiError(400, 'Cannot dislike inactive comment');
  }

  await comment.toggleDislike(req.user._id);

  const isDisliked = comment.dislikedBy.includes(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {
      disliked: isDisliked,
      dislikesCount: comment.stats.dislikes
    }, isDisliked ? 'Comment disliked successfully' : 'Comment dislike removed'));
});

const moderateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { reason, status = COMMENT_STATUS.HIDDEN } = req.body;

  if (!commentId) {
    throw new ApiError(400, 'Comment ID is required');
  }

  if (!reason?.trim()) {
    throw new ApiError(400, 'Moderation reason is required');
  }

  // Only admins can moderate comments
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only administrators can moderate comments');
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  await comment.moderate(req.user._id, reason.trim(), status);

  return res
    .status(200)
    .json(new ApiResponse(200, comment, 'Comment moderated successfully'));
});

export {
  createComment,
  updateComment,
  deleteComment,
  getStoryComments,
  getCommentReplies,
  likeComment,
  dislikeComment,
  moderateComment
};
