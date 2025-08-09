import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, folder = 'narrata') => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
      folder: folder,
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    // File has been uploaded successfully
    // Remove the locally saved temporary file
    fs.unlinkSync(localFilePath);
    
    return response;
  } catch (error) {
    // Remove the locally saved temporary file as the upload operation failed
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error('Cloudinary upload error:', error);
    return null;
  }
};

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
    
    // Extract public_id from Cloudinary URL
    const parts = cloudinaryUrl.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    
    // Include folder path if exists
    const folderIndex = parts.indexOf('narrata');
    if (folderIndex !== -1) {
      return parts.slice(folderIndex).join('/').replace(/\.[^/.]+$/, '');
    }
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

const optimizeImageUrl = (cloudinaryUrl, options = {}) => {
  try {
    if (!cloudinaryUrl) return null;

    const {
      width = 'auto',
      height = 'auto',
      crop = 'fill',
      quality = 'auto',
      format = 'auto'
    } = options;

    // Insert transformation parameters into the URL
    const transformationString = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;
    const uploadIndex = cloudinaryUrl.indexOf('/upload/');
    
    if (uploadIndex !== -1) {
      return [
        cloudinaryUrl.slice(0, uploadIndex + 8),
        transformationString + '/',
        cloudinaryUrl.slice(uploadIndex + 8)
      ].join('');
    }

    return cloudinaryUrl;
  } catch (error) {
    console.error('Error optimizing image URL:', error);
    return cloudinaryUrl;
  }
};

export {
  uploadOnCloudinary,
  deleteFromCloudinary,
  extractPublicId,
  optimizeImageUrl,
  cloudinary
};
