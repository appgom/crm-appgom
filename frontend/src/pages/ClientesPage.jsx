import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { api } from '../api/client';

const PAGE_SIZE = 10;

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [vencimientos, setVencimientos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [expandidoId, setExpandidoId] = useState(null);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [clientesData, contratosData, vencimientosData, serviciosData] = await Promise.all([
        api.get('/clientes'),
        api.get('/contratos'),
        api.get('/vencimientos'),
        api.get('/catalogo-servicios'),
      ]);
      setClientes(clientesData);
      setContratos(contratosData);
      setVencimientos(vencimientosData);
      setServicios(serviciosData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function nombreServicio(tipoServicioId) {
    return servicios.find((s) => s.id === tipoServicioId)?.nombre || '—';
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const clientesConInfo = useMemo(
    () =>
      clientes
        .map((cliente) => {
          const contratosCliente = contratos.filter((c) => c.cliente_id === cliente.id);
          const activos = contratosCliente.filter((c) => c.estatus === 'activo').length;
          const conAdeudo = vencimientos.some((v) => v.cliente_id === cliente.id && v.vencido);
          return { ...cliente, contratosActivos: activos, estatusGeneral: conAdeudo ? 'con_adeudo' : 'al_corriente' };
        })
        .filter(
          (c) =>
            c.nombre.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase())
        ),
    [clientes, contratos, vencimientos, search]
  );

  const totalPages = Math.max(Math.ceil(clientesConInfo.length / PAGE_SIZE), 1);
  const paginaActual = Math.min(page, totalPages);
  const clientesPagina = clientesConInfo.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  async function confirmarEliminar() {
    try {
      await api.delete(`/clientes/${eliminando.id}`);
      setEliminando(null);
      cargarDatos();
    } catch (err) {
      setError(err.message);
      setEliminando(null);
    }
  }

  return (
    <Layout
      searchPlaceholder="Buscar clientes por nombre o email..."
      onSearch={(v) => {
        setSearch(v);
        setPage(1);
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Clientes</h2>
          <p className="font-body-md text-body-md text-secondary">
            Gestiona la base de datos de tus clientes y sus estados financieros.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-action-blue text-white rounded-lg font-title-lg text-title-lg hover:bg-primary transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Nuevo cliente
        </button>
      </div>

      {error && <p className="text-status-error">{error}</p>}

      <div className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-sm mt-6">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-base border-b border-border-subtle">
                <th className="w-10"></th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider text-center">
                  Contratos activos
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Estatus</th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading && (
                <tr>
                  <td className="px-6 py-6 text-secondary" colSpan={7}>Cargando...</td>
                </tr>
              )}
              {!loading && clientesPagina.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-secondary" colSpan={7}>Sin clientes registrados.</td>
                </tr>
              )}
              {clientesPagina.map((cliente) => {
                const expandido = expandidoId === cliente.id;
                const contratosCliente = contratos.filter((c) => c.cliente_id === cliente.id);
                return (
                  <Fragment key={cliente.id}>
                    <tr className="hover:bg-surface-base transition-colors">
                      <td className="pl-4">
                        <button
                          className="p-1 text-secondary hover:text-action-blue"
                          onClick={() => setExpandidoId(expandido ? null : cliente.id)}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {expandido ? 'expand_more' : 'chevron_right'}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/clientes/${cliente.id}`} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs">
                            {cliente.nombre.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-on-surface hover:text-action-blue">{cliente.nombre}</span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-secondary">{cliente.email}</td>
                      <td className="px-6 py-4 text-secondary">{cliente.telefono || '—'}</td>
                      <td className="px-6 py-4 text-center font-mono-label">
                        <button className="hover:text-action-blue hover:underline" onClick={() => setExpandidoId(expandido ? null : cliente.id)}>
                          {cliente.contratosActivos}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          status={cliente.estatusGeneral}
                          label={cliente.estatusGeneral === 'con_adeudo' ? 'Con adeudo' : 'Al corriente'}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Editar"
                            className="p-1.5 text-secondary hover:text-action-blue hover:bg-surface-container-low rounded"
                            onClick={() => setEditando(cliente)}
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            title="Eliminar"
                            className="p-1.5 text-secondary hover:text-status-error hover:bg-red-50 rounded"
                            onClick={() => setEliminando(cliente)}
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandido && (
                      <tr className="bg-surface-base/60">
                        <td></td>
                        <td colSpan={6} className="px-6 pb-4 pt-1">
                          {contratosCliente.length === 0 ? (
                            <p className="text-secondary text-sm py-2">Este cliente no tiene contratos.</p>
                          ) : (
                            <div className="border border-border-subtle rounded-lg overflow-hidden bg-surface-card">
                              {contratosCliente.map((c) => (
                                <Link
                                  key={c.id}
                                  to={`/contratos/${c.id}`}
                                  className="flex items-center justify-between px-4 py-2.5 border-b last:border-b-0 border-border-subtle hover:bg-surface-base transition-colors"
                                >
                                  <span className="text-action-blue font-medium text-sm">{nombreServicio(c.tipo_servicio_id)}</span>
                                  <span className="text-secondary text-xs">${Number(c.monto).toFixed(2)} · {c.periodicidad}</span>
                                  <StatusBadge status={c.estatus} label={c.estatus} />
                                </Link>
                              ))}
                            </div>
                          )}
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
          totalItems={clientesConInfo.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="clientes"
        />
      </div>

      {showModal && (
        <ClienteFormModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            cargarDatos();
          }}
        />
      )}

      {editando && (
        <ClienteFormModal
          cliente={editando}
          onClose={() => setEditando(null)}
          onSaved={() => {
            setEditando(null);
            cargarDatos();
          }}
        />
      )}

      {eliminando && (
        <ConfirmDialog
          titulo="Eliminar cliente"
          mensaje={`¿Seguro que quieres eliminar a "${eliminando.nombre}"? Esta acción no se puede deshacer y fallará si el cliente tiene contratos asociados.`}
          onCancel={() => setEliminando(null)}
          onConfirm={confirmarEliminar}
        />
      )}
    </Layout>
  );
}

export function ClienteFormModal({ cliente, onClose, onSaved }) {
  const esEdicion = Boolean(cliente);
  const [form, setForm] = useState({
    nombre: cliente?.nombre || '',
    email: cliente?.email || '',
    telefono: cliente?.telefono || '',
    razon_social: cliente?.razon_social || '',
    rfc: cliente?.rfc || '',
    direccion_fiscal: cliente?.direccion_fiscal || '',
    direccion_envio_facturas: cliente?.direccion_envio_facturas || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (esEdicion) {
        await api.put(`/clientes/${cliente.id}`, form);
      } else {
        await api.post('/clientes', form);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="px-8 py-6 border-b border-border-subtle flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
          </h3>
          <button className="p-2 hover:bg-surface-base rounded-full transition-colors" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form className="p-8 space-y-6 max-h-[70vh] overflow-y-auto" onSubmit={handleSubmit}>
          {error && <p className="text-status-error text-sm">{error}</p>}
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Nombre</label>
            <input
              required
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Email</label>
            <input
              required
              type="email"
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Teléfono</label>
            <input
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-border-subtle space-y-6">
            <p className="font-label-md text-label-md text-secondary uppercase tracking-wider">Datos de facturación (opcional)</p>
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-secondary block">Razón social</label>
              <input
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
                value={form.razon_social}
                onChange={(e) => setForm({ ...form, razon_social: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-secondary block">RFC</label>
              <input
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue font-mono-label"
                value={form.rfc}
                onChange={(e) => setForm({ ...form, rfc: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-secondary block">Dirección fiscal</label>
              <textarea
                rows={2}
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
                value={form.direccion_fiscal}
                onChange={(e) => setForm({ ...form, direccion_fiscal: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-secondary block">Dirección para envío de facturas</label>
              <textarea
                rows={2}
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
                value={form.direccion_envio_facturas}
                onChange={(e) => setForm({ ...form, direccion_envio_facturas: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-border-subtle">
            <button type="button" className="flex-1 px-4 py-3 border border-border-subtle text-secondary rounded-lg font-semibold hover:bg-surface-base" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-action-blue text-white rounded-lg font-bold hover:bg-primary transition-all disabled:opacity-50"
            >
              {saving ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Guardar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ConfirmDialog({ titulo, mensaje, onCancel, onConfirm, confirmLabel = 'Eliminar' }) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 space-y-4">
          <h3 className="font-headline-md text-headline-md text-on-surface">{titulo}</h3>
          <p className="text-secondary text-body-md">{mensaje}</p>
          <div className="flex gap-4 pt-4">
            <button className="flex-1 px-4 py-3 border border-border-subtle text-secondary rounded-lg font-semibold hover:bg-surface-base" onClick={onCancel}>
              Cancelar
            </button>
            <button
              disabled={loading}
              className="flex-1 px-4 py-3 bg-status-error text-white rounded-lg font-bold hover:opacity-90 transition-all disabled:opacity-50"
              onClick={handleConfirm}
            >
              {loading ? 'Procesando...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
