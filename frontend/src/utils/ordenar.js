function compararValores(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  if (typeof a === 'number' && typeof b === 'number') return a - b;

  const na = Number(a);
  const nb = Number(b);
  if (a !== '' && b !== '' && !Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;

  return String(a).localeCompare(String(b), 'es', { sensitivity: 'base' });
}

// Ordena una copia de `lista` por el campo `key`, usando `getValor` para
// extraer el valor comparable de cada fila (por defecto item[key]). Las
// fechas ISO (YYYY-MM-DD...) y los numeros ya comparan bien como string/numero,
// no necesitan tratamiento especial.
export function ordenarPor(lista, key, direccion, getValor = (item, k) => item[k]) {
  if (!key) return lista;
  const factor = direccion === 'desc' ? -1 : 1;
  return [...lista].sort((a, b) => factor * compararValores(getValor(a, key), getValor(b, key)));
}
