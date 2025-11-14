const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure folder exists: /uploads/events
const uploadDir = path.join(__dirname, '../../uploads/events');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

exports.setApp = function (app, client, api_path) {
  app.post(api_path, upload.single('image'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'Image file (image) is required' });
      }

      const imageUrl = `/uploads/events/${file.filename}`;

      return res.status(200).json({
        imageUrl
      });

    } catch (err) {
      console.error('Error in uploadPhoto:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  });
};
