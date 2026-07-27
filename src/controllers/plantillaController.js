const plantillaModel = require('../models/plantillaModel');
const { METADATA_TIPOS } = require('../services/plantillaService');

async function list(req, res) {
  const plantillas = await plantillaModel.findAll();
  res.json({ plantillas, metadata: METADATA_TIPOS });
}

async function actualizar(req, res) {
  const { tipo, canal } = req.params;
  if (!METADATA_TIPOS[tipo]) return res.status(404).json({ error: 'Tipo de plantilla no reconocido' });
  if (!['email', 'whatsapp'].includes(canal)) return res.status(400).json({ error: 'Canal inválido' });

  const { asunto, cuerpo, activo } = req.body;
  if (!cuerpo || !cuerpo.trim()) return res.status(400).json({ error: 'El cuerpo de la plantilla es requerido' });

  const existente = await plantillaModel.findByTipoYCanal(tipo, canal);
  if (!existente) return res.status(404).json({ error: 'Plantilla no encontrada' });

  const actualizada = await plantillaModel.actualizar(
    tipo,
    canal,
    { asunto, cuerpo, activo: activo ?? existente.activo },
    req.usuario.id
  );
  res.json(actualizada);
}

module.exports = { list, actualizar };
