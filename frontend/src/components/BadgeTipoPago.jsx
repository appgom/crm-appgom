const ETIQUETAS = {
  anticipo: { label: 'Anticipo', className: 'bg-status-warning/15 text-status-warning' },
  resto: { label: 'Resto (liquida)', className: 'bg-action-blue/15 text-action-blue' },
  pago_total: { label: 'Pago total', className: 'bg-status-success/15 text-status-success' },
};

export default function BadgeTipoPago({ tipo, className = '' }) {
  const info = ETIQUETAS[tipo];
  if (!info) return null;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${info.className} ${className}`}>
      {info.label}
    </span>
  );
}
