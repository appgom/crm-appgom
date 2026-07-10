import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import KpiCard from '../components/KpiCard';
import RegistrarPagoModal from '../components/RegistrarPagoModal';
import { estadoVencimiento } from '../utils/vencimiento';
import { api } from '../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function VencimientosPage() {
  const [vencimientos, setVencimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagando, setPagando] = useState(null);

  function cargarDatos() {
    setLoading(true);
    api.get('/vencimientos').then(setVencimientos).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const totalPendiente = vencimientos.reduce((sum, v) => sum + v.saldo_pendiente, 0);
  const totalVencidos = vencimientos.filter((v) => v.vencido).length;

  return (
    <Layout searchPlaceholder="Buscar por cliente...">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Cuentas por cobrar</h2>
      <p className="text-secondary font-body-sm mb-6">Quién debe y qué vence pronto, ordenado por fecha de vencimiento.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <KpiCard icon="account_balance_wallet" label="Total pendiente" value={formatMoney(totalPendiente)} />
        <KpiCard
          icon="warning"
          iconClass="bg-error-container text-status-error"
          label="Cargos vencidos"
          value={totalVencidos}
        />
        <KpiCard icon="receipt_long" label="Cargos pendientes/parciales" value={vencimientos.length} />
      </div>

      {error && <p className="text-status-error">{error}</p>}

      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        {loading && <p className="px-6 py-6 text-secondary">Cargando...</p>}
        {!loading && vencimientos.length === 0 && (
          <p className="px-6 py-6 text-secondary">No hay cargos pendientes. Todos al corriente.</p>
        )}

        {!loading && vencimientos.length > 0 && (
          <>
            {/* Tabla — desktop/tablet */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-surface-base border-b border-border-subtle">
                    <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Servicio</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider text-right">Monto</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider text-right">Pagado</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider text-right">Saldo</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Vencimiento</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider text-center">Días de atraso</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {vencimientos.map((v) => {
                    const estado = estadoVencimiento(v);
                    return (
                      <tr key={v.cargo_id} className="hover:bg-surface-base transition-colors">
                        <td className="px-6 py-4">
                          <Link to={`/clientes/${v.cliente_id}`} className="font-semibold text-on-surface hover:text-action-blue block">
                            {v.cliente_nombre}
                          </Link>
                          <span className="text-xs text-text-muted">{v.cliente_email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/contratos/${v.contrato_id}`} className="text-action-blue hover:underline">
                            {v.tipo_servicio}
                          </Link>
                          {v.numero_contrato && <span className="block text-xs text-text-muted">{v.numero_contrato}</span>}
                        </td>
                        <td className="px-6 py-4 text-right">{formatMoney(v.monto)}</td>
                        <td className="px-6 py-4 text-right text-status-success">{formatMoney(v.total_pagado)}</td>
                        <td className="px-6 py-4 text-right font-semibold">{formatMoney(v.saldo_pendiente)}</td>
                        <td className="px-6 py-4">{new Date(v.fecha_vencimiento).toLocaleDateString('es-MX')}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${estado.className}`}>
                            {estado.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setPagando(v)}
                            className="px-3 py-1.5 bg-action-blue text-white rounded-lg text-xs font-semibold hover:bg-primary transition-all flex items-center gap-1 ml-auto"
                          >
                            <span className="material-symbols-outlined text-[16px]">add_card</span>
                            Registrar pago
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tarjetas — movil */}
            <div className="md:hidden divide-y divide-border-subtle">
              {vencimientos.map((v) => {
                const estado = estadoVencimiento(v);
                return (
                <div key={v.cargo_id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <Link to={`/clientes/${v.cliente_id}`} className="font-semibold text-on-surface truncate block">
                        {v.cliente_nombre}
                      </Link>
                      <Link to={`/contratos/${v.contrato_id}`} className="text-action-blue text-sm truncate block">
                        {v.tipo_servicio}
                      </Link>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${estado.className}`}>
                      {estado.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3 text-sm">
                    <div>
                      <p className="text-xs text-text-muted">Monto</p>
                      <p className="text-text-main">{formatMoney(v.monto)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Pagado</p>
                      <p className="text-status-success">{formatMoney(v.total_pagado)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">Saldo</p>
                      <p className="font-semibold text-text-main">{formatMoney(v.saldo_pendiente)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      Vence: {new Date(v.fecha_vencimiento).toLocaleDateString('es-MX')}
                    </span>
                    <button
                      onClick={() => setPagando(v)}
                      className="px-3 py-1.5 bg-action-blue text-white rounded-lg text-xs font-semibold hover:bg-primary transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_card</span>
                      Registrar pago
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {pagando && (
        <RegistrarPagoModal
          clienteId={pagando.cliente_id}
          clienteNombre={pagando.cliente_nombre}
          contratoId={pagando.contrato_id}
          cargoId={pagando.cargo_id}
          tipoServicio={pagando.tipo_servicio}
          montoSugerido={pagando.saldo_pendiente}
          onClose={() => setPagando(null)}
          onSaved={() => {
            setPagando(null);
            cargarDatos();
          }}
        />
      )}
    </Layout>
  );
}
