const multer = require('multer');
const path = require('path');
const fs = require('fs');

const CSF_DIR = path.join(__dirname, '..', '..', 'uploads', 'csf');
fs.mkdirSync(CSF_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CSF_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cliente-${req.params.id}-${Date.now()}${ext}`);
  },
});

const uploadCsf = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const permitidos = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!permitidos.includes(file.mimetype)) {
      return cb(new Error('Solo se aceptan archivos PDF, PNG o JPG'));
    }
    cb(null, true);
  },
});

module.exports = { uploadCsf, CSF_DIR };
