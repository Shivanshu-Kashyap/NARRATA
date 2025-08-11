// src/utils/cloudinary.js

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

// **FIX:** Explicitly load the .env file from within this module.
// This ensures that the environment variables are 100% available
// before the cloudinary.config() function is called.
dotenv.config({ path: './.env' });

// Configure Cloudinary using environment variables.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // It's good practice to enforce HTTPS
});

const uploadOnCloudinary = async (localFilePath, folder = 'narrata') => {
  try {
    if (!localFilePath) return null;

    // The check for credentials is still a good safeguard.
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary credentials are not configured. Please verify your .env file.");
      fs.unlinkSync(localFilePath);
      return null;
    }

    // Upload the file to Cloudinary.
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
      folder: folder,
    });

    // Clean up the local temporary file after a successful upload.
    fs.unlinkSync(localFilePath);
    return response;

  } catch (error) {
    console.error('--- CLOUDINARY UPLOAD FAILED ---');
    console.error(`Error details: ${error.message}`);
    console.error('---------------------------------');
    
    // Clean up the local file if the upload fails.
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

// --- NO CHANGES NEEDED FOR THE REST OF THE FILE ---

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return null;
  }
};

const extractPublicId = (cloudinaryUrl) => {
  try {
    if (!cloudinaryUrl) return null;
    const parts = cloudinaryUrl.split('/');
    const folderIndex = parts.indexOf('narrata');
    if (folderIndex !== -1) {
      return parts.slice(folderIndex).join('/').replace(/\.[^/.]+$/, '');
    }
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

export {
  uploadOnCloudinary,
  deleteFromCloudinary,
  extractPublicId,
  cloudinary
};
