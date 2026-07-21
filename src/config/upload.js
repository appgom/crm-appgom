const multer = require('multer');
const path = require('path');
const fs = require('fs');

const CSF_DIR = path.join(__dirname, '..', '..', 'uploads', 'csf');
const COMPROBANTES_DIR = path.join(__dirname, '..', '..', 'uploads', 'comprobantes');
const COMPROBANTES_PROVEEDOR_DIR = path.join(__dirname, '..', '..', 'uploads', 'comprobantes-proveedores');
const REPORTES_PAGO_DIR = path.join(__dirname, '..', '..', 'uploads', 'reportes-pago');
fs.mkdirSync(CSF_DIR, { recursive: true });
fs.mkdirSync(COMPROBANTES_DIR, { recursive: true });
fs.mkdirSync(COMPROBANTES_PROVEEDOR_DIR, { recursive: true });
fs.mkdirSync(REPORTES_PAGO_DIR, { recursive: true });

const ARCHIVOS_PERMITIDOS = ['application/pdf', 'image/png', 'image/jpeg'];

function filtroArchivo(req, file, cb) {
  if (!ARCHIVOS_PERMITIDOS.includes(file.mimetype)) {
    return cb(new Error('Solo se aceptan archivos PDF, PNG o JPG'));
  }
  cb(null, true);
}

const uploadCsf = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, CSF_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `cliente-${req.params.id}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: filtroArchivo,
});

const uploadComprobante = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, COMPROBANTES_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `pago-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: filtroArchivo,
});

const uploadComprobanteProveedor = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, COMPROBANTES_PROVEEDOR_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `pago-proveedor-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: filtroArchivo,
});

const uploadReportePago = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, REPORTES_PAGO_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `reporte-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: filtroArchivo,
});

module.exports = {
  uploadCsf,
  uploadComprobante,
  uploadComprobanteProveedor,
  uploadReportePago,
  CSF_DIR,
  COMPROBANTES_DIR,
  COMPROBANTES_PROVEEDOR_DIR,
  REPORTES_PAGO_DIR,
};
