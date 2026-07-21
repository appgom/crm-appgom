import { useState, useMemo } from 'react';
import { ordenarPor } from '../utils/ordenar';

// Estado + logica de ordenamiento por columna, reutilizable en cualquier tabla.
// `getValor(item, key)` es opcional, para columnas cuyo valor comparable no
// es simplemente item[key] (ej. nombre completo armado de dos campos).
export default function useOrdenamiento(lista, { keyInicial = null, direccionInicial = 'asc', getValor } = {}) {
  const [ordenKey, setOrdenKey] = useState(keyInicial);
  const [ordenDireccion, setOrdenDireccion] = useState(direccionInicial);

  function ordenarPorColumna(key) {
    if (ordenKey === key) {
      setOrdenDireccion((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrdenKey(key);
      setOrdenDireccion('asc');
    }
  }

  const listaOrdenada = useMemo(
    () => ordenarPor(lista, ordenKey, ordenDireccion, getValor),
    [lista, ordenKey, ordenDireccion]
  );

  return { listaOrdenada, ordenKey, ordenDireccion, ordenarPorColumna };
}
