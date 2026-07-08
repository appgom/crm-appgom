import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { ConfirmDialog } from './ClientesPage';
import { api } from '../api/client';

const PAGE_SIZE = 10;

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function ContratosPage() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [filtroEstatus, setFiltroEstatus] = useState('todos');
  const [filtroServicio, setFiltroServicio] = useState('todos');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [expandidoId, setExpandidoId] = useState(null);
  const [saldos, setSaldos] = useState({});

  function cargarDatos() {
    setLoading(true);
    Promise.all([api.get('/contratos'), api.get('/clientes'), api.get('/catalogo-servicios')])
      .then(([contratosData, clientesData, serviciosData]) => {
        setContratos(contratosData);
        setClientes(clientesData);
        setServicios(serviciosData);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function nombreCliente(clienteId) {
    return clientes.find((c) => c.id === clienteId)?.nombre || '—';
  }

  function nombreServicio(tipoServicioId) {
    return servicios.find((s) => s.id === tipoServicioId)?.nombre || '—';
  }

  const filtrados = useMemo(
    () =>
      contratos.filter((c) => {
        if (filtroEstatus !== 'todos' && c.estatus !== filtroEstatus) return false;
        if (filtroServicio !== 'todos' && c.tipo_servicio_id !== Number(filtroServicio)) return false;
        return true;
      }),
    [contratos, filtroEstatus, filtroServicio]
  );

  const totalPages = Math.max(Math.ceil(filtrados.length / PAGE_SIZE), 1);
  const paginaActual = Math.min(page, totalPages);
  const contratosPagina = filtrados.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  async function toggleExpandir(contrato) {
    const nuevoId = expandidoId === contrato.id ? null : contrato.id;
    setExpandidoId(nuevoId);
    if (nuevoId && !saldos[nuevoId]) {
      try {
        const saldo = await api.get(`/contratos/${nuevoId}/saldo`);
        setSaldos((prev) => ({ ...prev, [nuevoId]: saldo }));
      } catch (err) {
        setSaldos((prev) => ({ ...prev, [nuevoId]: { error: err.message } }));
      }
    }
  }

  async function confirmarEliminar() {
    try {
      await api.delete(`/contratos/${eliminando.id}`);
      setEliminando(null);
      cargarDatos();
    } catch (err) {
      setError(err.message);
      setEliminando(null);
    }
  }

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
              onChange={(e) => {
                setFiltroEstatus(e.target.value);
                setPage(1);
              }}
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
              onChange={(e) => {
                setFiltroServicio(e.target.value);
                setPage(1);
              }}
            >
              <option value="todos">Todos</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead className="bg-surface-container-low text-secondary border-b border-border-subtle">
              <tr>
                <th className="w-10"></th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Cliente</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Servicio</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Monto</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Periodicidad</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Próximo vencimiento</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Estatus</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading && (
                <tr>
                  <td className="px-4 py-6 text-secondary" colSpan={8}>Cargando...</td>
                </tr>
              )}
              {!loading && contratosPagina.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-secondary" colSpan={8}>Sin contratos que coincidan con el filtro.</td>
                </tr>
              )}
              {contratosPagina.map((c) => {
                const expandido = expandidoId === c.id;
                const saldo = saldos[c.id];
                return (
                  <Fragment key={c.id}>
                    <tr className="hover:bg-surface-base transition-colors">
                      <td className="pl-4">
                        <button className="p-1 text-secondary hover:text-action-blue" onClick={() => toggleExpandir(c)}>
                          <span className="material-symbols-outlined text-[20px]">
                            {expandido ? 'expand_more' : 'chevron_right'}
                          </span>
                        </button>
                      </td>
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
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Editar"
                            className="p-1.5 text-secondary hover:text-action-blue hover:bg-surface-container-low rounded"
                            onClick={() => navigate(`/contratos/${c.id}/editar`)}
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            title="Eliminar"
                            className="p-1.5 text-secondary hover:text-status-error hover:bg-red-50 rounded"
                            onClick={() => setEliminando(c)}
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandido && (
                      <tr className="bg-surface-base/60">
                        <td></td>
                        <td colSpan={7} className="px-4 pb-4 pt-1">
                          <div className="border border-border-subtle rounded-lg bg-surface-card p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="font-label-md text-label-md text-text-muted">Número de contrato</p>
                              <p className="text-sm text-text-main">{c.numero_contrato || '—'}</p>
                            </div>
                            <div>
                              <p className="font-label-md text-label-md text-text-muted">Modalidad</p>
                              <p className="text-sm text-text-main capitalize">{c.modalidad_facturacion}</p>
                            </div>
                            <div>
                              <p className="font-label-md text-label-md text-text-muted">Fecha de inicio</p>
                              <p className="text-sm text-text-main">{new Date(c.fecha_inicio).toLocaleDateString('es-MX')}</p>
                            </div>
                            <div>
                              <p className="font-label-md text-label-md text-text-muted">Saldo pendiente</p>
                              {!saldo && <p className="text-sm text-text-muted">Cargando...</p>}
                              {saldo?.error && <p className="text-sm text-status-error">{saldo.error}</p>}
                              {saldo && !saldo.error && (
                                <p className={`text-sm font-bold ${saldo.al_corriente ? 'text-status-success' : 'text-status-warning'}`}>
                                  {saldo.al_corriente ? 'Al corriente' : formatMoney(saldo.saldo_pendiente)}
                                  {saldo.dias_atraso > 0 && ` (${saldo.dias_atraso}d de atraso)`}
                                </p>
                              )}
                            </div>
                            <div className="col-span-2 md:col-span-4">
                              <p className="font-label-md text-label-md text-text-muted">Descripción</p>
                              <p className="text-sm text-text-main">{c.descripcion || '—'}</p>
                            </div>
                            <div className="col-span-2 md:col-span-4">
                              <Link to={`/contratos/${c.id}`} className="text-action-blue text-sm font-medium hover:underline">
                                Ver detalle completo →
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          page={paginaActual}
          totalPages={totalPages}
          totalItems={filtrados.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="contratos"
        />
      </div>

      {eliminando && (
        <ConfirmDialog
          titulo="Eliminar contrato"
          mensaje={`¿Seguro que quieres eliminar este contrato de "${nombreServicio(eliminando.tipo_servicio_id)}"? Se eliminarán también sus cargos y pagos asociados.`}
          onCancel={() => setEliminando(null)}
          onConfirm={confirmarEliminar}
        />
      )}
    </Layout>
  );
}
