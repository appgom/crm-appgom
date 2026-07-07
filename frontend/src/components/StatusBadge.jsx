const VARIANTS = {
  al_corriente: 'bg-emerald-100 text-status-success',
  activo: 'bg-emerald-100 text-status-success',
  vencido: 'bg-red-100 text-status-error',
  con_adeudo: 'bg-red-100 text-status-error',
  cancelado: 'bg-red-100 text-status-error',
  pendiente: 'bg-amber-100 text-status-warning',
  parcial: 'bg-amber-100 text-status-warning',
  pagado: 'bg-emerald-100 text-status-success',
};

export default function StatusBadge({ status, label }) {
  const classes = VARIANTS[status] || 'bg-surface-container text-secondary';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${classes}`}>
      {label}
    </span>
  );
}
