import { Router } from 'express';
import {
  getUserProfile,
  getUserStories,
  getAllUsers,
  followUser,
  unfollowUser,
  getUserStats,
  searchUsers,
  updateAccountDetails, // Add this
  updateUserAvatar      // Add this
} from '../controllers/user.controller.js';
import { verifyJWT, verifyOptionalJWT } from '../middlewares/auth.middleware.js';
import { uploadAvatar, handleMulterError, cleanupFiles } from '../middlewares/multer.middleware.js';

const router = Router();
router.route('/account/update-details').patch(verifyJWT, updateAccountDetails);
router.route('/account/update-avatar').patch(
  verifyJWT,
  cleanupFiles,
  uploadAvatar,
  handleMulterError,
  updateUserAvatar
);


// Public routes
router.route('/').get(getAllUsers);
router.route('/search').get(searchUsers);
router.route('/:username').get(verifyOptionalJWT, getUserProfile);
router.route('/:username/stories').get(verifyOptionalJWT, getUserStories);
router.route('/:username/stats').get(getUserStats);

// Protected routes
router.route('/:userId/follow').post(verifyJWT, followUser);
router.route('/:userId/unfollow').post(verifyJWT, unfollowUser);

export default router;
