import { useState } from 'react';
import { api } from '../api/client';

export default function RegistrarPagoModal({ contratoId, cargoId, montoSugerido, contexto, onClose, onSaved }) {
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    monto: montoSugerido ?? '',
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
        contrato_id: contratoId,
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
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Registrar pago</h3>
            {contexto && <p className="text-secondary font-label-md text-label-md">{contexto}</p>}
          </div>
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
