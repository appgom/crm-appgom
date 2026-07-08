require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const contratoRoutes = require('./routes/contratoRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const catalogoServicioRoutes = require('./routes/catalogoServicioRoutes');
const vencimientoRoutes = require('./routes/vencimientoRoutes');
const requireAuth = require('./middleware/requireAuth');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);

app.use('/api/clientes', requireAuth, clienteRoutes);
app.use('/api/contratos', requireAuth, contratoRoutes);
app.use('/api/pagos', requireAuth, pagoRoutes);
app.use('/api/catalogo-servicios', requireAuth, catalogoServicioRoutes);
app.use('/api/vencimientos', requireAuth, vencimientoRoutes);

// En Render (y en cualquier deploy que construya el frontend), el mismo
// servidor Express sirve el build de React. En local, frontend/dist no
// existe (se usa `npm run dev` de Vite por separado), asi que este bloque
// simplemente no hace nada.
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof multer.MulterError || /Solo se aceptan archivos/.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
