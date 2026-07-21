import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api, BASE_URL } from '../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function ReportesPagoPage() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [procesando, setProcesando] = useState(null);
  const [rechazando, setRechazando] = useState(null);
  const [notasRechazo, setNotasRechazo] = useState('');

  function cargarDatos() {
    setLoading(true);
    api.get('/reportes-pago').then(setReportes).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function confirmar(reporte) {
    setProcesando(reporte.id);
    setError(null);
    try {
      await api.post(`/reportes-pago/${reporte.id}/confirmar`, {});
      cargarDatos();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  }

  async function confirmarRechazo() {
    setProcesando(rechazando.id);
    setError(null);
    try {
      await api.post(`/reportes-pago/${rechazando.id}/rechazar`, { notas: notasRechazo });
      setRechazando(null);
      setNotasRechazo('');
      cargarDatos();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  }

  return (
    <Layout>
      <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Reportes de pago</h2>
      <p className="text-secondary font-body-sm mb-6">
        Pagos por transferencia que los clientes reportaron desde su portal, pendientes de tu confirmación.
      </p>

      {error && <p className="text-status-error mb-4">{error}</p>}

      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {loading && <p className="px-6 py-6 text-secondary">Cargando...</p>}
        {!loading && reportes.length === 0 && (
          <p className="px-6 py-6 text-secondary">No hay reportes de pago pendientes.</p>
        )}

        {!loading && reportes.length > 0 && (
          <div className="divide-y divide-border-subtle">
            {reportes.map((r) => (
              <div key={r.id} className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link to={`/clientes/${r.cliente_id}`} className="font-semibold text-on-surface hover:text-action-blue">
                    {r.cliente_nombre}
                  </Link>
                  {r.cliente_empresa && <span className="text-secondary text-sm"> · {r.cliente_empresa}</span>}
                  <p className="text-sm text-secondary">
                    {r.tipo_servicio} {r.numero_contrato && `(${r.numero_contrato})`}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Reportado el {new Date(r.created_at).toLocaleDateString('es-MX')} · Fecha de pago: {new Date(r.fecha).toLocaleDateString('es-MX')}
                    {r.referencia && ` · Ref: ${r.referencia}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-on-surface text-lg">{formatMoney(r.monto)}</span>
                  <a
                    href={`${BASE_URL}/reportes-pago/${r.id}/comprobante`}
                    className="px-3 py-1.5 border border-border-subtle rounded-lg text-sm text-action-blue hover:bg-surface-base flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">attachment</span>
                    Ver comprobante
                  </a>
                  <button
                    disabled={procesando === r.id}
                    onClick={() => confirmar(r)}
                    className="px-3 py-1.5 bg-action-blue text-white rounded-lg text-sm font-semibold hover:bg-primary transition-all disabled:opacity-50"
                  >
                    {procesando === r.id ? 'Procesando...' : 'Confirmar'}
                  </button>
                  <button
                    disabled={procesando === r.id}
                    onClick={() => setRechazando(r)}
                    className="px-3 py-1.5 border border-border-subtle text-status-error rounded-lg text-sm font-semibold hover:bg-status-error/10 transition-all disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rechazando && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 md:p-8 space-y-4">
              <h3 className="font-headline-md text-headline-md text-on-surface">Rechazar reporte de pago</h3>
              <p className="text-secondary text-body-md">
                Explica brevemente por qué (el cliente podrá ver esta nota en su portal).
              </p>
              <textarea
                rows={3}
                autoFocus
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
                value={notasRechazo}
                onChange={(e) => setNotasRechazo(e.target.value)}
                placeholder="Ej: El monto no coincide con el comprobante adjunto."
              />
              <div className="flex gap-3 md:gap-4 pt-4">
                <button
                  className="flex-1 px-4 py-3 border border-border-subtle text-secondary rounded-lg font-semibold hover:bg-surface-base"
                  onClick={() => {
                    setRechazando(null);
                    setNotasRechazo('');
                  }}
                >
                  Cancelar
                </button>
                <button
                  disabled={procesando === rechazando.id}
                  className="flex-1 px-4 py-3 bg-status-error text-white rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50"
                  onClick={confirmarRechazo}
                >
                  {procesando === rechazando.id ? 'Procesando...' : 'Rechazar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
