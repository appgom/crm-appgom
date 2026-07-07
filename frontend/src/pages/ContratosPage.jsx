import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api/client';

export default function ContratosPage() {
  const [contratos, setContratos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [filtroEstatus, setFiltroEstatus] = useState('todos');
  const [filtroServicio, setFiltroServicio] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/contratos'), api.get('/clientes'), api.get('/catalogo-servicios')])
      .then(([contratosData, clientesData, serviciosData]) => {
        setContratos(contratosData);
        setClientes(clientesData);
        setServicios(serviciosData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function nombreCliente(clienteId) {
    return clientes.find((c) => c.id === clienteId)?.nombre || '—';
  }

  function nombreServicio(tipoServicioId) {
    return servicios.find((s) => s.id === tipoServicioId)?.nombre || '—';
  }

  const filtrados = contratos.filter((c) => {
    if (filtroEstatus !== 'todos' && c.estatus !== filtroEstatus) return false;
    if (filtroServicio !== 'todos' && c.tipo_servicio_id !== Number(filtroServicio)) return false;
    return true;
  });

  return (
    <Layout searchPlaceholder="Buscar contratos por cliente...">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Gestión de Contratos</h2>
          <p className="text-secondary font-body-sm">Visualiza y administra los acuerdos comerciales vigentes.</p>
        </div>
        <Link
          to="/contratos/nuevo"
          className="bg-action-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nuevo contrato
        </Link>
      </div>

      {error && <p className="text-status-error">{error}</p>}

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border-subtle bg-surface-container-lowest flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Estatus:</label>
            <select
              className="bg-surface-base border border-border-subtle rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-action-blue"
              value={filtroEstatus}
              onChange={(e) => setFiltroEstatus(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="activo">Activo</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Servicio:</label>
            <select
              className="bg-surface-base border border-border-subtle rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-action-blue"
              value={filtroServicio}
              onChange={(e) => setFiltroServicio(e.target.value)}
            >
              <option value="todos">Todos</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-surface-container-low text-secondary border-b border-border-subtle">
              <tr>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Servicio</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Monto</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Periodicidad</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Próximo vencimiento</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading && (
                <tr>
                  <td className="px-4 py-6 text-secondary" colSpan={6}>Cargando...</td>
                </tr>
              )}
              {!loading && filtrados.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-secondary" colSpan={6}>Sin contratos que coincidan con el filtro.</td>
                </tr>
              )}
              {filtrados.map((c) => (
                <tr key={c.id} className="hover:bg-surface-base transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/clientes/${c.cliente_id}`} className="font-semibold text-on-surface hover:text-action-blue">
                      {nombreCliente(c.cliente_id)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/contratos/${c.id}`} className="text-action-blue hover:underline text-[13px] font-medium">
                      {nombreServicio(c.tipo_servicio_id)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-mono-label font-bold">${Number(c.monto).toFixed(2)}</td>
                  <td className="px-4 py-3 text-secondary font-body-sm capitalize">{c.periodicidad}</td>
                  <td className="px-4 py-3 text-on-surface font-body-sm">
                    {new Date(c.fecha_proximo_vencimiento).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.estatus} label={c.estatus} />
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
