import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api/client';

export default function ClienteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.get(`/clientes/${id}`), api.get('/contratos'), api.get('/catalogo-servicios')])
      .then(([clienteData, contratosData, serviciosData]) => {
        setCliente(clienteData);
        setContratos(contratosData.filter((c) => c.cliente_id === Number(id)));
        setServicios(serviciosData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function nombreServicio(tipoServicioId) {
    return servicios.find((s) => s.id === tipoServicioId)?.nombre || '—';
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

      <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-8">
        <h3 className="font-display-sm text-display-sm text-text-main">{cliente.nombre}</h3>
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

      <section className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden mt-6">
        <div className="px-8 py-6 border-b border-border-subtle flex items-center justify-between">
          <h3 className="font-headline-md text-headline-md text-text-main">Contratos asociados</h3>
          <Link
            to={`/contratos/nuevo?cliente_id=${cliente.id}`}
            className="flex items-center gap-2 text-action-blue font-label-md text-label-md px-4 py-2 border border-action-blue rounded-lg hover:bg-surface-base transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nuevo contrato
          </Link>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
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
              {contratos.length === 0 && (
                <tr>
                  <td className="px-8 py-6 text-secondary" colSpan={5}>Este cliente no tiene contratos.</td>
                </tr>
              )}
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
      </section>
    </Layout>
  );
}
