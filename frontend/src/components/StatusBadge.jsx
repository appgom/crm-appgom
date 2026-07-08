const VARIANTS = {
  al_corriente: 'bg-status-success/15 text-status-success',
  activo: 'bg-status-success/15 text-status-success',
  vencido: 'bg-status-error/15 text-status-error',
  con_adeudo: 'bg-status-error/15 text-status-error',
  cancelado: 'bg-status-error/15 text-status-error',
  pendiente: 'bg-status-warning/15 text-status-warning',
  parcial: 'bg-status-warning/15 text-status-warning',
  pagado: 'bg-status-success/15 text-status-success',
};

export default function StatusBadge({ status, label }) {
  const classes = VARIANTS[status] || 'bg-surface-container text-secondary';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${classes}`}>
      {label}
    </span>
  );
}
