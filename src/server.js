require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const clienteRoutes = require('./routes/clienteRoutes');
const contratoRoutes = require('./routes/contratoRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const catalogoServicioRoutes = require('./routes/catalogoServicioRoutes');
const vencimientoRoutes = require('./routes/vencimientoRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/clientes', clienteRoutes);
app.use('/api/contratos', contratoRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/catalogo-servicios', catalogoServicioRoutes);
app.use('/api/vencimientos', vencimientoRoutes);

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
