import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api/client';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [vencimientos, setVencimientos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  async function cargarDatos() {
    setLoading(true);
    try {
      const [clientesData, contratosData, vencimientosData] = await Promise.all([
        api.get('/clientes'),
        api.get('/contratos'),
        api.get('/vencimientos'),
      ]);
      setClientes(clientesData);
      setContratos(contratosData);
      setVencimientos(vencimientosData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const clientesConInfo = clientes
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
    );

  return (
    <Layout searchPlaceholder="Buscar clientes por nombre o email..." onSearch={setSearch}>
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
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider text-center">
                  Contratos activos
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading && (
                <tr>
                  <td className="px-6 py-6 text-secondary" colSpan={5}>Cargando...</td>
                </tr>
              )}
              {!loading && clientesConInfo.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-secondary" colSpan={5}>Sin clientes registrados.</td>
                </tr>
              )}
              {clientesConInfo.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-surface-base transition-colors group">
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
                  <td className="px-6 py-4 text-center font-mono-label">{cliente.contratosActivos}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      status={cliente.estatusGeneral}
                      label={cliente.estatusGeneral === 'con_adeudo' ? 'Con adeudo' : 'Al corriente'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <NuevoClienteModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            cargarDatos();
          }}
        />
      )}
    </Layout>
  );
}

function NuevoClienteModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/clientes', form);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-border-subtle flex justify-between items-center">
          <h3 className="font-headline-md text-headline-md text-on-surface">Nuevo cliente</h3>
          <button className="p-2 hover:bg-surface-base rounded-full transition-colors" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
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
          <div className="flex gap-4 pt-4 border-t border-border-subtle">
            <button type="button" className="flex-1 px-4 py-3 border border-border-subtle text-secondary rounded-lg font-semibold hover:bg-surface-base" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-action-blue text-white rounded-lg font-bold hover:bg-primary transition-all disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
