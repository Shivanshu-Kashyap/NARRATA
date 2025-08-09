import multer from 'multer';
import path from 'path';
import { ApiError } from '../utils/ApiError.js';
import { FILE_TYPES, MAX_FILE_SIZE } from '../utils/constants.js';

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = './public/temp';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp');
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter function
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  };
};

// Generic upload middleware
const createUploadMiddleware = (fieldName, allowedTypes, maxSize = MAX_FILE_SIZE) => {
  return multer({
    storage: storage,
    limits: {
      fileSize: maxSize,
      files: 1
    },
    fileFilter: fileFilter(allowedTypes)
  }).single(fieldName);
};

// Specific upload middlewares
export const uploadAvatar = createUploadMiddleware('avatar', FILE_TYPES.IMAGE);
export const uploadCoverImage = createUploadMiddleware('coverImage', FILE_TYPES.IMAGE);
export const uploadDocument = createUploadMiddleware('document', [...FILE_TYPES.IMAGE, ...FILE_TYPES.DOCUMENT]);

// Multiple files upload
export const uploadMultiple = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5 // Maximum 5 files
  },
  fileFilter: fileFilter([...FILE_TYPES.IMAGE, ...FILE_TYPES.DOCUMENT])
}).array('files', 5);

// Handle multer errors
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return next(new ApiError(400, `File size too large. Maximum size allowed is ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
      case 'LIMIT_FILE_COUNT':
        return next(new ApiError(400, 'Too many files uploaded'));
      case 'LIMIT_UNEXPECTED_FILE':
        return next(new ApiError(400, 'Unexpected file field'));
      default:
        return next(new ApiError(400, 'File upload error'));
    }
  }
  next(error);
};

// Cleanup middleware to remove uploaded files on error
export const cleanupFiles = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // If there's an error and files were uploaded, clean them up
    if (res.statusCode >= 400) {
      const filesToCleanup = [];
      
      if (req.file) {
        filesToCleanup.push(req.file.path);
      }
      
      if (req.files) {
        if (Array.isArray(req.files)) {
          filesToCleanup.push(...req.files.map(file => file.path));
        } else {
          Object.values(req.files).forEach(fileArray => {
            if (Array.isArray(fileArray)) {
              filesToCleanup.push(...fileArray.map(file => file.path));
            } else {
              filesToCleanup.push(fileArray.path);
            }
          });
        }
      }
      
      // Cleanup files asynchronously
      filesToCleanup.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error cleaning up file:', filePath, err);
          });
        }
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};
