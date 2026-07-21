import { useEffect, useState } from 'react';
import PortalLayout from '../../components/PortalLayout';
import { portalApi } from '../../api/portalClient';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function PortalPagosPage() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    portalApi
      .get('/portal/pagos')
      .then(setPagos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout>
      <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Mis pagos</h2>
      <p className="text-secondary font-body-sm mb-6">Historial de pagos confirmados en todos tus contratos.</p>

      {error && <p className="text-status-error mb-4">{error}</p>}
      {loading && <p className="text-secondary">Cargando...</p>}

      {!loading && pagos.length === 0 && <p className="text-secondary">Aún no tienes pagos confirmados.</p>}

      {pagos.length > 0 && (
        <div className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden">
          <div className="divide-y divide-border-subtle">
            {pagos.map((p) => (
              <div key={p.pago_id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{p.tipo_servicio}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(p.fecha).toLocaleDateString('es-MX')} · {p.metodo}
                    {p.referencia ? ` · Ref. ${p.referencia}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-on-surface">{formatMoney(p.monto_aplicado)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
