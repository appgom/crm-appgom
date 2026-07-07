import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function VencimientosPage() {
  const [vencimientos, setVencimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/vencimientos').then(setVencimientos).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  return (
    <Layout searchPlaceholder="Buscar por cliente...">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Cuentas por cobrar</h2>
      <p className="text-secondary font-body-sm mb-6">Quién debe y qué vence pronto, ordenado por fecha de vencimiento.</p>

      {error && <p className="text-status-error">{error}</p>}

      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-base border-b border-border-subtle">
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Servicio</th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider text-right">Saldo</th>
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
                  <td className="px-6 py-6 text-secondary" colSpan={5}>No hay cargos pendientes. Todos al corriente.</td>
                </tr>
              )}
              {vencimientos.map((v) => (
                <tr key={v.cargo_id} className="hover:bg-surface-base transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/clientes/${v.cliente_id}`} className="font-semibold text-on-surface hover:text-action-blue">
                      {v.cliente_nombre}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/contratos/${v.contrato_id}`} className="text-action-blue hover:underline">
                      {v.tipo_servicio}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">{formatMoney(v.saldo_pendiente)}</td>
                  <td className="px-6 py-4">{new Date(v.fecha_vencimiento).toLocaleDateString('es-MX')}</td>
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
