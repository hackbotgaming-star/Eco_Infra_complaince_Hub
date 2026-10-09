const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

// Ensure env variables are loaded
dotenv.config({ path: path.join(__dirname, '../.env') });

const isConfigured = Boolean(
  (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET) ||
    process.env.CLOUDINARY_URL
);

if (isConfigured) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

/**
 * Check if Cloudinary is active and configured
 */
const isCloudinaryConfigured = () => {
  return Boolean(
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET) ||
      process.env.CLOUDINARY_URL
  );
};

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer
 * @param {Object} options
 * @returns {Promise<Object>}
 */
const uploadBufferToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'ecoinfra_compliance_documents',
        resource_type: options.resourceType || 'auto',
        use_filename: true,
        unique_filename: true,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary by its public ID
 * @param {string} publicId
 * @param {string} resourceType
 * @returns {Promise<Object>}
 */
const deleteFromCloudinary = async (publicId, resourceType = 'auto') => {
  try {
    if (!publicId) return null;
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (err) {
    console.error('Failed to delete from Cloudinary:', err.message);
    return null;
  }
};

/**
 * Generate a direct secure download URL from Cloudinary with custom download filename
 * @param {string} publicId
 * @param {string} fileName
 * @returns {string}
 */
const getCloudinaryDownloadUrl = (publicId, fileName = 'document.pdf') => {
  if (!publicId) return '';
  return cloudinary.url(publicId, {
    flags: `attachment:${encodeURIComponent(fileName)}`,
    secure: true,
  });
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  getCloudinaryDownloadUrl,
};
