import { useState } from 'react';
import { api } from '../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function RegistrarPagoProveedorModal({
  proveedorId,
  proveedorNombre,
  cargoId,
  montoSugerido,
  onClose,
  onSaved,
}) {
  const [monto, setMonto] = useState(montoSugerido ?? '');
  const [comprobante, setComprobante] = useState(null);
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
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
      const formData = new FormData();
      formData.append('cargo_proveedor_id', cargoId);
      formData.append('fecha', form.fecha);
      formData.append('metodo', form.metodo);
      formData.append('referencia', form.referencia);
      formData.append('monto', Number(monto));
      if (comprobante) formData.append('comprobante', comprobante);

      await api.upload(`/proveedores/${proveedorId}/pagos`, formData);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="px-5 md:px-8 py-5 md:py-6 border-b border-border-subtle flex justify-between items-center">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Registrar pago</h3>
            {proveedorNombre && <p className="text-secondary font-label-md text-label-md">{proveedorNombre}</p>}
          </div>
          <button className="p-2 hover:bg-surface-base rounded-full transition-colors" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form className="p-5 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto" onSubmit={handleSubmit}>
          {error && <p className="text-status-error text-sm">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="font-label-md text-label-md text-secondary block">Método de pago</label>
              <select
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-action-blue"
                value={form.metodo}
                onChange={(e) => setForm({ ...form, metodo: e.target.value })}
              >
                <option value="transferencia">Transferencia</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Monto</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">$</span>
              <input
                type="number"
                step="0.01"
                required
                className="w-full bg-surface-base border border-border-subtle rounded-lg pl-6 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-action-blue"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
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

          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Comprobante (opcional)</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="w-full text-sm"
              onChange={(e) => setComprobante(e.target.files[0] || null)}
            />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
            <span className="text-sm font-semibold text-text-main">Total del pago</span>
            <span className="text-sm font-bold text-action-blue">{formatMoney(Number(monto) || 0)}</span>
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
