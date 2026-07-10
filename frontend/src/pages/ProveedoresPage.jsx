import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { ConfirmDialog } from './ClientesPage';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const PAGE_SIZE = 10;

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function ProveedoresPage() {
  const { usuario } = useAuth();
  const [proveedores, setProveedores] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [expandidoId, setExpandidoId] = useState(null);
  const [saldos, setSaldos] = useState({});

  function cargarDatos() {
    setLoading(true);
    api.get('/proveedores')
      .then((data) => {
        setProveedores(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const totalPages = Math.max(Math.ceil(proveedores.length / PAGE_SIZE), 1);
  const paginaActual = Math.min(page, totalPages);
  const proveedoresPagina = proveedores.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);

  async function toggleExpandir(proveedor) {
    const nuevoId = expandidoId === proveedor.id ? null : proveedor.id;
    setExpandidoId(nuevoId);
    if (nuevoId && !saldos[nuevoId]) {
      try {
        const saldo = await api.get(`/proveedores/${nuevoId}/saldo`);
        setSaldos((prev) => ({ ...prev, [nuevoId]: saldo }));
      } catch (err) {
        setSaldos((prev) => ({ ...prev, [nuevoId]: { error: err.message } }));
      }
    }
  }

  async function confirmarEliminar() {
    try {
      await api.delete(`/proveedores/${eliminando.id}`);
      setEliminando(null);
      cargarDatos();
    } catch (err) {
      setError(err.message);
      setEliminando(null);
    }
  }

  return (
    <Layout searchPlaceholder="Buscar suscripciones...">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Suscripciones</h2>
          <p className="text-secondary font-body-sm">Controla los servicios y pagos a proveedores de Appgom.</p>
        </div>
        <button
          onClick={() => setCreando(true)}
          className="bg-action-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nueva suscripción
        </button>
      </div>

      {error && <p className="text-status-error">{error}</p>}

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        {loading && <p className="px-4 py-6 text-secondary">Cargando...</p>}
        {!loading && proveedoresPagina.length === 0 && (
          <p className="px-4 py-6 text-secondary">Aún no hay suscripciones registradas.</p>
        )}

        {!loading && proveedoresPagina.length > 0 && (
          <>
            {/* Tabla — desktop/tablet */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead className="bg-surface-container-low text-secondary border-b border-border-subtle">
                  <tr>
                    <th className="w-10"></th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Suscripción</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Monto</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Periodicidad</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Próximo pago</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Estatus</th>
                    <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {proveedoresPagina.map((p) => {
                    const expandido = expandidoId === p.id;
                    const saldo = saldos[p.id];
                    return (
                      <Fragment key={p.id}>
                        <tr className="hover:bg-surface-base transition-colors">
                          <td className="pl-4">
                            <button className="p-1 text-secondary hover:text-action-blue" onClick={() => toggleExpandir(p)}>
                              <span className="material-symbols-outlined text-[20px]">
                                {expandido ? 'expand_more' : 'chevron_right'}
                              </span>
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <Link to={`/suscripciones/${p.id}`} className="font-semibold text-on-surface hover:text-action-blue">
                              {p.nombre}
                            </Link>
                            {p.servicio && <span className="block text-xs text-secondary">{p.servicio}</span>}
                          </td>
                          <td className="px-4 py-3 text-right font-mono-label font-bold">${Number(p.monto).toFixed(2)}</td>
                          <td className="px-4 py-3 text-secondary font-body-sm capitalize">{p.periodicidad}</td>
                          <td className="px-4 py-3 text-on-surface font-body-sm">
                            {new Date(p.fecha_proximo_vencimiento).toLocaleDateString('es-MX')}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={p.estatus} label={p.estatus} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                title="Editar"
                                className="p-1.5 text-secondary hover:text-action-blue hover:bg-surface-container-low rounded"
                                onClick={() => setEditando(p)}
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              {usuario?.rol === 'admin' && (
                                <button
                                  title="Eliminar"
                                  className="p-1.5 text-secondary hover:text-status-error hover:bg-status-error/10 rounded"
                                  onClick={() => setEliminando(p)}
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandido && (
                          <tr className="bg-surface-base/60">
                            <td></td>
                            <td colSpan={6} className="px-4 pb-4 pt-1">
                              <div className="border border-border-subtle rounded-lg bg-surface-card p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="font-label-md text-label-md text-text-muted">Correo de la suscripción</p>
                                  <p className="text-sm text-text-main">{p.contacto_email || '—'}</p>
                                </div>
                                <div>
                                  <p className="font-label-md text-label-md text-text-muted">Fecha de inicio</p>
                                  <p className="text-sm text-text-main">{new Date(p.fecha_inicio).toLocaleDateString('es-MX')}</p>
                                </div>
                                <div className="col-span-2">
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
                                  <p className="font-label-md text-label-md text-text-muted">Notas</p>
                                  <p className="text-sm text-text-main">{p.notas || '—'}</p>
                                </div>
                                <div className="col-span-2 md:col-span-4">
                                  <Link to={`/suscripciones/${p.id}`} className="text-action-blue text-sm font-medium hover:underline">
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

            {/* Tarjetas — movil */}
            <div className="md:hidden divide-y divide-border-subtle">
              {proveedoresPagina.map((p) => {
                const expandido = expandidoId === p.id;
                const saldo = saldos[p.id];
                return (
                  <div key={p.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link to={`/suscripciones/${p.id}`} className="text-action-blue font-semibold truncate block">
                          {p.nombre}
                        </Link>
                        {p.servicio && <span className="text-sm text-secondary truncate block">{p.servicio}</span>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          title="Editar"
                          className="p-2 text-secondary hover:text-action-blue hover:bg-surface-container-low rounded"
                          onClick={() => setEditando(p)}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        {usuario?.rol === 'admin' && (
                        <button
                          title="Eliminar"
                          className="p-2 text-secondary hover:text-status-error hover:bg-status-error/10 rounded"
                          onClick={() => setEliminando(p)}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-sm">
                      <span className="font-mono-label font-bold text-text-main">${Number(p.monto).toFixed(2)}</span>
                      <span className="text-secondary capitalize">{p.periodicidad}</span>
                      <StatusBadge status={p.estatus} label={p.estatus} />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-text-muted">
                        Próximo pago: {new Date(p.fecha_proximo_vencimiento).toLocaleDateString('es-MX')}
                      </span>
                      <button className="flex items-center gap-1 text-sm text-secondary" onClick={() => toggleExpandir(p)}>
                        Detalle
                        <span className="material-symbols-outlined text-[18px]">
                          {expandido ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                    </div>

                    {expandido && (
                      <div className="mt-3 border border-border-subtle rounded-lg bg-surface-base p-3 grid grid-cols-2 gap-3">
                        <div>
                          <p className="font-label-md text-label-md text-text-muted">Correo de la suscripción</p>
                          <p className="text-sm text-text-main">{p.contacto_email || '—'}</p>
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-text-muted">Fecha de inicio</p>
                          <p className="text-sm text-text-main">{new Date(p.fecha_inicio).toLocaleDateString('es-MX')}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="font-label-md text-label-md text-text-muted">Saldo pendiente</p>
                          {!saldo && <p className="text-sm text-text-muted">Cargando...</p>}
                          {saldo?.error && <p className="text-sm text-status-error">{saldo.error}</p>}
                          {saldo && !saldo.error && (
                            <p className={`text-sm font-bold ${saldo.al_corriente ? 'text-status-success' : 'text-status-warning'}`}>
                              {saldo.al_corriente ? 'Al corriente' : formatMoney(saldo.saldo_pendiente)}
                            </p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <Link to={`/suscripciones/${p.id}`} className="text-action-blue text-sm font-medium hover:underline">
                            Ver detalle completo →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <Pagination
          page={paginaActual}
          totalPages={totalPages}
          totalItems={proveedores.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          itemLabel="proveedores"
        />
      </div>

      {(creando || editando) && (
        <ProveedorFormModal
          proveedor={editando}
          onClose={() => {
            setCreando(false);
            setEditando(null);
          }}
          onSaved={() => {
            setCreando(false);
            setEditando(null);
            cargarDatos();
          }}
        />
      )}

      {eliminando && (
        <ConfirmDialog
          titulo="Eliminar suscripción"
          mensaje={`¿Seguro que quieres eliminar a "${eliminando.nombre}"? Se eliminarán también sus cargos y pagos asociados.`}
          onCancel={() => setEliminando(null)}
          onConfirm={confirmarEliminar}
        />
      )}
    </Layout>
  );
}

export function ProveedorFormModal({ proveedor, onClose, onSaved }) {
  const esEdicion = Boolean(proveedor);
  const [form, setForm] = useState({
    nombre: proveedor?.nombre || '',
    servicio: proveedor?.servicio || '',
    contacto_email: proveedor?.contacto_email || '',
    password_suscripcion: proveedor?.password_suscripcion || '',
    monto: proveedor?.monto || '',
    periodicidad: proveedor?.periodicidad || 'mensual',
    fecha_inicio: proveedor?.fecha_inicio ? proveedor.fecha_inicio.slice(0, 10) : new Date().toISOString().slice(0, 10),
    fecha_proximo_vencimiento: proveedor?.fecha_proximo_vencimiento
      ? proveedor.fecha_proximo_vencimiento.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    estatus: proveedor?.estatus || 'activo',
    notas: proveedor?.notas || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, monto: Number(form.monto) };
      if (esEdicion) {
        await api.put(`/proveedores/${proveedor.id}`, payload);
      } else {
        await api.post('/proveedores', payload);
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
        <div className="px-5 md:px-8 py-5 md:py-6 border-b border-border-subtle flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            {esEdicion ? 'Editar suscripción' : 'Nueva suscripción'}
          </h3>
          <button className="p-2 hover:bg-surface-base rounded-full transition-colors" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form className="p-5 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto" onSubmit={handleSubmit}>
          {error && <p className="text-status-error text-sm">{error}</p>}

          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Nombre</label>
            <input
              required
              placeholder="Ej: SiteGround, Canva, Anthropic"
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Servicio (opcional)</label>
            <input
              placeholder="Ej: Hosting, diseño, API de IA"
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
              value={form.servicio}
              onChange={(e) => setForm({ ...form, servicio: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Correo con el que estoy suscrito (opcional)</label>
            <input
              type="email"
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
              value={form.contacto_email}
              onChange={(e) => setForm({ ...form, contacto_email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Contraseña de la suscripción (opcional)</label>
            <div className="relative">
              <input
                type={mostrarPassword ? 'text' : 'password'}
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 pr-11 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
                value={form.password_suscripcion}
                onChange={(e) => setForm({ ...form, password_suscripcion: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
                onClick={() => setMostrarPassword((v) => !v)}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {mostrarPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-secondary block">Monto por periodo</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-surface-base border border-border-subtle rounded-lg pl-8 pr-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-secondary block">Periodicidad</label>
              <select
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
                value={form.periodicidad}
                onChange={(e) => setForm({ ...form, periodicidad: e.target.value })}
              >
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-secondary block">Fecha de inicio</label>
              <input
                type="date"
                required
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
                value={form.fecha_inicio}
                onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-secondary block">
                {esEdicion ? 'Próximo pago' : 'Primer pago'}
              </label>
              <input
                type="date"
                required
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
                value={form.fecha_proximo_vencimiento}
                onChange={(e) => setForm({ ...form, fecha_proximo_vencimiento: e.target.value })}
              />
              {esEdicion && (
                <p className="text-xs text-text-muted mt-1">
                  Normalmente avanza solo al registrar un pago. Ajústalo aquí solo si necesitas corregirlo manualmente.
                </p>
              )}
            </div>
          </div>

          {esEdicion && (
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-secondary block">Estatus</label>
              <select
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
                value={form.estatus}
                onChange={(e) => setForm({ ...form, estatus: e.target.value })}
              >
                <option value="activo">Activo</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Notas (opcional)</label>
            <textarea
              rows={3}
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-border-subtle">
            <button type="button" className="flex-1 px-4 py-3 border border-border-subtle text-secondary rounded-lg font-semibold hover:bg-surface-base" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-action-blue text-white rounded-lg font-bold hover:scale-[1.02] transition-all disabled:opacity-50">
              {saving ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Guardar suscripción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
