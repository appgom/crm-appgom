import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/PortalLayout';
import { portalApi } from '../../api/portalClient';
import { etiquetaModalidad } from '../../utils/modalidad';
import { PORTAL_BASE } from '../../utils/portalBase';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function PortalDashboardPage() {
  const [contratos, setContratos] = useState([]);
  const [saldos, setSaldos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    portalApi
      .get('/portal/contratos')
      .then(async (data) => {
        setContratos(data);
        const entradas = await Promise.all(
          data.map(async (c) => {
            const saldo = await portalApi.get(`/portal/contratos/${c.id}/saldo`).catch(() => null);
            return [c.id, saldo];
          })
        );
        setSaldos(Object.fromEntries(entradas));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout>
      <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Mis contratos</h2>
      <p className="text-secondary font-body-sm mb-6">Consulta el estado y saldo de cada uno de tus servicios.</p>

      {error && <p className="text-status-error mb-4">{error}</p>}
      {loading && <p className="text-secondary">Cargando...</p>}

      {!loading && contratos.length === 0 && (
        <p className="text-secondary">Aún no tienes contratos activos.</p>
      )}

      <div className="space-y-4">
        {contratos.map((c) => {
          const saldo = saldos[c.id];
          return (
            <Link
              key={c.id}
              to={`${PORTAL_BASE}/contratos/${c.id}`}
              className="block bg-surface-card border border-border-subtle rounded-xl p-5 hover:border-action-blue transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-on-surface">{c.tipo_servicio}</p>
                  <p className="text-sm text-secondary">
                    {c.numero_contrato} · {etiquetaModalidad(c.modalidad_facturacion)}
                  </p>
                </div>
                {saldo && (
                  <div className="text-right shrink-0">
                    {saldo.al_corriente ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-success/15 text-status-success">
                        Al corriente
                      </span>
                    ) : (
                      <>
                        <p className="font-bold text-on-surface">{formatMoney(saldo.saldo_pendiente)}</p>
                        {saldo.dias_atraso > 0 && (
                          <p className="text-xs text-status-error">{saldo.dias_atraso}d de atraso</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </PortalLayout>
  );
}
