import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import KpiCard from '../components/KpiCard';
import { api } from '../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function DashboardPage() {
  const [vencimientos, setVencimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/vencimientos')
      .then(setVencimientos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalPorCobrar = vencimientos.reduce((sum, v) => sum + v.saldo_pendiente, 0);
  const clientesVencidos = new Set(vencimientos.filter((v) => v.vencido).map((v) => v.cliente_id)).size;
  const en7dias = vencimientos.filter((v) => !v.vencido && diasHasta(v.fecha_vencimiento) <= 7).length;

  function diasHasta(fecha) {
    const ms = new Date(fecha) - new Date();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }

  return (
    <Layout searchPlaceholder="Buscar clientes o contratos...">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-headline-md text-headline-md text-text-main">Dashboard General</h2>
          <p className="text-text-muted font-body-md">Resumen ejecutivo del estado de cobranza y clientes.</p>
        </div>
      </div>

      {error && <p className="text-status-error">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard
          icon="account_balance_wallet"
          label="Total por cobrar"
          value={loading ? '...' : formatMoney(totalPorCobrar)}
        />
        <KpiCard
          icon="warning"
          iconClass="bg-error-container text-status-error"
          label="Clientes con pago vencido"
          value={loading ? '...' : clientesVencidos}
          hint={clientesVencidos > 0 ? 'Urgente' : undefined}
          hintClass="text-status-error"
        />
        <KpiCard
          icon="calendar_today"
          iconClass="bg-secondary-container text-secondary"
          label="Vencimientos próximos (7 días)"
          value={loading ? '...' : en7dias}
        />
      </div>

      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center">
          <h3 className="font-title-lg text-title-lg">Vencimientos próximos</h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-base border-b border-border-subtle">
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Servicio</th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider text-right">Monto</th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Vencimiento</th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider text-center">Días de atraso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading && (
                <tr>
                  <td className="px-6 py-6 text-secondary" colSpan={5}>Cargando...</td>
                </tr>
              )}
              {!loading && vencimientos.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-secondary" colSpan={5}>No hay vencimientos pendientes.</td>
                </tr>
              )}
              {vencimientos.map((v) => (
                <tr key={v.cargo_id} className="hover:bg-surface-base transition-colors">
                  <td className="px-6 py-4 font-semibold text-text-main">{v.cliente_nombre}</td>
                  <td className="px-6 py-4 text-text-main">{v.tipo_servicio}</td>
                  <td className="px-6 py-4 text-text-main text-right font-semibold">{formatMoney(v.saldo_pendiente)}</td>
                  <td className="px-6 py-4 text-text-main">
                    {new Date(v.fecha_vencimiento).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {v.vencido ? (
                      <span className="px-3 py-1 bg-error-container text-status-error rounded-full text-xs font-bold">
                        {v.dias_atraso} días
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-surface-container text-secondary rounded-full text-xs font-medium">
                        Por vencer
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
