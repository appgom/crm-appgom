// fecha_vencimiento (y similares) son columnas DATE: pg siempre las entrega
// ancladas a medianoche UTC de ese dia calendario, sin importar la zona
// horaria de la sesion — por eso se leen con getUTC*.
function inicioDelDiaUTC(fecha) {
  const d = new Date(fecha);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

// "Ahora" es un instante real, no una columna DATE: hay que preguntarle que
// dia es en Mexico (no en UTC del servidor), para que el corte de "hoy"
// coincida con el dia calendario real del cliente. Depende de TZ=America/Mexico_City
// en el proceso (ver .env) para que getFullYear/getMonth/getDate (sin UTC)
// reflejen la hora local correcta.
function inicioDeHoyEnMexico() {
  const ahora = new Date();
  return Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

// Dias de calendario entre hoy (en Mexico) y `fecha`. Positivo = en el
// futuro, negativo = ya paso, 0 = hoy mismo.
function diasDesdeHoy(fecha) {
  const ms = inicioDelDiaUTC(fecha) - inicioDeHoyEnMexico();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

module.exports = { inicioDelDiaUTC, inicioDeHoyEnMexico, diasDesdeHoy };
