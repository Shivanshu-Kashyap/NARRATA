import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.model.js';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || 
                  req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unauthorized request - No token provided');
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken -emailVerificationToken -passwordResetToken'
    );

    if (!user) {
      throw new ApiError(401, 'Invalid Access Token - User not found');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'Account has been deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid access token');
    } else if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired');
    } else {
      throw error;
    }
  }
});

export const verifyOptionalJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || 
                  req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      req.user = null;
      return next();
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken -emailVerificationToken -passwordResetToken'
    );

    if (user && user.isActive) {
      req.user = user;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token verification fails, just continue without user
    req.user = null;
    next();
  }
});

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }
  next();
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Access denied - Insufficient permissions');
    }

    next();
  };
};

export const requireOwnership = (resourceField = 'author') => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    // Allow admins to access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resource = req.body[resourceField] || req.params[resourceField];
    if (resource && resource.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Access denied - You can only access your own resources');
    }

    next();
  };
};

export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!req.user.isEmailVerified) {
    throw new ApiError(403, 'Email verification required');
  }

  next();
};
