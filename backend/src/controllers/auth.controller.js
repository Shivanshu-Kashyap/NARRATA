import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { LeaderboardEntry } from '../models/leaderboard.model.js';
import { uploadOnCloudinary, deleteFromCloudinary, extractPublicId } from '../utils/cloudinary.js';

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating tokens');
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, bio, location, website } = req.body;

  // Validation
  if ([fullName, email, username, password].some(field => field?.trim() === '')) {
    throw new ApiError(400, 'All required fields must be provided');
  }

  // Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
  });

  if (existedUser) {
    throw new ApiError(409, 'User with email or username already exists');
  }

  // Handle avatar upload
  let avatarUrl = null;
  if (req.file) {
    const avatarUploadResult = await uploadOnCloudinary(req.file.path, 'narrata/avatars');
    if (avatarUploadResult) {
      avatarUrl = avatarUploadResult.secure_url;
    }
  }

  // Create user
  const user = await User.create({
    fullName: fullName.trim(),
    avatar: avatarUrl,
    email: email.toLowerCase(),
    password,
    username: username.toLowerCase(),
    bio: bio?.trim() || '',
    location: location?.trim() || '',
    website: website?.trim() || ''
  });

  // Create leaderboard entry
  await LeaderboardEntry.create({
    user: user._id
  });

  // Get created user without sensitive data
  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken -emailVerificationToken -passwordResetToken'
  );

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering the user');
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, 'User registered successfully')
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, 'Username or email is required');
  }

  if (!password) {
    throw new ApiError(400, 'Password is required');
  }

  // Find user
  const user = await User.findOne({
    $or: [{ username: username?.toLowerCase() }, { email: email?.toLowerCase() }]
  }).select('+password');

  if (!user) {
    throw new ApiError(404, 'User does not exist');
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Account has been deactivated');
  }

  // Check password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid user credentials');
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  // Update last login
  await user.updateLastLogin();

  // Get user without sensitive data
  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken -emailVerificationToken -passwordResetToken'
  );

  // Cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        'User logged in successfully'
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Unauthorized request');
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decodedToken?._id).select('+refreshToken');

    if (!user) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired or used');
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    };

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          'Access token refreshed'
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid refresh token');
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, 'Old password and new password are required');
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, 'New password must be different from old password');
  }

  const user = await User.findById(req.user?._id).select('+password');

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, 'Invalid old password');
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'Current user fetched successfully'));
});





const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, 'Password is required to delete account');
  }

  const user = await User.findById(req.user._id).select('+password');

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, 'Invalid password');
  }

  // Delete user's avatar from cloudinary
  if (user.avatar) {
    const avatarPublicId = extractPublicId(user.avatar);
    if (avatarPublicId) {
      await deleteFromCloudinary(avatarPublicId);
    }
  }

  // Delete leaderboard entry
  await LeaderboardEntry.findOneAndDelete({ user: user._id });

  // Soft delete - deactivate account
  await User.findByIdAndUpdate(user._id, {
    $set: {
      isActive: false,
      email: `deleted_${Date.now()}_${user.email}`,
      username: `deleted_${Date.now()}_${user.username}`
    }
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'Account deleted successfully'));
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw new ApiError(404, 'User with this email does not exist');
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // In a real application, you would send this token via email
  // For now, we'll just return it (remove this in production)
  return res
    .status(200)
    .json(new ApiResponse(200, { resetToken }, 'Password reset token generated. Check your email.'));
});

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, 'Token and new password are required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET + 'temp'); // This needs to be improved
    
    const user = await User.findById(decoded._id).select('+passwordResetToken +passwordResetExpires');

    if (!user || user.passwordResetToken !== token) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    if (Date.now() > user.passwordResetExpires) {
      throw new ApiError(400, 'Reset token has expired');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'Password reset successfully'));
      
  } catch (error) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  deleteAccount,
  forgotPassword,
  resetPassword
};
