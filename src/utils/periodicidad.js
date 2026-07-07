const DIAS_POR_PERIODICIDAD = {
  semanal: 7,
  quincenal: 15,
};

const MESES_POR_PERIODICIDAD = {
  mensual: 1,
  trimestral: 3,
  anual: 12,
};

function sumarPeriodicidad(fecha, periodicidad) {
  const resultado = new Date(fecha);

  if (DIAS_POR_PERIODICIDAD[periodicidad]) {
    resultado.setUTCDate(resultado.getUTCDate() + DIAS_POR_PERIODICIDAD[periodicidad]);
    return resultado;
  }

  if (MESES_POR_PERIODICIDAD[periodicidad]) {
    resultado.setUTCMonth(resultado.getUTCMonth() + MESES_POR_PERIODICIDAD[periodicidad]);
    return resultado;
  }

  throw new Error(`Periodicidad desconocida: ${periodicidad}`);
}

module.exports = { sumarPeriodicidad };
