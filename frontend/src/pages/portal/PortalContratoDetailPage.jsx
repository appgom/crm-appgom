import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PortalLayout from '../../components/PortalLayout';
import { portalApi } from '../../api/portalClient';
import { etiquetaModalidad } from '../../utils/modalidad';
import { sumarDias } from '../../utils/fechas';
import { PORTAL_HOME } from '../../utils/portalBase';
import ReportarPagoForm from '../../components/portal/ReportarPagoForm';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

const ESTATUS_REPORTE = {
  pendiente: { label: 'En revisión', className: 'bg-status-warning/15 text-status-warning' },
  confirmado: { label: 'Confirmado', className: 'bg-status-success/15 text-status-success' },
  rechazado: { label: 'Rechazado', className: 'bg-status-error/15 text-status-error' },
};

export default function PortalContratoDetailPage() {
  const { id } = useParams();
  const [contrato, setContrato] = useState(null);
  const [saldo, setSaldo] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  function cargarDatos() {
    setLoading(true);
    Promise.all([
      portalApi.get(`/portal/contratos/${id}`),
      portalApi.get(`/portal/contratos/${id}/saldo`),
      portalApi.get('/portal/reportes-pago'),
      portalApi.get('/portal/pagos'),
    ])
      .then(([contratoData, saldoData, reportesData, pagosData]) => {
        setContrato(contratoData);
        setSaldo(saldoData);
        setReportes(reportesData.filter((r) => r.contrato_id === Number(id)));
        setPagos(pagosData.filter((p) => p.contrato_id === Number(id)));
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargarDatos();
  }, [id]);

  if (loading) {
    return (
      <PortalLayout>
        <p className="text-secondary">Cargando...</p>
      </PortalLayout>
    );
  }

  if (error || !contrato) {
    return (
      <PortalLayout>
        <p className="text-status-error">{error || 'Contrato no encontrado'}</p>
      </PortalLayout>
    );
  }

  const fechaLimite =
    contrato.dias_gracia_pago != null
      ? sumarDias(contrato.fecha_proximo_vencimiento, contrato.dias_gracia_pago).toLocaleDateString('es-MX', {
          timeZone: 'UTC',
        })
      : null;

  return (
    <PortalLayout>
      <div className="flex items-center gap-2 text-secondary mb-6 font-label-md text-label-md">
        <Link to={PORTAL_HOME} className="hover:text-action-blue">Mis contratos</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-semibold">{contrato.tipo_servicio}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        <div className="md:col-span-7 bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
          <h3 className="font-title-lg text-title-lg mb-4 text-on-surface">{contrato.tipo_servicio}</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
            <div>
              <p className="text-text-muted uppercase tracking-wider text-xs mb-1">Número de contrato</p>
              <p className="font-bold text-on-surface">{contrato.numero_contrato}</p>
            </div>
            <div>
              <p className="text-text-muted uppercase tracking-wider text-xs mb-1">Modalidad</p>
              <p className="font-bold text-on-surface">{etiquetaModalidad(contrato.modalidad_facturacion)}</p>
            </div>
            <div>
              <p className="text-text-muted uppercase tracking-wider text-xs mb-1">Monto</p>
              <p className="font-bold text-on-surface">{formatMoney(contrato.monto)}</p>
            </div>
            <div>
              <p className="text-text-muted uppercase tracking-wider text-xs mb-1">Próximo vencimiento</p>
              <p className="font-bold text-on-surface">
                {new Date(contrato.fecha_proximo_vencimiento).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
              </p>
            </div>
            {fechaLimite && (
              <div>
                <p className="text-text-muted uppercase tracking-wider text-xs mb-1">Fecha límite de pago</p>
                <p className="font-bold text-on-surface">{fechaLimite}</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-5 bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
          <h3 className="font-title-lg text-title-lg mb-4 text-on-surface">Saldo actual</h3>
          {saldo?.al_corriente ? (
            <p className="text-status-success font-semibold">Al corriente, sin saldo pendiente.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                <span className="text-secondary text-sm">Saldo pendiente</span>
                <span className="text-status-warning font-bold">{formatMoney(saldo.saldo_pendiente)}</span>
              </div>
              {saldo.dias_atraso > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-secondary text-sm">Días de atraso</span>
                  <span className="font-bold text-status-error">{saldo.dias_atraso}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!saldo?.al_corriente && (
        <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 mb-8">
          <h3 className="font-title-lg text-title-lg mb-4 text-on-surface">¿Cómo pagar?</h3>

          {contrato.metodo_cobro === 'stripe' ? (
            <div>
              <button
                disabled
                className="px-6 py-3 bg-action-blue text-white rounded-lg font-bold opacity-50 cursor-not-allowed flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">credit_card</span>
                Pagar con tarjeta — próximamente
              </button>
              <p className="text-xs text-text-muted mt-2">
                El pago con tarjeta estará disponible pronto. Mientras tanto, contáctanos para coordinar tu pago.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-surface-base border border-border-subtle rounded-lg p-4 mb-4 text-sm space-y-1">
                <p className="font-semibold text-on-surface mb-2">Datos para transferencia</p>
                <p className="text-secondary">Banco: <span className="text-on-surface">Hey Banco (antes Banregio)</span></p>
                <p className="text-secondary">CLABE: <span className="text-on-surface font-mono-label">167180000055434044</span></p>
                <p className="text-secondary">Beneficiario: <span className="text-on-surface">APPGOM S.A.S. de C.V.</span></p>
              </div>

              {!mostrarFormulario ? (
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="px-6 py-3 bg-action-blue text-white rounded-lg font-bold hover:bg-primary transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                  Ya pagué, reportar comprobante
                </button>
              ) : (
                <ReportarPagoForm
                  contratoId={contrato.id}
                  montoSugerido={saldo.saldo_pendiente}
                  onCancel={() => setMostrarFormulario(false)}
                  onReportado={() => {
                    setMostrarFormulario(false);
                    cargarDatos();
                  }}
                />
              )}
            </>
          )}
        </div>
      )}

      {reportes.length > 0 && (
        <div className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-border-subtle">
            <h3 className="font-title-lg text-title-lg text-on-surface">Mis reportes de pago</h3>
          </div>
          <div className="divide-y divide-border-subtle">
            {reportes.map((r) => {
              const estado = ESTATUS_REPORTE[r.estatus];
              return (
                <div key={r.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-on-surface font-semibold">{formatMoney(r.monto)}</p>
                    <p className="text-xs text-text-muted">
                      Reportado el {new Date(r.created_at).toLocaleDateString('es-MX')}
                    </p>
                    {r.estatus === 'rechazado' && r.notas_admin && (
                      <p className="text-xs text-status-error mt-1">Motivo: {r.notas_admin}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${estado.className}`}>
                    {estado.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle">
          <h3 className="font-title-lg text-title-lg text-on-surface">Historial de pagos confirmados</h3>
        </div>
        {pagos.length === 0 ? (
          <p className="px-6 py-6 text-secondary">Sin pagos confirmados todavía.</p>
        ) : (
          <div className="divide-y divide-border-subtle">
            {pagos.map((p) => (
              <div key={p.pago_id} className="p-4 flex items-center justify-between">
                <p className="text-sm text-text-main">{new Date(p.fecha).toLocaleDateString('es-MX')}</p>
                <p className="font-bold text-on-surface">{formatMoney(p.monto_aplicado)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
