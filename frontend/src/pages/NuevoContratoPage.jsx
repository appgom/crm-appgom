import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ClienteBuscador from '../components/ClienteBuscador';
import { api } from '../api/client';

export default function NuevoContratoPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const [searchParams] = useSearchParams();
  const clientePreseleccionado = searchParams.get('cliente_id') || '';

  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState({
    cliente_id: clientePreseleccionado,
    tipo_servicio_id: '',
    numero_contrato: '',
    descripcion: '',
    notas_internas: '',
    monto: '',
    periodicidad: 'mensual',
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_proximo_vencimiento: new Date().toISOString().slice(0, 10),
    fecha_limite_pago: '',
    modalidad_facturacion: 'recurrente',
    estatus: 'activo',
  });
  const [loading, setLoading] = useState(esEdicion);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const promesas = [api.get('/clientes'), api.get('/catalogo-servicios')];
    if (esEdicion) promesas.push(api.get(`/contratos/${id}`));

    Promise.all(promesas)
      .then(([clientesData, serviciosData, contratoData]) => {
        setClientes(clientesData);
        setServicios(serviciosData.filter((s) => s.activo));
        if (contratoData) {
          setForm({
            cliente_id: contratoData.cliente_id,
            tipo_servicio_id: contratoData.tipo_servicio_id,
            numero_contrato: contratoData.numero_contrato || '',
            descripcion: contratoData.descripcion || '',
            notas_internas: contratoData.notas_internas || '',
            monto: contratoData.monto,
            periodicidad: contratoData.periodicidad,
            fecha_inicio: contratoData.fecha_inicio.slice(0, 10),
            fecha_proximo_vencimiento: contratoData.fecha_proximo_vencimiento.slice(0, 10),
            fecha_limite_pago: contratoData.fecha_limite_pago ? contratoData.fecha_limite_pago.slice(0, 10) : '',
            modalidad_facturacion: contratoData.modalidad_facturacion,
            estatus: contratoData.estatus,
          });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.cliente_id) {
      setError('Selecciona un cliente válido de la lista de resultados.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        cliente_id: Number(form.cliente_id),
        tipo_servicio_id: Number(form.tipo_servicio_id),
        monto: Number(form.monto),
      };
      const contrato = esEdicion
        ? await api.put(`/contratos/${id}`, payload)
        : await api.post('/contratos', payload);
      navigate(`/contratos/${contrato.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <p className="text-secondary">Cargando...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-[800px] mx-auto bg-surface-container-lowest rounded-xl border border-border-subtle shadow-sm overflow-hidden">
        <div className="px-5 md:px-8 py-5 md:py-6 border-b border-border-subtle">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            {esEdicion ? 'Editar contrato' : 'Nuevo contrato'}
          </h2>
          <p className="font-body-md text-body-md text-secondary">
            {esEdicion
              ? 'Actualiza los datos del contrato.'
              : 'Da de alta un contrato de servicio para un cliente existente.'}
          </p>
        </div>
        <form className="p-5 md:p-8 space-y-6 md:space-y-8" onSubmit={handleSubmit}>
          {error && <p className="text-status-error text-sm">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-label-md text-label-md text-secondary mb-2">Cliente</label>
              <ClienteBuscador
                clientes={clientes}
                value={form.cliente_id}
                onChange={(cliente_id) => setForm({ ...form, cliente_id })}
                disabled={esEdicion}
              />
            </div>
            <div>
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
            <div className="md:col-span-2">
              <label className="block font-label-md text-label-md text-secondary mb-2">Descripción (opcional)</label>
              <input
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-label-md text-label-md text-secondary mb-2">Notas internas (opcional)</label>
              <textarea
                rows={3}
                placeholder="Notas visibles solo para el equipo, no se muestran al cliente."
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
                value={form.notas_internas}
                onChange={(e) => setForm({ ...form, notas_internas: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-secondary mb-2">Número de contrato</label>
              <input
                disabled
                placeholder={esEdicion ? '' : 'Se asignará automáticamente al guardar'}
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base opacity-60 font-mono-label"
                value={form.numero_contrato}
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-secondary mb-2">
                {form.modalidad_facturacion === 'recurrente' ? 'Monto por periodo' : 'Monto total'}
              </label>
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
              <label className="block font-label-md text-label-md text-secondary mb-2">Modalidad de facturación</label>
              <select
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
                value={form.modalidad_facturacion}
                onChange={(e) => setForm({ ...form, modalidad_facturacion: e.target.value })}
              >
                <option value="recurrente">Recurrente</option>
                <option value="bolsa_horas">Bolsa de horas</option>
                <option value="por_ticket">Por ticket</option>
                <option value="proyecto_unico">Proyecto único</option>
              </select>
            </div>
            {form.modalidad_facturacion === 'recurrente' && (
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
            )}
            <div>
              <label className="block font-label-md text-label-md text-secondary mb-2">Fecha de inicio</label>
              <input
                type="date"
                required
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
                value={form.fecha_inicio}
                onChange={(e) => {
                  const fecha_inicio = e.target.value;
                  const esPagoUnico = form.modalidad_facturacion !== 'recurrente';
                  setForm((prev) => ({
                    ...prev,
                    fecha_inicio,
                    fecha_proximo_vencimiento: !esEdicion && esPagoUnico ? fecha_inicio : prev.fecha_proximo_vencimiento,
                  }));
                }}
              />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-secondary mb-2">
                {form.modalidad_facturacion === 'recurrente'
                  ? esEdicion ? 'Próximo vencimiento' : 'Primer vencimiento'
                  : 'Fecha de vencimiento del pago'}
              </label>
              <input
                type="date"
                required
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
                value={form.fecha_proximo_vencimiento}
                onChange={(e) => setForm({ ...form, fecha_proximo_vencimiento: e.target.value })}
              />
              {esEdicion && (
                <p className="text-xs text-text-muted mt-1">
                  Normalmente avanza solo al liquidar un cargo. Ajústalo aquí solo si necesitas corregirlo manualmente.
                </p>
              )}
            </div>
            <div>
              <label className="block font-label-md text-label-md text-secondary mb-2">
                Fecha límite de pago (opcional)
              </label>
              <input
                type="date"
                className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
                value={form.fecha_limite_pago}
                onChange={(e) => setForm({ ...form, fecha_limite_pago: e.target.value })}
              />
              <p className="text-xs text-text-muted mt-1">
                Fecha tope para pagar antes de un recargo o corte, si es distinta a la fecha de vencimiento del contrato.
              </p>
            </div>
            {esEdicion && (
              <div>
                <label className="block font-label-md text-label-md text-secondary mb-2">Estatus</label>
                <select
                  className="w-full border border-border-subtle rounded-lg px-4 py-3 text-body-md bg-surface-base"
                  value={form.estatus}
                  onChange={(e) => setForm({ ...form, estatus: e.target.value })}
                >
                  <option value="activo">Activo</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-4 border-t border-border-subtle">
            <button type="button" className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-border-subtle text-secondary font-bold hover:bg-surface-base" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-action-blue text-white font-bold hover:bg-primary transition-all disabled:opacity-50">
              {saving ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Guardar contrato'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
