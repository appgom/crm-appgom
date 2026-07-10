import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import RegistrarPagoProveedorModal from '../components/RegistrarPagoProveedorModal';
import { ConfirmDialog } from './ClientesPage';
import { ProveedorFormModal } from './ProveedoresPage';
import { useAuth } from '../context/AuthContext';
import { api, BASE_URL } from '../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function ProveedorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [proveedor, setProveedor] = useState(null);
  const [saldo, setSaldo] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [proveedorData, saldoData, pagosData] = await Promise.all([
        api.get(`/proveedores/${id}`),
        api.get(`/proveedores/${id}/saldo`),
        api.get(`/proveedores/${id}/pagos`),
      ]);
      setProveedor(proveedorData);
      setSaldo(saldoData);
      setPagos(pagosData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <p className="text-secondary">Cargando...</p>
      </Layout>
    );
  }

  if (error || !proveedor) {
    return (
      <Layout>
        <p className="text-status-error">{error || 'Suscripción no encontrada'}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center gap-2 text-secondary mb-6 font-label-md text-label-md">
        <button onClick={() => navigate('/suscripciones')} className="hover:text-action-blue">Suscripciones</button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-semibold">{proveedor.nombre}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-1">{proveedor.nombre}</h2>
          {proveedor.servicio && <p className="text-secondary font-body-md">{proveedor.servicio}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={() => setEditando(true)}
            className="px-3 md:px-4 py-2 border border-border-subtle text-secondary rounded-lg font-semibold hover:bg-surface-base transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span className="hidden sm:inline">Editar</span>
          </button>
          {usuario?.rol === 'admin' && (
            <button
              onClick={() => setEliminando(true)}
              className="px-3 md:px-4 py-2 border border-border-subtle text-status-error rounded-lg font-semibold hover:bg-status-error/10 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="px-4 md:px-6 py-2 bg-action-blue text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_card</span>
            Registrar pago
          </button>
        </div>
      </div>

      {eliminando && (
        <ConfirmDialog
          titulo="Eliminar suscripción"
          mensaje="¿Seguro que quieres eliminar esta suscripción? Se eliminarán también sus cargos y pagos asociados."
          onCancel={() => setEliminando(false)}
          onConfirm={async () => {
            await api.delete(`/proveedores/${id}`);
            navigate('/suscripciones');
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        <div className="md:col-span-8 bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
          <h3 className="font-title-lg text-title-lg mb-6 text-on-surface">Información principal</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
            <Field label="Monto por periodo" value={formatMoney(proveedor.monto)} />
            <Field label="Periodicidad" value={proveedor.periodicidad} className="capitalize" />
            <Field label="Correo de la suscripción" value={proveedor.contacto_email || '—'} />
            <Field label="Fecha inicio" value={new Date(proveedor.fecha_inicio).toLocaleDateString('es-MX')} />
            <Field label="Próximo pago" value={new Date(proveedor.fecha_proximo_vencimiento).toLocaleDateString('es-MX')} />
            <div>
              <p className="text-text-muted font-label-md text-label-md mb-1 uppercase tracking-wider">Estatus</p>
              <StatusBadge status={proveedor.estatus} label={proveedor.estatus} />
            </div>
            {proveedor.password_suscripcion && (
              <div>
                <p className="text-text-muted font-label-md text-label-md mb-1 uppercase tracking-wider">Contraseña</p>
                <div className="flex items-center gap-2">
                  <p className="font-body-md text-body-md font-bold text-on-surface font-mono-label">
                    {mostrarPassword ? proveedor.password_suscripcion : '••••••••'}
                  </p>
                  <button
                    type="button"
                    className="text-secondary hover:text-on-surface transition-colors"
                    onClick={() => setMostrarPassword((v) => !v)}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {mostrarPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-4 bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
          <h3 className="font-title-lg text-title-lg mb-4 text-on-surface">Saldo actual</h3>
          {saldo?.al_corriente ? (
            <p className="text-status-success font-semibold">Al corriente, sin saldo pendiente.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                <span className="text-secondary text-body-md">Saldo pendiente</span>
                <span className="text-status-warning font-bold">{formatMoney(saldo.saldo_pendiente)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary text-body-md">Días de atraso</span>
                <span className={`font-bold ${saldo.dias_atraso > 0 ? 'text-status-error' : 'text-text-main'}`}>
                  {saldo.dias_atraso}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {proveedor.notas && (
        <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 mb-10">
          <h3 className="font-title-lg text-title-lg mb-3 text-on-surface">Notas</h3>
          <p className="text-body-md text-text-main whitespace-pre-wrap">{proveedor.notas}</p>
        </div>
      )}

      <div className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle">
          <h3 className="font-title-lg text-title-lg text-on-surface">Historial de pagos</h3>
        </div>
        {pagos.length === 0 && <p className="px-6 py-6 text-secondary">Sin pagos registrados.</p>}

        {pagos.length > 0 && (
          <>
            {/* Tabla — desktop/tablet */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-base/50">
                  <tr>
                    <th className="px-6 py-3 font-label-md text-label-md text-secondary uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 font-label-md text-label-md text-secondary uppercase tracking-wider text-right">Monto</th>
                    <th className="px-6 py-3 font-label-md text-label-md text-secondary uppercase tracking-wider">Método</th>
                    <th className="px-6 py-3 font-label-md text-label-md text-secondary uppercase tracking-wider">Referencia</th>
                    <th className="px-6 py-3 font-label-md text-label-md text-secondary uppercase tracking-wider">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {pagos.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-base transition-colors">
                      <td className="px-6 py-4 text-on-surface">{new Date(p.fecha).toLocaleDateString('es-MX')}</td>
                      <td className="px-6 py-4 text-right font-bold text-on-surface">{formatMoney(p.monto)}</td>
                      <td className="px-6 py-4 capitalize">{p.metodo}</td>
                      <td className="px-6 py-4 font-mono-label text-secondary">{p.referencia || '—'}</td>
                      <td className="px-6 py-4">
                        {p.comprobante_nombre_original ? (
                          <a
                            href={`${BASE_URL}/pagos-proveedores/${p.id}/comprobante`}
                            className="text-action-blue hover:underline flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">attachment</span>
                            Ver
                          </a>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas — movil */}
            <div className="md:hidden divide-y divide-border-subtle">
              {pagos.map((p) => (
                <div key={p.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm text-text-muted">{new Date(p.fecha).toLocaleDateString('es-MX')}</span>
                    <span className="font-bold text-on-surface">{formatMoney(p.monto)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="capitalize text-secondary">{p.metodo}</span>
                    <span className="font-mono-label text-xs text-secondary">{p.referencia || '—'}</span>
                    {p.comprobante_nombre_original ? (
                      <a
                        href={`${BASE_URL}/pagos-proveedores/${p.id}/comprobante`}
                        className="text-action-blue flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">attachment</span>
                        Ver
                      </a>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {editando && (
        <ProveedorFormModal
          proveedor={proveedor}
          onClose={() => setEditando(false)}
          onSaved={() => {
            setEditando(false);
            cargarDatos();
          }}
        />
      )}

      {showModal && (
        <RegistrarPagoProveedorModal
          proveedorId={proveedor.id}
          proveedorNombre={proveedor.nombre}
          cargoId={saldo?.cargo_pendiente?.id}
          montoSugerido={saldo?.cargo_pendiente?.monto ?? proveedor.monto}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            cargarDatos();
          }}
        />
      )}
    </Layout>
  );
}

function Field({ label, value, className = '' }) {
  return (
    <div>
      <p className="text-text-muted font-label-md text-label-md mb-1 uppercase tracking-wider">{label}</p>
      <p className={`font-body-md text-body-md font-bold text-on-surface ${className}`}>{value}</p>
    </div>
  );
}
