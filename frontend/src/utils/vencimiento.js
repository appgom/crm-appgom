export function diasHasta(fecha) {
  const ms = new Date(fecha) - new Date();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

// Contratos anuales muestran aviso desde 30 dias antes; el resto (mensual,
// trimestral, quincenal, semanal y modalidades de pago unico) desde 10 dias
// antes — refleja las mismas ventanas que usa el envio de recordatorios
// por correo (ver src/services/recordatoriosService.js).
const TIERS_POR_PERIODICIDAD = {
  anual: [30, 15, 7],
  default: [10, 5, 1],
};

export function estadoVencimiento(v) {
  if (v.vencido) {
    return {
      urgencia: 'vencido',
      label: `${v.dias_atraso} día${v.dias_atraso === 1 ? '' : 's'}`,
      className: 'bg-error-container text-status-error',
    };
  }

  const dias = diasHasta(v.fecha_vencimiento);
  const [t1, t2, t3] = TIERS_POR_PERIODICIDAD[v.periodicidad] || TIERS_POR_PERIODICIDAD.default;

  if (dias <= t3) {
    return {
      urgencia: 'urgente',
      label: dias <= 0 ? 'Vence hoy' : `Vence en ${dias}d`,
      className: 'bg-status-error/15 text-status-error',
    };
  }
  if (dias <= t2) {
    return {
      urgencia: 'moderado',
      label: `Vence en ${dias}d`,
      className: 'bg-status-warning/15 text-status-warning',
    };
  }
  if (dias <= t1) {
    return {
      urgencia: 'aviso',
      label: `Vence en ${dias}d`,
      className: 'bg-action-blue/15 text-action-blue',
    };
  }

  return {
    urgencia: 'lejano',
    label: 'Por vencer',
    className: 'bg-surface-container text-secondary',
  };
}
