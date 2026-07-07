import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../api/client';

export default function ConfiguracionPage() {
  const [servicios, setServicios] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function cargar() {
    api.get('/catalogo-servicios').then(setServicios).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function agregarServicio(e) {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    try {
      await api.post('/catalogo-servicios', { nombre: nuevoNombre.trim() });
      setNuevoNombre('');
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActivo(servicio) {
    try {
      await api.put(`/catalogo-servicios/${servicio.id}`, { nombre: servicio.nombre, activo: !servicio.activo });
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Configuración</h2>

      <section className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden max-w-2xl">
        <div className="px-6 py-5 border-b border-border-subtle">
          <h3 className="font-title-lg text-title-lg">Catálogo de servicios</h3>
          <p className="text-secondary text-body-sm">Los tipos de servicio disponibles al crear un contrato.</p>
        </div>

        {error && <p className="text-status-error px-6 pt-4 text-sm">{error}</p>}

        <form className="p-6 flex gap-3 border-b border-border-subtle" onSubmit={agregarServicio}>
          <input
            className="flex-1 bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
            placeholder="Nombre del nuevo servicio"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
          />
          <button type="submit" className="bg-action-blue text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary transition-all">
            Agregar
          </button>
        </form>

        <div className="divide-y divide-border-subtle">
          {loading && <p className="p-6 text-secondary">Cargando...</p>}
          {!loading && servicios.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-6 py-3">
              <span className={s.activo ? 'text-on-surface' : 'text-secondary line-through'}>{s.nombre}</span>
              <button
                onClick={() => toggleActivo(s)}
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  s.activo ? 'bg-emerald-100 text-status-success' : 'bg-surface-container text-secondary'
                }`}
              >
                {s.activo ? 'Activo' : 'Inactivo'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
