export function diasHasta(fecha) {
  const ms = new Date(fecha) - new Date();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function estadoVencimiento(v) {
  if (v.vencido) {
    return {
      urgencia: 'vencido',
      label: `${v.dias_atraso} día${v.dias_atraso === 1 ? '' : 's'}`,
      className: 'bg-error-container text-status-error',
    };
  }

  const dias = diasHasta(v.fecha_vencimiento);
  if (dias <= 7) {
    return {
      urgencia: 'proximo',
      label: dias <= 0 ? 'Vence hoy' : `Vence en ${dias}d`,
      className: 'bg-status-warning/15 text-status-warning',
    };
  }

  return {
    urgencia: 'lejano',
    label: 'Por vencer',
    className: 'bg-surface-container text-secondary',
  };
}
