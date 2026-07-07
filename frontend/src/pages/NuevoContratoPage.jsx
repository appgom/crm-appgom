import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../api/client';

export default function NuevoContratoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientePreseleccionado = searchParams.get('cliente_id') || '';

  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState({
    cliente_id: clientePreseleccionado,
    tipo_servicio_id: '',
    numero_contrato: '',
    descripcion: '',
    monto: '',
    periodicidad: 'mensual',
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_proximo_vencimiento: new Date().toISOString().slice(0, 10),
    modalidad_facturacion: 'recurrente',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/clientes'), api.get('/catalogo-servicios')]).then(([clientesData, serviciosData]) => {
      setClientes(clientesData);
      setServicios(serviciosData.filter((s) => s.activo));
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const contrato = await api.post('/contratos', {
        ...form,
        cliente_id: Number(form.cliente_id),
        tipo_servicio_id: Number(form.tipo_servicio_id),
        monto: Number(form.monto),
      });
      navigate(`/contratos/${contrato.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="w-full max-w-[800px] mx-auto bg-surface-container-lowest rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-border-subtle">
          <h2 className="font-headline-md text-headline-md text-on-surface">Nuevo contrato</h2>
          <p className="font-body-md text-body-md text-secondary">
            Da de alta un contrato de servicio para un cliente existente.
          </p>
        </div>
        <form className="p-8 space-y-8" onSubmit={handleSubmit}>
          {error && <p className="text-status-error text-sm">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block font-label-md text-label-md text-secondary mb-2">Cliente</label>
              <select
                required
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
                value={form.cliente_id}
                onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
              >
                <option value="" disabled>Selecciona un cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block font-label-md text-label-md text-secondary mb-2">Tipo de servicio</label>
              <select
                required
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
                value={form.tipo_servicio_id}
                onChange={(e) => setForm({ ...form, tipo_servicio_id: e.target.value })}
              >
                <option value="" disabled>Selecciona un servicio</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block font-label-md text-label-md text-secondary mb-2">Descripción (opcional)</label>
              <input
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-secondary mb-2">Número de contrato (opcional)</label>
              <input
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
                value={form.numero_contrato}
                onChange={(e) => setForm({ ...form, numero_contrato: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-secondary mb-2">Monto por periodo</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full border border-border-subtle rounded-lg pl-8 pr-4 py-3 text-body-md bg-surface-base"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-secondary mb-2">Periodicidad</label>
              <select
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
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
            <div>
              <label className="block font-label-md text-label-md text-secondary mb-2">Modalidad de facturación</label>
              <select
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
                value={form.modalidad_facturacion}
                onChange={(e) => setForm({ ...form, modalidad_facturacion: e.target.value })}
              >
                <option value="recurrente">Recurrente</option>
                <option value="bolsa_horas">Bolsa de horas</option>
                <option value="por_ticket">Por ticket</option>
              </select>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-secondary mb-2">Fecha de inicio</label>
              <input
                type="date"
                required
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
                value={form.fecha_inicio}
                onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-secondary mb-2">Primer vencimiento</label>
              <input
                type="date"
                required
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
                value={form.fecha_proximo_vencimiento}
                onChange={(e) => setForm({ ...form, fecha_proximo_vencimiento: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border-subtle">
            <button type="button" className="px-6 py-2.5 rounded-lg border border-border-subtle text-secondary font-bold hover:bg-surface-base" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-8 py-2.5 rounded-lg bg-action-blue text-white font-bold hover:bg-primary transition-all disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar contrato'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
