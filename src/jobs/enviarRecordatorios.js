require('dotenv').config();
const pool = require('../config/db');
const { procesarRecordatorios } = require('../services/recordatoriosService');

procesarRecordatorios()
  .then((resultados) => {
    console.log(`Recordatorios procesados: ${resultados.length} cargo(s) con aviso.`);
    resultados.forEach((r) => {
      console.log(`  cargo ${r.cargoId} (${r.momento}) — cliente: ${r.cliente}, admin: ${r.admin}`);
    });
  })
  .catch((err) => {
    console.error('Error enviando recordatorios:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
