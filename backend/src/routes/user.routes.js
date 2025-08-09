import { Router } from 'express';
import {
  getUserProfile,
  getUserStories,
  getAllUsers,
  followUser,
  unfollowUser,
  getUserStats,
  searchUsers
} from '../controllers/user.controller.js';
import { verifyJWT, verifyOptionalJWT } from '../middlewares/auth.middleware.js';

const router = Router();

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
