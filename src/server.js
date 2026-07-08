require('dotenv').config();
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
