import { useEffect, useRef, useState } from 'react';

function etiquetaCliente(cliente) {
  if (!cliente) return '';
  return cliente.empresa ? `${cliente.nombre} — ${cliente.empresa}` : cliente.nombre;
}

export default function ClienteBuscador({ clientes, value, onChange, disabled }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const blurTimeout = useRef(null);

  useEffect(() => {
    const seleccionado = clientes.find((c) => String(c.id) === String(value));
    setQuery(seleccionado ? etiquetaCliente(seleccionado) : '');
  }, [value, clientes]);

  const queryNormalizada = query.trim().toLowerCase();
  const buscando = queryNormalizada.length >= 3;
  const resultados = buscando
    ? clientes
        .filter(
          (c) =>
            c.nombre.toLowerCase().includes(queryNormalizada) ||
            (c.empresa && c.empresa.toLowerCase().includes(queryNormalizada))
        )
        .slice(0, 8)
    : [];

  function seleccionar(cliente) {
    onChange(String(cliente.id));
    setQuery(etiquetaCliente(cliente));
    setOpen(false);
  }

  function handleChange(e) {
    const texto = e.target.value;
    setQuery(texto);
    setOpen(true);
    if (value) onChange('');
  }

  function handleBlur() {
    // Retraso para permitir que el click en una opción se registre antes de cerrar.
    blurTimeout.current = setTimeout(() => setOpen(false), 150);
  }

  if (disabled) {
    return (
      <input
        disabled
        className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base disabled:opacity-60"
        value={query}
      />
    );
  }

  return (
    <div className="relative">
      <input
        autoComplete="off"
        placeholder="Escribe al menos 3 letras (nombre o empresa)..."
        className={`w-full border rounded-lg px-4 py-3 text-body-md bg-surface-base ${
          value ? 'border-border-subtle' : 'border-status-error/40'
        }`}
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
      />

      {open && query.trim().length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-border-subtle rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {!buscando && (
            <p className="px-4 py-3 text-sm text-text-muted">Escribe al menos 3 letras para buscar.</p>
          )}
          {buscando && resultados.length === 0 && (
            <p className="px-4 py-3 text-sm text-text-muted">Sin resultados para "{query}".</p>
          )}
          {resultados.map((c) => (
            <button
              type="button"
              key={c.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => seleccionar(c)}
              className="w-full text-left px-4 py-2.5 hover:bg-surface-base transition-colors"
            >
              <p className="text-sm font-semibold text-on-surface">{c.nombre}</p>
              {c.empresa && <p className="text-xs text-secondary">{c.empresa}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
