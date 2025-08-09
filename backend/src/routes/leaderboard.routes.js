import { Router } from 'express';
import {
  getLeaderboard,
  getUserRank,
  updateUserScore,
  getTopWriters,
  getUserBadges,
  awardBadge,
  getLeaderboardStats
} from '../controllers/leaderboard.controller.js';
import { verifyJWT, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.route('/').get(getLeaderboard);
router.route('/stats').get(getLeaderboardStats);
router.route('/top-writers').get(getTopWriters);
router.route('/user/:userId').get(getUserRank);
router.route('/user/:userId/badges').get(getUserBadges);

// Protected routes
router.route('/user/:userId/update-score').patch(verifyJWT, updateUserScore);

// Admin routes
router.route('/user/:userId/award-badge').post(
  verifyJWT, 
  requireRole('admin'), 
  awardBadge
);

export default router;
