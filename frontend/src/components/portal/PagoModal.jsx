import ReportarPagoForm from './ReportarPagoForm';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function PagoModal({ contrato, saldo, onClose, onReportado }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-title-lg text-title-lg text-on-surface">{contrato.tipo_servicio}</h3>
            <p className="text-xs text-text-muted">{contrato.numero_contrato}</p>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {!saldo?.al_corriente && (
          <p className="text-sm text-secondary mb-4">
            Saldo pendiente: <span className="font-bold text-status-warning">{formatMoney(saldo?.saldo_pendiente)}</span>
          </p>
        )}

        {contrato.metodo_cobro === 'stripe' ? (
          <p className="text-sm text-text-muted">
            El pago con tarjeta estará disponible pronto. Mientras tanto, contáctanos para coordinar tu pago.
          </p>
        ) : (
          <>
            <div className="bg-surface-base border border-border-subtle rounded-lg p-4 mb-4 text-sm space-y-1">
              <p className="font-semibold text-on-surface mb-2">Datos para transferencia</p>
              <p className="text-secondary">Banco: <span className="text-on-surface">Hey Banco (antes Banregio)</span></p>
              <p className="text-secondary">CLABE: <span className="text-on-surface font-mono-label">167180000055434044</span></p>
              <p className="text-secondary">Beneficiario: <span className="text-on-surface">APPGOM S.A.S. de C.V.</span></p>
            </div>

            <ReportarPagoForm
              contratoId={contrato.id}
              montoSugerido={saldo?.al_corriente ? contrato.monto : saldo?.saldo_pendiente}
              onCancel={onClose}
              onReportado={onReportado}
            />
          </>
        )}
      </div>
    </div>
  );
}
