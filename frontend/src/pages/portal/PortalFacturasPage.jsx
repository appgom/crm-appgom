import { useEffect, useState } from 'react';
import PortalLayout from '../../components/PortalLayout';
import { portalApi, BASE_URL } from '../../api/portalClient';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function PortalFacturasPage() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    portalApi
      .get('/portal/facturas')
      .then(setFacturas)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout>
      <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Mis facturas</h2>
      <p className="text-secondary font-body-sm mb-6">Facturas de todos tus contratos, disponibles para descarga.</p>

      {error && <p className="text-status-error mb-4">{error}</p>}
      {loading && <p className="text-secondary">Cargando...</p>}

      {!loading && facturas.length === 0 && <p className="text-secondary">Aún no hay facturas disponibles.</p>}

      {facturas.length > 0 && (
        <div className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden">
          <div className="divide-y divide-border-subtle">
            {facturas.map((f) => (
              <div key={f.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{f.tipo_servicio}</p>
                  <p className="text-xs text-text-muted">
                    {f.numero_contrato}
                    {f.fecha_emision ? ` · ${new Date(f.fecha_emision).toLocaleDateString('es-MX', { timeZone: 'UTC' })}` : ''}
                    {f.monto != null ? ` · ${formatMoney(f.monto)}` : ''}
                  </p>
                </div>
                <a
                  href={`${BASE_URL}/portal/facturas/${f.id}/descarga`}
                  className="shrink-0 text-action-blue hover:underline flex items-center gap-1 text-sm font-semibold"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Descargar
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
