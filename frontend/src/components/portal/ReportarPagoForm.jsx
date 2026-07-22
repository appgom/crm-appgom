import { useState } from 'react';
import { portalApi } from '../../api/portalClient';

export default function ReportarPagoForm({ contratoId, montoSugerido, onCancel, onReportado }) {
  const [form, setForm] = useState({
    monto: montoSugerido ?? '',
    fecha: new Date().toISOString().slice(0, 10),
    referencia: '',
  });
  const [comprobante, setComprobante] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!comprobante) {
      setError('Adjunta el comprobante de tu pago.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('contrato_id', contratoId);
      formData.append('monto', form.monto);
      formData.append('fecha', form.fecha);
      formData.append('referencia', form.referencia);
      formData.append('comprobante', comprobante);
      await portalApi.upload('/portal/reportes-pago', formData);
      onReportado();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <p className="text-status-error text-sm">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-secondary block">Monto pagado</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">$</span>
            <input
              type="number"
              step="0.01"
              required
              className="w-full bg-surface-base border border-border-subtle rounded-lg pl-7 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-action-blue"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-secondary block">Fecha de pago</label>
          <input
            type="date"
            required
            className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-action-blue"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm text-secondary block">Referencia (opcional)</label>
        <input
          className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-action-blue"
          value={form.referencia}
          onChange={(e) => setForm({ ...form, referencia: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-secondary block">Comprobante (PDF, PNG o JPG)</label>
        <input
          type="file"
          required
          accept=".pdf,.png,.jpg,.jpeg"
          className="w-full text-sm"
          onChange={(e) => setComprobante(e.target.files[0] || null)}
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-border-subtle text-secondary rounded-lg font-semibold hover:bg-surface-base"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2.5 bg-action-blue text-white rounded-lg font-bold hover:bg-primary transition-all disabled:opacity-50"
        >
          {saving ? 'Enviando...' : 'Enviar reporte'}
        </button>
      </div>
    </form>
  );
}
