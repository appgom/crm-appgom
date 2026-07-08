import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { ClienteFormModal } from './ClientesPage';
import { api, BASE_URL } from '../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function ClienteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [subiendoCsf, setSubiendoCsf] = useState(false);
  const [csfError, setCsfError] = useState(null);
  const fileInputRef = useRef(null);

  function cargarDatos() {
    setLoading(true);
    Promise.all([
      api.get(`/clientes/${id}`),
      api.get('/contratos'),
      api.get('/catalogo-servicios'),
      api.get(`/clientes/${id}/pagos`),
    ])
      .then(([clienteData, contratosData, serviciosData, pagosData]) => {
        setCliente(clienteData);
        setContratos(contratosData.filter((c) => c.cliente_id === Number(id)));
        setServicios(serviciosData);
        setPagos(pagosData);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargarDatos();
  }, [id]);

  function nombreServicio(tipoServicioId) {
    return servicios.find((s) => s.id === tipoServicioId)?.nombre || '—';
  }

  async function handleCsfChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoCsf(true);
    setCsfError(null);
    try {
      const formData = new FormData();
      formData.append('csf', file);
      const clienteActualizado = await api.upload(`/clientes/${id}/csf`, formData);
      setCliente(clienteActualizado);
    } catch (err) {
      setCsfError(err.message);
    } finally {
      setSubiendoCsf(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="text-secondary">Cargando...</p>
      </Layout>
    );
  }

  if (error || !cliente) {
    return (
      <Layout>
        <p className="text-status-error">{error || 'Cliente no encontrado'}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center gap-2 text-secondary mb-2 font-label-md text-label-md">
        <button onClick={() => navigate('/clientes')} className="hover:text-action-blue">Clientes</button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-semibold">{cliente.nombre}</span>
      </div>

      <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <h3 className="font-display-sm text-display-sm text-text-main">{cliente.nombre}</h3>
          <button
            onClick={() => setShowEditModal(true)}
            className="self-start px-4 py-2 border border-border-subtle text-secondary rounded-lg font-semibold hover:bg-surface-base transition-all flex items-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Editar
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 pt-6 mt-6 border-t border-border-subtle">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-action-blue">mail</span>
            <div>
              <p className="font-label-md text-label-md text-text-muted">Email</p>
              <p className="font-body-md text-body-md text-text-main">{cliente.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-action-blue">call</span>
            <div>
              <p className="font-label-md text-label-md text-text-muted">Teléfono</p>
              <p className="font-body-md text-body-md text-text-main">{cliente.telefono || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 md:p-8 mt-6">
        <h3 className="font-title-lg text-title-lg text-text-main mb-6">Datos de facturación</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <p className="font-label-md text-label-md text-text-muted">Razón social</p>
            <p className="font-body-md text-body-md text-text-main">{cliente.razon_social || '—'}</p>
          </div>
          <div>
            <p className="font-label-md text-label-md text-text-muted">RFC</p>
            <p className="font-body-md text-body-md text-text-main font-mono-label">{cliente.rfc || '—'}</p>
          </div>
          <div>
            <p className="font-label-md text-label-md text-text-muted">Dirección fiscal</p>
            <p className="font-body-md text-body-md text-text-main whitespace-pre-line">{cliente.direccion_fiscal || '—'}</p>
          </div>
          <div>
            <p className="font-label-md text-label-md text-text-muted">Correo para envío de facturas</p>
            <p className="font-body-md text-body-md text-text-main">{cliente.direccion_envio_facturas || '—'}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border-subtle">
          <p className="font-label-md text-label-md text-text-muted mb-2">Constancia de Situación Fiscal (CSF)</p>
          {csfError && <p className="text-status-error text-sm mb-2">{csfError}</p>}
          <div className="flex items-center gap-3 flex-wrap">
            {cliente.csf_nombre_archivo && (
              <a
                href={`${BASE_URL}/clientes/${id}/csf`}
                className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-action-blue rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">description</span>
                {cliente.csf_nombre_original}
              </a>
            )}
            <button
              type="button"
              disabled={subiendoCsf}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-border-subtle text-secondary rounded-lg font-label-md text-label-md hover:bg-surface-base transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              {subiendoCsf ? 'Subiendo...' : cliente.csf_nombre_archivo ? 'Reemplazar CSF' : 'Subir CSF'}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleCsfChange} />
          </div>
        </div>
      </section>

      <section className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden mt-6">
        <div className="px-5 md:px-8 py-5 md:py-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-headline-md text-headline-md text-text-main">Contratos asociados</h3>
          <Link
            to={`/contratos/nuevo?cliente_id=${cliente.id}`}
            className="self-start sm:self-auto flex items-center gap-2 text-action-blue font-label-md text-label-md px-4 py-2 border border-action-blue rounded-lg hover:bg-surface-base transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nuevo contrato
          </Link>
        </div>

        {contratos.length === 0 && (
          <p className="px-5 md:px-8 py-6 text-secondary">Este cliente no tiene contratos.</p>
        )}

        {contratos.length > 0 && (
          <>
            {/* Tabla — desktop/tablet */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-base">
                    <th className="px-8 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Servicio</th>
                    <th className="px-8 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Monto</th>
                    <th className="px-8 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Periodicidad</th>
                    <th className="px-8 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Próximo vencimiento</th>
                    <th className="px-8 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {contratos.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-base transition-colors">
                      <td className="px-8 py-5">
                        <Link to={`/contratos/${c.id}`} className="font-title-lg text-title-lg text-action-blue hover:underline">
                          {nombreServicio(c.tipo_servicio_id)}
                        </Link>
                      </td>
                      <td className="px-8 py-5 font-title-lg text-title-lg text-text-main">${Number(c.monto).toFixed(2)}</td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-surface-container-high rounded text-body-sm font-medium text-primary capitalize">
                          {c.periodicidad}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-body-md text-text-main">
                        {new Date(c.fecha_proximo_vencimiento).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-8 py-5">
                        <StatusBadge status={c.estatus} label={c.estatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas — movil */}
            <div className="md:hidden divide-y divide-border-subtle">
              {contratos.map((c) => (
                <Link key={c.id} to={`/contratos/${c.id}`} className="block p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-semibold text-action-blue">{nombreServicio(c.tipo_servicio_id)}</span>
                    <StatusBadge status={c.estatus} label={c.estatus} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-main font-semibold">${Number(c.monto).toFixed(2)}</span>
                    <span className="text-secondary capitalize">{c.periodicidad}</span>
                    <span className="text-text-muted">{new Date(c.fecha_proximo_vencimiento).toLocaleDateString('es-MX')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden mt-6">
        <div className="px-5 md:px-8 py-5 md:py-6 border-b border-border-subtle">
          <h3 className="font-headline-md text-headline-md text-text-main">Historial de pagos</h3>
          <p className="text-secondary text-body-sm">Todos los pagos registrados de este cliente, en todos sus contratos.</p>
        </div>

        {pagos.length === 0 && <p className="px-5 md:px-8 py-6 text-secondary">Sin pagos registrados.</p>}

        {pagos.length > 0 && (
          <>
            {/* Tabla — desktop/tablet */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-base">
                    <th className="px-8 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Fecha</th>
                    <th className="px-8 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Servicio</th>
                    <th className="px-8 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider text-right">Monto</th>
                    <th className="px-8 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Método</th>
                    <th className="px-8 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Referencia</th>
                    <th className="px-8 py-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {pagos.map((p) => (
                    <tr key={`${p.pago_id}-${p.contrato_id}`} className="hover:bg-surface-base transition-colors">
                      <td className="px-8 py-4 text-text-main">{new Date(p.fecha).toLocaleDateString('es-MX')}</td>
                      <td className="px-8 py-4 text-text-main">
                        {p.tipo_servicio}
                        {p.otros_servicios?.length > 0 && (
                          <span className="block text-xs text-action-blue">
                            + {p.otros_servicios.map((o) => o.tipo_servicio).join(', ')}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-4 text-right font-bold text-text-main">{formatMoney(p.monto_aplicado)}</td>
                      <td className="px-8 py-4 capitalize">{p.metodo}</td>
                      <td className="px-8 py-4 font-mono-label text-secondary">{p.referencia || '—'}</td>
                      <td className="px-8 py-4">
                        {p.comprobante_nombre_original ? (
                          <a href={`${BASE_URL}/pagos/${p.pago_id}/comprobante`} className="text-action-blue hover:underline flex items-center gap-1">
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
                <div key={`${p.pago_id}-${p.contrato_id}`} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <p className="text-text-main font-medium truncate">
                        {p.tipo_servicio}
                        {p.otros_servicios?.length > 0 && (
                          <span className="block text-xs text-action-blue font-normal">
                            + {p.otros_servicios.map((o) => o.tipo_servicio).join(', ')}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-text-muted">{new Date(p.fecha).toLocaleDateString('es-MX')}</p>
                    </div>
                    <span className="font-bold text-text-main shrink-0">{formatMoney(p.monto_aplicado)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="capitalize text-secondary">{p.metodo}</span>
                    <span className="font-mono-label text-xs text-secondary">{p.referencia || '—'}</span>
                    {p.comprobante_nombre_original ? (
                      <a href={`${BASE_URL}/pagos/${p.pago_id}/comprobante`} className="text-action-blue flex items-center gap-1">
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
      </section>

      {showEditModal && (
        <ClienteFormModal
          cliente={cliente}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false);
            cargarDatos();
          }}
        />
      )}
    </Layout>
  );
}
