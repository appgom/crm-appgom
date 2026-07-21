export default function ThOrdenable({
  children,
  sortKey,
  ordenKey,
  ordenDireccion,
  onSort,
  align = 'left',
  // Estilos base del <th>; cada tabla del sistema usa su propia combinacion
  // de padding/tamaño, asi que el default es solo un fallback razonable.
  className = 'px-4 py-3 font-semibold text-xs uppercase tracking-wider',
}) {
  const activo = ordenKey === sortKey;
  const alineacion = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : '';

  return (
    <th
      className={`text-secondary cursor-pointer select-none hover:text-on-surface transition-colors ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : ''} ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <span className={`inline-flex items-center gap-1 w-full ${alineacion}`}>
        {children}
        <span className={`material-symbols-outlined text-[16px] ${activo ? 'opacity-100' : 'opacity-40'}`}>
          {activo && ordenDireccion === 'desc' ? 'arrow_downward' : 'arrow_upward'}
        </span>
      </span>
    </th>
  );
}
