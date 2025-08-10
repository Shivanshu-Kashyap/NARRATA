import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  deleteAccount,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { uploadAvatar, handleMulterError, cleanupFiles } from '../middlewares/multer.middleware.js';

const router = Router();

// Public routes
router.route('/register').post(
  cleanupFiles,
  uploadAvatar,
  handleMulterError,
  registerUser
);

router.route('/login').post(loginUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);

// Protected routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/change-password').post(verifyJWT, changeCurrentPassword);
router.route('/current-user').get(verifyJWT, getCurrentUser);

router.route('/delete-account').delete(verifyJWT, deleteAccount);

export default router;
