// Suma `dias` días de calendario a una fecha (string "YYYY-MM-DD" o ISO datetime)
// y devuelve un Date anclado a medianoche UTC, para que el resultado no varie
// segun la zona horaria del navegador. Al mostrarlo usa siempre
// toLocaleDateString(..., { timeZone: 'UTC' }) para evitar que se recorra un dia.
export function sumarDias(fecha, dias) {
  const [y, m, d] = String(fecha).slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + Number(dias)));
}
