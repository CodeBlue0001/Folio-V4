import mongoose from 'mongoose';

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse id from query or URL path
  let id = req.query?.id;
  if (!id && req.url) {
    const urlWithoutQuery = req.url.split('?')[0];
    const parts = urlWithoutQuery.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart !== 'images') {
      id = lastPart;
    }
  }

  if (typeof id === 'string') {
    id = id.trim();
    if (id.startsWith('/api/images/')) {
      id = id.replace('/api/images/', '');
    }
    // Remove query params if still attached
    id = id.split('?')[0];
  }

  try {
    await connectToMongo();
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'images'
    });

    // If no id provided on GET, return recent images list
    if (!id) {
      if (req.method === 'GET') {
        const files = await bucket.find({}).sort({ uploadDate: -1 }).limit(50).toArray();
        return res.status(200).json(files);
      }
      return res.status(400).json({ error: 'Image id is required' });
    }

    // Try finding by raw id, by clean id (without extension), and by filename
    const cleanId = id.replace(/\.[^/.]+$/, '');
    let files = [];

    // 1. Try finding by raw id as ObjectId
    if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id) {
      files = await bucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray();
    }
    // 2. Try finding by cleanId as ObjectId
    if (files.length === 0 && cleanId && mongoose.Types.ObjectId.isValid(cleanId) && String(new mongoose.Types.ObjectId(cleanId)) === cleanId) {
      files = await bucket.find({ _id: new mongoose.Types.ObjectId(cleanId) }).toArray();
    }
    // 3. Try finding by exact filename
    if (files.length === 0) {
      files = await bucket.find({ filename: id }).sort({ uploadDate: -1 }).toArray();
    }
    // 4. Try finding by cleanId as filename
    if (files.length === 0 && cleanId !== id) {
      files = await bucket.find({ filename: cleanId }).sort({ uploadDate: -1 }).toArray();
    }
    // 5. Try case-insensitive filename search
    if (files.length === 0) {
      files = await bucket.find({ filename: new RegExp(`^${cleanId}`, 'i') }).sort({ uploadDate: -1 }).toArray();
    }

    if (files.length === 0) {
      return res.status(404).json({ error: 'Image not found in MongoDB GridFS', requestedId: id });
    }

    const file = files[0];

    // Handle DELETE
    if (req.method === 'DELETE') {
      await bucket.delete(file._id);
      return res.status(200).json({ success: true, message: 'Image deleted from GridFS', fileId: file._id });
    }

    // Determine content type
    let contentType = file.contentType || file.metadata?.contentType;
    if (!contentType || contentType === 'application/octet-stream') {
      const ext = (file.filename || '').split('.').pop()?.toLowerCase();
      if (ext === 'png') contentType = 'image/png';
      else if (ext === 'webp') contentType = 'image/webp';
      else if (ext === 'svg') contentType = 'image/svg+xml';
      else if (ext === 'gif') contentType = 'image/gif';
      else contentType = 'image/jpeg';
    }

    // Read all binary chunks from MongoDB GridFS chunks collection
    // In serverless, we must await the complete stream into a buffer before ending response
    const downloadStream = bucket.openDownloadStream(file._id);
    const chunks = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('X-Storage-Source', 'MongoDB-GridFS-Chunks');

    return res.status(200).send(buffer);
  } catch (err) {
    return res.status(500).json({ error: 'Error streaming image from GridFS chunks', details: err.message });
  }
}

