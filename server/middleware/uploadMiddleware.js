const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');
const { TextDecoder } = require('util');
const cloudinary = require('cloudinary').v2;

const allowedTypes = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
};
const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);
const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);
const uploadsDir = path.join(__dirname, '../uploads');

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else if (process.env.NODE_ENV === 'production') {
  throw new Error('Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET for persistent production uploads.');
} else if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const matchesSignature = (extension, bytes) => {
  if (extension === 'jpg' || extension === 'jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (extension === 'png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (extension === 'webp') return bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (extension === 'pdf') return bytes.toString('ascii', 0, 5) === '%PDF-';
  if (extension === 'doc' || extension === 'ppt') {
    return bytes.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  }
  if (extension === 'docx' || extension === 'pptx') {
    return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
  }
  if (extension === 'txt') return !bytes.includes(0);
  return false;
};

const isUtf8TextFile = async (filePath) => {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const handle = await fs.promises.open(filePath, 'r');
  const chunk = Buffer.alloc(64 * 1024);
  let position = 0;
  try {
    while (true) {
      const { bytesRead } = await handle.read(chunk, 0, chunk.length, position);
      if (!bytesRead) break;
      const bytes = chunk.subarray(0, bytesRead);
      if (bytes.includes(0)) return false;
      decoder.decode(bytes, { stream: true });
      position += bytesRead;
    }
    decoder.decode();
    return true;
  } catch {
    return false;
  } finally {
    await handle.close();
  }
};

const storage = {
  _handleFile(req, file, callback) {
    const extension = path.extname(file.originalname).slice(1).toLowerCase();
    const temporaryPath = path.join(os.tmpdir(), `peervo-${crypto.randomUUID()}`);

    (async () => {
      await pipeline(file.stream, fs.createWriteStream(temporaryPath, { flags: 'wx', mode: 0o600 }));
      const handle = await fs.promises.open(temporaryPath, 'r');
      const header = Buffer.alloc(16);
      const { bytesRead } = await handle.read(header, 0, header.length, 0);
      await handle.close();
      if (!bytesRead || !matchesSignature(extension, header.subarray(0, bytesRead))) {
        const error = new Error('The file contents do not match the selected file type.');
        error.statusCode = 400;
        throw error;
      }
      if (extension === 'txt' && !(await isUtf8TextFile(temporaryPath))) {
        const error = new Error('Text files must contain valid UTF-8 text.');
        error.statusCode = 400;
        throw error;
      }

      if (cloudinaryConfigured) {
        const publicId = `${file.fieldname}-${crypto.randomUUID()}`;
        const uploaded = await cloudinary.uploader.upload(temporaryPath, {
          folder: 'peervo',
          public_id: publicId,
          resource_type: 'auto',
        });
        await fs.promises.unlink(temporaryPath);
        return callback(null, {
          path: uploaded.secure_url,
          secure_url: uploaded.secure_url,
          filename: uploaded.public_id,
          resource_type: uploaded.resource_type,
          size: uploaded.bytes,
        });
      }

      const filename = `${file.fieldname}-${crypto.randomUUID()}.${extension}`;
      const destination = path.join(uploadsDir, filename);
      await fs.promises.rename(temporaryPath, destination);
      return callback(null, {
        destination: uploadsDir,
        filename,
        path: `/uploads/${filename}`,
        size: (await fs.promises.stat(destination)).size,
      });
    })().catch(async (error) => {
      await fs.promises.unlink(temporaryPath).catch(() => {});
      callback(error);
    });
  },

  _removeFile(req, file, callback) {
    if (cloudinaryConfigured && file.filename) {
      return cloudinary.uploader.destroy(file.filename, { resource_type: file.resource_type || 'image' })
        .then(() => callback(null))
        .catch(callback);
    }
    if (file.destination && file.filename) return fs.unlink(path.join(file.destination, file.filename), callback);
    if (file.path && path.isAbsolute(file.path)) return fs.unlink(file.path, callback);
    callback(null);
  },
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).slice(1).toLowerCase();
    const isImageField = file.fieldname !== 'file';
    const validType = allowedTypes[extension] === file.mimetype.toLowerCase();
    const validField = !isImageField || imageExtensions.has(extension);
    if (validType && validField) return callback(null, true);

    const error = new Error(isImageField
      ? 'Profile pictures and project screenshots must be JPG, PNG, or WebP images.'
      : 'File extension and content type must match a supported image, PDF, DOC/DOCX, PPT/PPTX, or TXT file.');
    error.statusCode = 400;
    return callback(error);
  },
});

module.exports = upload;
