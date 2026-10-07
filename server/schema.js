import mongoose from 'mongoose';
import { Readable } from 'stream';

/**
 * GridFS File Metadata Schema (maps directly to MongoDB's images.files collection)
 */
const gridFSFileSchema = new mongoose.Schema(
  {
    length: { type: Number },
    chunkSize: { type: Number },
    uploadDate: { type: Date, default: Date.now },
    filename: { type: String, required: true },
    contentType: { type: String, default: 'image/jpeg' },
    metadata: {
      originalName: { type: String },
      format: { type: String },
      uploadedBy: { type: String, default: 'admin' },
      isProfilePhoto: { type: Boolean, default: true },
      uploadedAt: { type: Date, default: Date.now }
    }
  },
  {
    collection: 'images.files',
    strict: false
  }
);

// Mongoose model for GridFS metadata querying
export const ImageFile = mongoose.models.ImageFile || mongoose.model('ImageFile', gridFSFileSchema);

// Legacy schema for backward compatibility
const imageDataSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  data: Buffer
});
export const imageData = mongoose.models.ImageData || mongoose.model('ImageData', imageDataSchema);

// Singleton GridFSBucket instance
let gfsBucket = null;

/**
 * Returns the GridFSBucket instance bound to the active MongoDB connection.
 * @param {mongoose.Connection} [connection]
 * @returns {mongoose.mongo.GridFSBucket}
 */
export const getGridFSBucket = (connection = mongoose.connection) => {
  const activeConn = (connection && connection.readyState === 1)
    ? connection
    : (mongoose.connection.readyState === 1 ? mongoose.connection : null);

  if (!activeConn || !activeConn.db) {
    throw new Error('MongoDB is not connected. GridFS operations require an active MongoDB connection.');
  }

  if (!gfsBucket || gfsBucket.s?.db !== activeConn.db) {
    gfsBucket = new mongoose.mongo.GridFSBucket(activeConn.db, {
      bucketName: 'images'
    });
  }

  return gfsBucket;
};

/**
 * Uploads an image binary buffer directly into MongoDB GridFS.
 * Stored across images.files (metadata) and images.chunks (binary stream).
 * NO local disk storage is used.
 *
 * @param {Object} params
 * @param {Buffer} params.buffer - Raw image binary buffer
 * @param {string} params.filename - Unique filename in GridFS
 * @param {string} [params.contentType='image/jpeg'] - MIME type
 * @param {Object} [params.metadata={}] - Optional metadata
 * @returns {Promise<Object>} Resolves with the created GridFS file document
 */
export const uploadImageToGridFS = ({ buffer, filename, contentType = 'image/jpeg', metadata = {} }) => {
  return new Promise((resolve, reject) => {
    try {
      const bucket = getGridFSBucket();
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);

      const resolvedContentType = contentType || getContentTypeFromFilename(filename);

      const uploadStream = bucket.openUploadStream(filename, {
        contentType: resolvedContentType,
        metadata: {
          ...metadata,
          contentType: resolvedContentType,
          uploadedAt: new Date(),
          size: buffer.length
        }
      });

      uploadStream.on('error', (err) => {
        console.error('GridFS Upload Error:', err);
        reject(err);
      });

      uploadStream.on('finish', () => {
        resolve({
          _id: uploadStream.id,
          id: uploadStream.id,
          filename,
          contentType: resolvedContentType,
          length: buffer.length,
          metadata: {
            ...metadata,
            contentType: resolvedContentType
          }
        });
      });

      readableStream.pipe(uploadStream);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Extracts accurate MIME type from filename extension
 * @param {string} filename
 * @returns {string}
 */
export const getContentTypeFromFilename = (filename = '') => {
  const ext = (filename || '').split('.').pop().toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    case 'svg': return 'image/svg+xml';
    case 'gif': return 'image/gif';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'ico': return 'image/x-icon';
    case 'avif': return 'image/avif';
    default: return 'image/jpeg';
  }
};

/**
 * Resolves the Content-Type from a GridFS file document
 * @param {Object} file
 * @returns {string}
 */
export const getContentType = (file) => {
  if (!file) return 'image/jpeg';
  if (file.contentType && file.contentType !== 'application/octet-stream') {
    return file.contentType;
  }
  if (file.metadata?.contentType) {
    return file.metadata.contentType;
  }
  return getContentTypeFromFilename(file.filename);
};

/**
 * Finds an image metadata record in GridFS by either ObjectId or filename.
 * @param {string|mongoose.Types.ObjectId} identifier
 * @returns {Promise<Object|null>}
 */
export const findImage = async (identifier) => {
  const bucket = getGridFSBucket();

  // Try finding by ObjectId first if valid 24-char hex
  if (identifier && mongoose.Types.ObjectId.isValid(identifier)) {
    try {
      const objectId = new mongoose.Types.ObjectId(identifier);
      if (String(objectId) === String(identifier)) {
        const files = await bucket.find({ _id: objectId }).toArray();
        if (files.length > 0) return files[0];
      }
    } catch {
      // not a pure ObjectId, fall through
    }
  }

  // Fallback to finding by filename (most recent first)
  const filesByName = await bucket
    .find({ filename: identifier })
    .sort({ uploadDate: -1 })
    .toArray();

  if (filesByName.length > 0) return filesByName[0];

  return null;
};

/**
 * Opens a readable download stream for an image in MongoDB GridFS.
 * @param {string|mongoose.Types.ObjectId} identifier - ObjectId string or filename
 * @returns {Promise<{ stream: NodeJS.ReadableStream, file: Object }|null>}
 */
export const getImageStream = async (identifier) => {
  const file = await findImage(identifier);
  if (!file) {
    return null;
  }

  const bucket = getGridFSBucket();
  const stream = bucket.openDownloadStream(file._id);

  return { stream, file };
};

/**
 * Deletes an image and all its associated chunks from MongoDB GridFS.
 * @param {string|mongoose.Types.ObjectId} id
 * @returns {Promise<boolean>}
 */
export const deleteImageFromGridFS = async (id) => {
  const bucket = getGridFSBucket();
  const objectId = typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id;
  await bucket.delete(objectId);
  return true;
};

/**
 * Lists all uploaded images stored in MongoDB GridFS.
 * @param {number} [limit=50]
 * @returns {Promise<Array<Object>>}
 */
export const listGridFSImages = async (limit = 50) => {
  const bucket = getGridFSBucket();
  return await bucket.find({}).sort({ uploadDate: -1 }).limit(limit).toArray();
};

/**
 * ─── Admin Authentication Schema & Model ────────────────────────────────────
 * Persists the administrator password and credentials directly in MongoDB
 */
const adminAuthSchema = new mongoose.Schema(
  {
    username: { type: String, default: 'admin', unique: true, index: true },
    password: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    collection: 'admin_credentials',
    timestamps: true
  }
);
export const AdminAuth = mongoose.models.AdminAuth || mongoose.model('AdminAuth', adminAuthSchema);

/**
 * ─── Viewers / Locations Schema & Model ─────────────────────────────────────
 * Stores live visitor geolocation data in MongoDB
 */
const viewerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  {
    collection: 'viewers',
    timestamps: true
  }
);
export const Viewer = mongoose.models.Viewer || mongoose.model('Viewer', viewerSchema);

/**
 * ─── Achievements Schema & Model ────────────────────────────────────────────
 * Stores certifications, badges, and honors in MongoDB
 */
const achievementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    issuer: { type: String },
    category: { type: String },
    date: { type: String },
    description: { type: String },
    badgeImageUrl: { type: String },
    iconType: { type: String },
    verificationUrl: { type: String },
    featured: { type: Boolean, default: false },
    skills: [{ type: String }],
    level: { type: String },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    collection: 'achievements',
    strict: false,
    timestamps: true
  }
);
export const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);

/**
 * ─── Portfolio Content Schema & Model ───────────────────────────────────────
 * Stores all CMS sections (hero, about, contact, theme, visibility) in MongoDB
 */
const portfolioContentSchema = new mongoose.Schema(
  {
    identifier: { type: String, default: 'main', unique: true, index: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    collection: 'portfolio_content',
    timestamps: true
  }
);
export const PortfolioContent = mongoose.models.PortfolioContent || mongoose.model('PortfolioContent', portfolioContentSchema);

/**
 * Validates the provided password against the MongoDB database.
 * If no admin record exists in DB, it verifies against configured env password
 * and automatically seeds the DB with the password.
 *
 * @param {string} password
 * @returns {Promise<boolean>}
 */
export const check_password = async (password) => {
  try {
    const cleanPassword = (password || '').trim();
    if (!cleanPassword) return false;

    // 1. Check if MongoDB connection is ready
    if (mongoose.connection.readyState === 1) {
      const adminRecord = await AdminAuth.findOne({ username: 'admin' });
      if (adminRecord && adminRecord.password) {
        return adminRecord.password === cleanPassword;
      }

      // If no admin record exists yet, check fallback and auto-seed in MongoDB
      const envPassword = (
        process.env.ADMIN_PASSWORD ||
        process.env.VITE_ADMIN_PASSWORD ||
        process.env.DEFAULT_FALLBACK_PASSWORD ||
        'DS2026'
      ).trim();

      if (cleanPassword === envPassword) {
        await AdminAuth.findOneAndUpdate(
          { username: 'admin' },
          { password: cleanPassword, updatedAt: new Date() },
          { upsert: true, new: true }
        );
        console.log('[MongoDB AdminAuth] Seeded admin password into MongoDB collection');
        return true;
      }
    } else {
      // Fallback if DB is connecting or offline
      const envPassword = (
        process.env.ADMIN_PASSWORD ||
        process.env.VITE_ADMIN_PASSWORD ||
        process.env.DEFAULT_FALLBACK_PASSWORD ||
        'DS2026'
      ).trim();
      return cleanPassword === envPassword;
    }

    return false;
  } catch (error) {
    console.error('[MongoDB AdminAuth] Error checking password:', error.message);
    const envPassword = (
      process.env.ADMIN_PASSWORD ||
      process.env.VITE_ADMIN_PASSWORD ||
      process.env.DEFAULT_FALLBACK_PASSWORD ||
      'DS2026'
    ).trim();
    return (password || '').trim() === envPassword;
  }
};

/**
 * Saves or updates the admin password in MongoDB.
 *
 * @param {string} newPassword
 * @param {string} [username='admin']
 * @returns {Promise<Object>}
 */
export const save_password = async (newPassword, username = 'admin') => {
  const cleanPassword = (newPassword || '').trim();
  if (!cleanPassword) {
    throw new Error('Password cannot be empty');
  }

  const updated = await AdminAuth.findOneAndUpdate(
    { username },
    { password: cleanPassword, updatedAt: new Date() },
    { upsert: true, new: true }
  );
  console.log(`[MongoDB AdminAuth] Password successfully updated in DB for user "${username}"`);
  return updated;
};

/**
 * Retrieves the current admin password from MongoDB.
 *
 * @returns {Promise<string|null>}
 */
export const get_password = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const record = await AdminAuth.findOne({ username: 'admin' });
      if (record && record.password) return record.password;
    }
  } catch (err) {
    console.warn('[MongoDB AdminAuth] Error reading password:', err.message);
  }
  return process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'DS2026';
};