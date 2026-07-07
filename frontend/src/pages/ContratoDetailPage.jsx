import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function ContratoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [servicio, setServicio] = useState(null);
  const [saldo, setSaldo] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  async function cargarDatos() {
    setLoading(true);
    try {
      const contratoData = await api.get(`/contratos/${id}`);
      const [clienteData, serviciosData, saldoData, pagosData] = await Promise.all([
        api.get(`/clientes/${contratoData.cliente_id}`),
        api.get('/catalogo-servicios'),
        api.get(`/contratos/${id}/saldo`),
        api.get(`/contratos/${id}/pagos`),
      ]);
      setContrato(contratoData);
      setCliente(clienteData);
      setServicio(serviciosData.find((s) => s.id === contratoData.tipo_servicio_id));
      setSaldo(saldoData);
      setPagos(pagosData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <p className="text-secondary">Cargando...</p>
      </Layout>
    );
  }

  if (error || !contrato) {
    return (
      <Layout>
        <p className="text-status-error">{error || 'Contrato no encontrado'}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center gap-2 text-secondary mb-6 font-label-md text-label-md">
        <button onClick={() => navigate('/contratos')} className="hover:text-action-blue">Contratos</button>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-semibold">{servicio?.nombre}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-1">{servicio?.nombre}</h2>
          <p className="text-secondary font-body-md flex items-center gap-2">
            Cliente: <span className="font-semibold text-text-main">{cliente?.nombre}</span>
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-action-blue text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add_card</span>
          Registrar pago
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        <div className="md:col-span-8 bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
          <h3 className="font-title-lg text-title-lg mb-6 text-on-surface">Información principal</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
            <Field label="Monto por periodo" value={formatMoney(contrato.monto)} />
            <Field label="Periodicidad" value={contrato.periodicidad} className="capitalize" />
            <Field label="Modalidad" value={contrato.modalidad_facturacion} className="capitalize" />
            <Field label="Fecha inicio" value={new Date(contrato.fecha_inicio).toLocaleDateString('es-MX')} />
            <Field label="Próximo vencimiento" value={new Date(contrato.fecha_proximo_vencimiento).toLocaleDateString('es-MX')} />
            <div>
              <p className="text-text-muted font-label-md text-label-md mb-1 uppercase tracking-wider">Estatus</p>
              <StatusBadge status={contrato.estatus} label={contrato.estatus} />
            </div>
          </div>
        </div>

        <div className="md:col-span-4 bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
          <h3 className="font-title-lg text-title-lg mb-4 text-on-surface">Saldo actual</h3>
          {saldo?.al_corriente ? (
            <p className="text-status-success font-semibold">Al corriente, sin saldo pendiente.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                <span className="text-secondary text-body-md">Saldo pendiente</span>
                <span className="text-status-warning font-bold">{formatMoney(saldo.saldo_pendiente)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary text-body-md">Días de atraso</span>
                <span className={`font-bold ${saldo.dias_atraso > 0 ? 'text-status-error' : 'text-text-main'}`}>
                  {saldo.dias_atraso}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle">
          <h3 className="font-title-lg text-title-lg text-on-surface">Historial de pagos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-base/50">
              <tr>
                <th className="px-6 py-3 font-label-md text-label-md text-secondary uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 font-label-md text-label-md text-secondary uppercase tracking-wider text-right">Monto</th>
                <th className="px-6 py-3 font-label-md text-label-md text-secondary uppercase tracking-wider">Método</th>
                <th className="px-6 py-3 font-label-md text-label-md text-secondary uppercase tracking-wider">Referencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {pagos.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-secondary" colSpan={4}>Sin pagos registrados.</td>
                </tr>
              )}
              {pagos.map((p) => (
                <tr key={p.id} className="hover:bg-surface-base transition-colors">
                  <td className="px-6 py-4 text-on-surface">{new Date(p.fecha).toLocaleDateString('es-MX')}</td>
                  <td className="px-6 py-4 font-bold text-on-surface text-right">{formatMoney(p.monto)}</td>
                  <td className="px-6 py-4 capitalize">{p.metodo}</td>
                  <td className="px-6 py-4 font-mono-label text-secondary">{p.referencia || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <RegistrarPagoModal
          contrato={contrato}
          cargoId={saldo?.cargo_pendiente?.id}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            cargarDatos();
          }}
        />
      )}
    </Layout>
  );
}

function Field({ label, value, className = '' }) {
  return (
    <div>
      <p className="text-text-muted font-label-md text-label-md mb-1 uppercase tracking-wider">{label}</p>
      <p className={`font-body-md text-body-md font-bold text-on-surface ${className}`}>{value}</p>
    </div>
  );
}

function RegistrarPagoModal({ contrato, cargoId, onClose, onSaved }) {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    monto: contrato.monto,
    metodo: 'transferencia',
    referencia: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/pagos', {
        contrato_id: contrato.id,
        cargo_id: cargoId || null,
        ...form,
        monto: Number(form.monto),
      });
      onSaved();
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
          <h3 className="font-headline-md text-headline-md text-on-surface">Registrar pago</h3>
          <button className="p-2 hover:bg-surface-base rounded-full transition-colors" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-status-error text-sm">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-secondary block">Fecha</label>
              <input
                type="date"
                required
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-action-blue"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-md text-label-md text-secondary block">Monto</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-action-blue"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Método de pago</label>
            <div className="grid grid-cols-3 gap-3">
              {['transferencia', 'efectivo', 'tarjeta'].map((metodo) => (
                <label
                  key={metodo}
                  className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-2 transition-colors ${
                    form.metodo === metodo ? 'bg-surface-container-low border-action-blue text-action-blue' : 'border-border-subtle hover:bg-surface-base'
                  }`}
                >
                  <input
                    type="radio"
                    name="metodo"
                    className="hidden"
                    checked={form.metodo === metodo}
                    onChange={() => setForm({ ...form, metodo })}
                  />
                  <span className="font-label-md text-[11px] font-semibold capitalize">{metodo}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Referencia</label>
            <input
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 font-mono-label outline-none focus:ring-2 focus:ring-action-blue"
              placeholder="Ej: TXN-00123-X"
              value={form.referencia}
              onChange={(e) => setForm({ ...form, referencia: e.target.value })}
            />
          </div>
          <div className="flex gap-4 pt-4 border-t border-border-subtle">
            <button type="button" className="flex-1 px-4 py-3 border border-border-subtle text-secondary rounded-lg font-semibold hover:bg-surface-base" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-action-blue text-white rounded-lg font-bold hover:scale-[1.02] transition-all disabled:opacity-50">
              {saving ? 'Guardando...' : 'Confirmar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
