const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Local Disk Storage setup as robust fallback
const localStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const checkFileTypes = (file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|pdf|doc|docx|ppt|pptx|txt/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype) || file.mimetype.includes('pdf') || file.mimetype.includes('document');

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file format. Allowed: Images, PDF, DOC, PPT, TXT'));
  }
};

const upload = multer({
  storage: localStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    checkFileTypes(file, cb);
  },
});

module.exports = upload;
