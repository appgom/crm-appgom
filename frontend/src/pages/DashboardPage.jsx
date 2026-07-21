import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import KpiCard from '../components/KpiCard';
import { estadoVencimiento } from '../utils/vencimiento';
import { api } from '../api/client';
import useOrdenamiento from '../hooks/useOrdenamiento';
import ThOrdenable from '../components/ThOrdenable';

const TH_CLASS = 'px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [vencimientos, setVencimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    api
      .get('/vencimientos')
      .then(setVencimientos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return vencimientos;
    return vencimientos.filter(
      (v) =>
        v.cliente_nombre.toLowerCase().includes(q) ||
        (v.cliente_empresa || '').toLowerCase().includes(q) ||
        v.tipo_servicio.toLowerCase().includes(q)
    );
  }, [vencimientos, busqueda]);

  function getValorOrden(item, key) {
    switch (key) {
      case 'cliente':
        return item.cliente_nombre;
      case 'empresa':
        return item.cliente_empresa || '';
      case 'servicio':
        return item.tipo_servicio;
      case 'atraso':
        return estadoVencimiento(item).label;
      default:
        return item[key];
    }
  }

  const { listaOrdenada, ordenKey, ordenDireccion, ordenarPorColumna } = useOrdenamiento(filtrados, {
    getValor: getValorOrden,
  });

  const totalPorCobrar = vencimientos.reduce((sum, v) => sum + v.saldo_pendiente, 0);
  const clientesVencidos = new Set(vencimientos.filter((v) => v.vencido).map((v) => v.cliente_id)).size;
  const proximos = vencimientos.filter((v) => !v.vencido && estadoVencimiento(v).urgencia !== 'lejano').length;

  return (
    <Layout searchPlaceholder="Buscar clientes o contratos..." onSearch={(v) => setBusqueda(v)}>
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
          label="Vencimientos próximos"
          value={loading ? '...' : proximos}
        />
      </div>

      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center">
          <h3 className="font-title-lg text-title-lg">Vencimientos próximos</h3>
        </div>
        {loading && <p className="px-6 py-6 text-secondary">Cargando...</p>}
        {!loading && vencimientos.length === 0 && (
          <p className="px-6 py-6 text-secondary">No hay vencimientos pendientes.</p>
        )}
        {!loading && vencimientos.length > 0 && listaOrdenada.length === 0 && (
          <p className="px-6 py-6 text-secondary">Sin resultados para tu búsqueda.</p>
        )}

        {!loading && listaOrdenada.length > 0 && (
          <>
            {/* Tabla — desktop/tablet */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-base border-b border-border-subtle">
                    <ThOrdenable sortKey="cliente" ordenKey={ordenKey} ordenDireccion={ordenDireccion} onSort={ordenarPorColumna} className={TH_CLASS}>Cliente</ThOrdenable>
                    <ThOrdenable sortKey="empresa" ordenKey={ordenKey} ordenDireccion={ordenDireccion} onSort={ordenarPorColumna} className={TH_CLASS}>Empresa</ThOrdenable>
                    <ThOrdenable sortKey="servicio" ordenKey={ordenKey} ordenDireccion={ordenDireccion} onSort={ordenarPorColumna} className={TH_CLASS}>Servicio</ThOrdenable>
                    <ThOrdenable sortKey="saldo_pendiente" ordenKey={ordenKey} ordenDireccion={ordenDireccion} onSort={ordenarPorColumna} align="right" className={TH_CLASS}>Monto</ThOrdenable>
                    <ThOrdenable sortKey="fecha_vencimiento" ordenKey={ordenKey} ordenDireccion={ordenDireccion} onSort={ordenarPorColumna} className={TH_CLASS}>Vencimiento</ThOrdenable>
                    <ThOrdenable sortKey="atraso" ordenKey={ordenKey} ordenDireccion={ordenDireccion} onSort={ordenarPorColumna} align="center" className={TH_CLASS}>Días de atraso</ThOrdenable>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {listaOrdenada.map((v) => {
                    const estado = estadoVencimiento(v);
                    return (
                      <tr
                        key={v.cargo_id}
                        onClick={() => navigate(`/contratos/${v.contrato_id}`)}
                        className="hover:bg-surface-base transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 font-semibold text-text-main">{v.cliente_nombre}</td>
                        <td className="px-6 py-4 text-text-main">{v.cliente_empresa || '—'}</td>
                        <td className="px-6 py-4 text-text-main">{v.tipo_servicio}</td>
                        <td className="px-6 py-4 text-text-main text-right font-semibold">{formatMoney(v.saldo_pendiente)}</td>
                        <td className="px-6 py-4 text-text-main">
                          {new Date(v.fecha_vencimiento).toLocaleDateString('es-MX')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${estado.className}`}>
                            {estado.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tarjetas — movil */}
            <div className="md:hidden divide-y divide-border-subtle">
              {listaOrdenada.map((v) => {
                const estado = estadoVencimiento(v);
                return (
                  <button
                    key={v.cargo_id}
                    onClick={() => navigate(`/contratos/${v.contrato_id}`)}
                    className="w-full text-left px-4 py-4 active:bg-surface-base transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <p className="font-semibold text-text-main truncate">{v.cliente_nombre}</p>
                        {v.cliente_empresa && <p className="text-xs text-text-muted truncate">{v.cliente_empresa}</p>}
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${estado.className}`}>
                        {estado.label}
                      </span>
                    </div>
                    <p className="text-sm text-secondary mb-2">{v.tipo_servicio}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">{new Date(v.fecha_vencimiento).toLocaleDateString('es-MX')}</span>
                      <span className="font-semibold text-text-main">{formatMoney(v.saldo_pendiente)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
