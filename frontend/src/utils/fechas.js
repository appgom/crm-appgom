// Suma `dias` días de calendario a una fecha (string "YYYY-MM-DD" o ISO datetime)
// y devuelve un Date anclado a medianoche UTC, para que el resultado no varie
// segun la zona horaria del navegador. Al mostrarlo usa siempre
// toLocaleDateString(..., { timeZone: 'UTC' }) para evitar que se recorra un dia.
export function sumarDias(fecha, dias) {
  const [y, m, d] = String(fecha).slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + Number(dias)));
}

// Dias de calendario entre hoy (reloj del navegador) y `fecha` (string
// "YYYY-MM-DD" o ISO datetime). Positivo si `fecha` es futura. Solo para
// pistas de UI (p.ej. mostrar "Pagar" vs "Adelantar pago"), no para calculos
// de atraso que ya vienen precisos desde el backend.
export function diasHasta(fecha) {
  const hoy = new Date();
  const hoyUTC = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const [y, m, d] = String(fecha).slice(0, 10).split('-').map(Number);
  const fechaUTC = Date.UTC(y, m - 1, d);
  return Math.round((fechaUTC - hoyUTC) / 86400000);
}
