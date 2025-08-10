import { Router } from 'express';
import {
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
} from '../controllers/story.controller.js';
import { 
  verifyJWT, 
  verifyOptionalJWT, 
  requireEmailVerification 
} from '../middlewares/auth.middleware.js';
import { 
  uploadCoverImage, 
  handleMulterError, 
  cleanupFiles 
} from '../middlewares/multer.middleware.js';

const router = Router();

// Public routes
router.route('/').get(verifyOptionalJWT, getAllStories);
router.route('/trending').get(getTrendingStories);
router.route('/categories').get(getStoryCategories);
router.route('/:slug').get(verifyOptionalJWT, getStoryBySlug);
router.route('/:storyId/related').get(getRelatedStories);

// Protected routes - Create story
router.route('/create').post(
  verifyJWT,
  // requireEmailVerification,
  cleanupFiles,
  uploadCoverImage,
  handleMulterError,
  createStory
);

// Protected routes - Story management
router.route('/:storyId').patch(
  verifyJWT,
  cleanupFiles,
  uploadCoverImage,
  handleMulterError,
  updateStory
);

router.route('/:storyId').delete(verifyJWT, deleteStory);
router.route('/:storyId/publish').patch(verifyJWT, publishStory);
router.route('/:storyId/unpublish').patch(verifyJWT, unpublishStory);

// Protected routes - Story engagement
router.route('/:storyId/like').post(verifyJWT, likeStory);
router.route('/:storyId/dislike').post(verifyJWT, dislikeStory);

export default router;
