const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwtHelper = require('../../createJWT.js');

const uploadDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const name = path.basename(file.originalname, ext);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${name}-${unique}${ext || '.jpg'}`);
  },
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const fileFilter = (_req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

exports.setApp = function (app, client, api_path) {
  app.post(api_path, upload.single('image'), async (req, res) => {
    try {
      const token = req.body?.token;

      if (!token) {
        return res.status(400).json({ error: 'Missing authentication token' });
      }

      if (jwtHelper.isExpired(token)) {
        return res.status(401).json({ error: 'The JWT is no longer valid', token: '' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
      }

      const userPayload = jwtHelper.getUserFromToken(token);
      if (!userPayload?.userId) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const imageUrl = `/uploads/profiles/${req.file.filename}`;
      const db = client.db('COP4331Cards');
      const users = db.collection('Users');
      const events = db.collection('Events');

      await users.updateOne(
        { UserId: userPayload.userId },
        { $set: { ProfileImageUrl: imageUrl } },
        { upsert: false },
      );

      await events.updateMany(
        { EventOwnerId: userPayload.userId },
        { $set: { OwnerProfileImageUrl: imageUrl } },
      );

      await events.updateMany(
        { "Comments.AuthorId": userPayload.userId },
        { $set: { "Comments.$[comment].AuthorImageUrl": imageUrl } },
        { arrayFilters: [{ "comment.AuthorId": userPayload.userId }] },
      );

      const refreshedToken = jwtHelper.refresh(token);

      return res.status(200).json({
        profileImageUrl: imageUrl,
        token: refreshedToken,
      });
    } catch (err) {
      console.error('Error in /api/auth/uploadProfilePhoto:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  });
};
