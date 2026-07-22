import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/PortalLayout';
import PagoModal from '../../components/portal/PagoModal';
import { portalApi } from '../../api/portalClient';
import { etiquetaModalidad } from '../../utils/modalidad';
import { diasHasta } from '../../utils/fechas';
import { PORTAL_BASE } from '../../utils/portalBase';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

// Umbral de dias antes del vencimiento a partir del cual el boton pasa de
// "Adelantar pago" a "Pagar": mas ajustado para contratos recurrentes
// mensuales (ciclo corto) que para el resto (anual, proyecto unico, etc).
function esUrgente(contrato, saldo) {
  if (!saldo || saldo.al_corriente) return false;
  if (saldo.dias_atraso > 0) return true;
  const fechaObjetivo = saldo.cargo_pendiente?.fecha_vencimiento || contrato.fecha_proximo_vencimiento;
  const umbral = contrato.periodicidad === 'mensual' ? 15 : 30;
  return diasHasta(fechaObjetivo) <= umbral;
}

export default function PortalDashboardPage() {
  const [contratos, setContratos] = useState([]);
  const [saldos, setSaldos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagando, setPagando] = useState(null);

  function cargarDatos() {
    portalApi
      .get('/portal/contratos')
      .then(async (data) => {
        setContratos(data);
        const entradas = await Promise.all(
          data.map(async (c) => {
            const saldo = await portalApi.get(`/portal/contratos/${c.id}/saldo`).catch(() => null);
            return [c.id, saldo];
          })
        );
        setSaldos(Object.fromEntries(entradas));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const saldosValidos = Object.values(saldos).filter(Boolean);
  const saldoPendienteTotal = saldosValidos.reduce((sum, s) => sum + (s.al_corriente ? 0 : s.saldo_pendiente), 0);
  const diasAtrasoMax = saldosValidos.reduce((max, s) => Math.max(max, s.dias_atraso || 0), 0);
  const proximoVencimiento = contratos
    .filter((c) => c.estatus === 'activo')
    .map((c) => c.fecha_proximo_vencimiento)
    .sort()[0];

  return (
    <PortalLayout>
      <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Mis contratos</h2>
      <p className="text-secondary font-body-sm mb-6">Consulta el estado y saldo de cada uno de tus servicios.</p>

      {error && <p className="text-status-error mb-4">{error}</p>}
      {loading && <p className="text-secondary">Cargando...</p>}

      {!loading && !error && contratos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface-card border border-border-subtle rounded-xl p-5">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Saldo pendiente total</p>
            <p className={`text-xl font-bold ${saldoPendienteTotal > 0 ? 'text-status-warning' : 'text-status-success'}`}>
              {formatMoney(saldoPendienteTotal)}
            </p>
          </div>
          <div className="bg-surface-card border border-border-subtle rounded-xl p-5">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Próximo vencimiento</p>
            <p className="text-xl font-bold text-on-surface">
              {proximoVencimiento
                ? new Date(proximoVencimiento).toLocaleDateString('es-MX', { timeZone: 'UTC' })
                : '—'}
            </p>
          </div>
          <div className="bg-surface-card border border-border-subtle rounded-xl p-5">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Días de atraso</p>
            {diasAtrasoMax > 0 ? (
              <p className="text-xl font-bold text-status-error">{diasAtrasoMax}d</p>
            ) : (
              <p className="text-xl font-bold text-status-success">Al corriente</p>
            )}
          </div>
        </div>
      )}

      {!loading && contratos.length === 0 && (
        <p className="text-secondary">Aún no tienes contratos activos.</p>
      )}

      <div className="space-y-4">
        {contratos.map((c) => {
          const saldo = saldos[c.id];
          const urgente = esUrgente(c, saldo);
          return (
            <div
              key={c.id}
              className="bg-surface-card border border-border-subtle rounded-xl p-5 hover:border-action-blue transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <Link to={`${PORTAL_BASE}/contratos/${c.id}`} className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface">{c.tipo_servicio}</p>
                  <p className="text-sm text-secondary">
                    {c.numero_contrato} · {etiquetaModalidad(c.modalidad_facturacion)}
                  </p>
                </Link>
                {saldo && (
                  <div className="text-right shrink-0">
                    {saldo.al_corriente ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-success/15 text-status-success">
                        Al corriente
                      </span>
                    ) : (
                      <>
                        <p className="font-bold text-on-surface">{formatMoney(saldo.saldo_pendiente)}</p>
                        {saldo.dias_atraso > 0 && (
                          <p className="text-xs text-status-error">{saldo.dias_atraso}d de atraso</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              {saldo && c.estatus === 'activo' && (
                <div className="mt-3 pt-3 border-t border-border-subtle flex justify-end">
                  <button
                    onClick={() => setPagando(c)}
                    disabled={c.metodo_cobro === 'stripe'}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                      urgente
                        ? 'bg-action-blue text-white hover:opacity-90'
                        : 'border border-border-subtle text-secondary hover:bg-surface-base'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {urgente ? 'payment' : 'schedule_send'}
                    </span>
                    {c.metodo_cobro === 'stripe' ? 'Próximamente' : urgente ? 'Pagar' : 'Adelantar pago'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pagando && (
        <PagoModal
          contrato={pagando}
          saldo={saldos[pagando.id]}
          onClose={() => setPagando(null)}
          onReportado={() => {
            setPagando(null);
            cargarDatos();
          }}
        />
      )}
    </PortalLayout>
  );
}
