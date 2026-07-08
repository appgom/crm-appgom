export default function Pagination({ page, totalPages, totalItems, pageSize, onPageChange, itemLabel = 'registros' }) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="px-6 py-4 border-t border-border-subtle flex items-center justify-between bg-surface-base">
      <p className="text-xs text-text-muted">
        Mostrando <span className="font-bold text-on-surface">{start} - {end}</span> de{' '}
        <span className="font-bold text-on-surface">{totalItems}</span> {itemLabel}
      </p>
      <div className="flex gap-2">
        <button
          className="p-1 px-3 border border-border-subtle rounded hover:bg-surface-container transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </button>
        <button
          className="p-1 px-3 border border-border-subtle rounded hover:bg-surface-container transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
