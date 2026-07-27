import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function PlantillasSection() {
  const [plantillas, setPlantillas] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [abierto, setAbierto] = useState(null);

  function cargar() {
    setLoading(true);
    api
      .get('/plantillas')
      .then((data) => {
        setPlantillas(data.plantillas);
        setMetadata(data.metadata);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  const tipos = Object.keys(metadata);

  return (
    <section className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden max-w-3xl">
      <div className="px-6 py-5 border-b border-border-subtle">
        <h3 className="font-title-lg text-title-lg">Plantillas de correo y WhatsApp</h3>
        <p className="text-secondary text-body-sm">
          Personaliza el texto que se envía a los clientes en cada situación. WhatsApp queda listo para cuando se
          conecte esa integración.
        </p>
      </div>

      {error && <p className="text-status-error px-6 pt-4 text-sm">{error}</p>}
      {loading && <p className="p-6 text-secondary">Cargando...</p>}

      <div className="divide-y divide-border-subtle">
        {!loading &&
          tipos.map((tipo) => {
            const meta = metadata[tipo];
            const emailRow = plantillas.find((p) => p.tipo === tipo && p.canal === 'email');
            const whatsappRow = plantillas.find((p) => p.tipo === tipo && p.canal === 'whatsapp');
            const expandido = abierto === tipo;
            return (
              <div key={tipo}>
                <button
                  onClick={() => setAbierto(expandido ? null : tipo)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 hover:bg-surface-base transition-colors text-left"
                >
                  <div>
                    <p className="font-semibold text-on-surface">{meta.etiqueta}</p>
                    <p className="text-secondary text-xs">{meta.descripcion}</p>
                  </div>
                  <span className="material-symbols-outlined text-secondary shrink-0">
                    {expandido ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {expandido && (
                  <div className="px-6 pb-6 space-y-6">
                    <PlantillaForm
                      tipo={tipo}
                      canal="email"
                      etiquetaCanal="Correo"
                      plantilla={emailRow}
                      variables={meta.variables}
                      onGuardado={cargar}
                    />
                    <PlantillaForm
                      tipo={tipo}
                      canal="whatsapp"
                      etiquetaCanal="WhatsApp"
                      plantilla={whatsappRow}
                      variables={meta.variables}
                      onGuardado={cargar}
                    />
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </section>
  );
}

function PlantillaForm({ tipo, canal, etiquetaCanal, plantilla, variables, onGuardado }) {
  const [asunto, setAsunto] = useState(plantilla?.asunto || '');
  const [cuerpo, setCuerpo] = useState(plantilla?.cuerpo || '');
  const [activo, setActivo] = useState(plantilla?.activo ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [guardado, setGuardado] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setGuardado(false);
    try {
      await api.put(`/plantillas/${tipo}/${canal}`, { asunto, cuerpo, activo });
      setGuardado(true);
      onGuardado();
      setTimeout(() => setGuardado(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-base border border-border-subtle rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">
            {canal === 'email' ? 'mail' : 'chat'}
          </span>
          {etiquetaCanal}
        </span>
        <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer">
          <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          Activa
        </label>
      </div>

      {error && <p className="text-status-error text-xs">{error}</p>}

      {canal === 'email' && (
        <div className="space-y-1">
          <label className="text-xs text-secondary block">Asunto</label>
          <input
            className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-action-blue"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs text-secondary block">Mensaje</label>
        <textarea
          rows={canal === 'email' ? 5 : 3}
          required
          className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-action-blue font-mono-label"
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
        />
      </div>

      <p className="text-xs text-text-muted">
        Variables disponibles:{' '}
        {variables.map((v) => (
          <code key={v} className="bg-surface-container-low px-1.5 py-0.5 rounded mr-1 font-mono-label">
            {`{{${v}}}`}
          </code>
        ))}
      </p>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-1.5 bg-action-blue text-white rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        {guardado && <span className="text-status-success text-xs font-semibold">Guardado</span>}
      </div>
    </form>
  );
}
