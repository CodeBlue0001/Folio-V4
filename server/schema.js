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