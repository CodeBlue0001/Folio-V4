import mongoose from 'mongoose';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Image id is required' });
  }

  try {
    await connectToMongo();
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'images'
    });

    let files = [];
    if (mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id)) {
      files = await bucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray();
    }
    if (files.length === 0) {
      files = await bucket.find({ filename: id }).sort({ uploadDate: -1 }).toArray();
    }

    if (files.length === 0) {
      return res.status(404).json({ error: 'Image not found in MongoDB GridFS' });
    }

    const file = files[0];
    res.setHeader('Content-Type', file.contentType || 'image/jpeg');
    if (file.length) res.setHeader('Content-Length', file.length);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');

    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.on('error', (err) => {
      if (!res.headersSent) res.status(500).json({ error: err.message });
    });
    downloadStream.pipe(res);
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching image from GridFS', details: err.message });
  }
}
