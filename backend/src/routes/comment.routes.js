import { Router } from 'express';
import {
  createComment,
  updateComment,
  deleteComment,
  getStoryComments,
  getCommentReplies,
  likeComment,
  dislikeComment,
  moderateComment
} from '../controllers/comment.controller.js';
import { 
  verifyJWT, 
  verifyOptionalJWT, 
  requireRole, 
  requireEmailVerification 
} from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.route('/story/:storyId').get(verifyOptionalJWT, getStoryComments);
router.route('/:commentId/replies').get(verifyOptionalJWT, getCommentReplies);

// Protected routes - Comment management
router.route('/create').post(
  verifyJWT, 
  // requireEmailVerification, 
  createComment
);

router.route('/:commentId').patch(verifyJWT, updateComment);
router.route('/:commentId').delete(verifyJWT, deleteComment);

// Protected routes - Comment engagement
router.route('/:commentId/like').post(verifyJWT, likeComment);
router.route('/:commentId/dislike').post(verifyJWT, dislikeComment);

// Admin routes
router.route('/:commentId/moderate').patch(
  verifyJWT, 
  requireRole('admin'), 
  moderateComment
);

export default router;
