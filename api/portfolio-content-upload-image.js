import mongoose from 'mongoose';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

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
  cachedConn = await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  return cachedConn;
}

const portfolioContentSchema = new mongoose.Schema(
  {
    identifier: { type: String, default: 'main', unique: true, index: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now }
  },
  { collection: 'portfolio_content', timestamps: true }
);

const PortfolioContent = mongoose.models.PortfolioContent || mongoose.model('PortfolioContent', portfolioContentSchema);

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

    // Immediately persist profileImage into MongoDB PortfolioContent collection
    try {
      let doc = await PortfolioContent.findOne({ identifier: 'main' }).lean();
      let currentContent = doc?.content;
      if (!currentContent) {
        try {
          const filePath = path.join(process.cwd(), 'server', 'portfolio_content.json');
          if (fs.existsSync(filePath)) {
            currentContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          }
        } catch { }
      }
      if (!currentContent) currentContent = {};
      if (!currentContent.about) currentContent.about = {};
      currentContent.about.profileImage = imagePath;

      await PortfolioContent.findOneAndUpdate(
        { identifier: 'main' },
        { content: currentContent, updatedAt: new Date() },
        { upsert: true, new: true }
      );

      // Also persist to disk JSON file if writable
      try {
        const filePath = path.join(process.cwd(), 'server', 'portfolio_content.json');
        fs.writeFileSync(filePath, JSON.stringify(currentContent, null, 2), 'utf-8');
      } catch { }
    } catch (dbErr) {
      console.warn('[GridFS Upload] Warning: Failed to update PortfolioContent in MongoDB:', dbErr);
    }

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
