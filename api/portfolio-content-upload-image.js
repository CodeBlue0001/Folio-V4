import mongoose from 'mongoose';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/folio';

let cachedConn = null;
async function connectToMongo() {
  if (cachedConn && mongoose.connection.readyState === 1) {
    return cachedConn;
  }
  cachedConn = await mongoose.connect(MONGODB_URI);
  return cachedConn;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { imageData, fileName } = body || {};

    if (!imageData) {
      return res.status(400).json({ error: 'imageData is required' });
    }

    const commaIndex = imageData.indexOf(',');
    const rawBase64 = commaIndex !== -1 ? imageData.slice(commaIndex + 1) : imageData;
    const cleanBase64 = rawBase64.replace(/[^A-Za-z0-9+/=]/g, '');
    const imageBuffer = Buffer.from(cleanBase64, 'base64');

    let ext = 'jpg';
    let mimeType = 'image/jpeg';
    const mimeMatch = imageData.match(/^data:image\/([a-zA-Z0-9+.-]+);/);
    if (mimeMatch) {
      const mime = mimeMatch[1].toLowerCase();
      if (mime.includes('png')) { ext = 'png'; mimeType = 'image/png'; }
      else if (mime.includes('webp')) { ext = 'webp'; mimeType = 'image/webp'; }
      else if (mime.includes('svg')) { ext = 'svg'; mimeType = 'image/svg+xml'; }
      else if (mime.includes('gif')) { ext = 'gif'; mimeType = 'image/gif'; }
    }

    const safeName = fileName
      ? fileName.replace(/[^a-zA-Z0-9_.-]/g, '_')
      : `profile_${Date.now()}.${ext}`;
    const targetFileName = safeName.endsWith(`.${ext}`) ? safeName : `${safeName}.${ext}`;

    await connectToMongo();
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'images'
    });

    const readable = new Readable();
    readable.push(imageBuffer);
    readable.push(null);

    const uploadStream = bucket.openUploadStream(targetFileName, {
      contentType: mimeType,
      metadata: { originalName: fileName, uploadedAt: new Date() }
    });

    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
      readable.pipe(uploadStream);
    });

    const imagePath = `/api/images/${uploadStream.id}`;
    return res.status(200).json({
      success: true,
      imagePath,
      fileId: uploadStream.id,
      storage: 'MongoDB GridFS'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to upload image to GridFS', details: err.message });
  }
}
