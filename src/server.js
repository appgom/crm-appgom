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
const proveedorRoutes = require('./routes/proveedorRoutes');
const pagoProveedorRoutes = require('./routes/pagoProveedorRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const portalAuthRoutes = require('./routes/portalAuthRoutes');
const portalRoutes = require('./routes/portalRoutes');
const reportePagoRoutes = require('./routes/reportePagoRoutes');
const facturaRoutes = require('./routes/facturaRoutes');
const requireAuth = require('./middleware/requireAuth');
const requirePortalAuth = require('./middleware/requirePortalAuth');

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
app.use('/api/proveedores', requireAuth, proveedorRoutes);
app.use('/api/pagos-proveedores', requireAuth, pagoProveedorRoutes);
app.use('/api/usuarios', requireAuth, usuarioRoutes);
app.use('/api/reportes-pago', requireAuth, reportePagoRoutes);
app.use('/api/facturas', requireAuth, facturaRoutes);

app.use('/api/portal/auth', portalAuthRoutes);
app.use('/api/portal', requirePortalAuth, portalRoutes);

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

const NOMBRES_CAMPO = {
  email: 'correo',
  numero_contrato: 'número de contrato',
  rfc: 'RFC',
};

function nombreCampo(campo) {
  return NOMBRES_CAMPO[campo] || campo;
}

app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError || /Solo se aceptan archivos/.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }

  // Errores de Postgres: dan mas contexto que un 500 generico.
  if (err.code === '23505') {
    const campo = err.detail?.match(/Key \(([^)]+)\)=/)?.[1];
    const mensaje = campo
      ? `Ya existe un registro con ese ${nombreCampo(campo)}.`
      : 'Ya existe un registro con esos datos.';
    return res.status(409).json({ error: mensaje });
  }
  if (err.code === '23503') {
    return res.status(409).json({ error: 'No se puede completar la operación: hay registros relacionados que lo impiden.' });
  }
  if (err.code === '23502') {
    const campo = err.column ? nombreCampo(err.column) : null;
    return res.status(400).json({ error: campo ? `Falta el campo obligatorio: ${campo}.` : 'Falta un campo obligatorio.' });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Uno de los valores enviados tiene un formato inválido.' });
  }

  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
