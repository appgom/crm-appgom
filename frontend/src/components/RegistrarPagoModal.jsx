import { useEffect, useState } from 'react';
import { api } from '../api/client';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function RegistrarPagoModal({
  clienteId,
  clienteNombre,
  contratoId,
  cargoId,
  tipoServicio,
  montoSugerido,
  permitirParcial = true,
  onClose,
  onSaved,
}) {
  const [aplicaciones, setAplicaciones] = useState([
    {
      contrato_id: contratoId,
      cargo_id: cargoId || null,
      tipo_servicio: tipoServicio,
      monto: montoSugerido ?? '',
      saldo_pendiente: montoSugerido ?? null,
      permitir_parcial: permitirParcial,
    },
  ]);
  const [pendientes, setPendientes] = useState([]);
  const [cargoParaAgregar, setCargoParaAgregar] = useState('');
  const [comprobante, setComprobante] = useState(null);
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    metodo: 'transferencia',
    referencia: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clienteId) return;
    api.get(`/clientes/${clienteId}/cargos-pendientes`).then(setPendientes).catch(() => {});
  }, [clienteId]);

  const idsYaAgregados = new Set(aplicaciones.map((a) => a.cargo_id));
  const opcionesDisponibles = pendientes.filter((c) => !idsYaAgregados.has(c.cargo_id));
  const totalPago = aplicaciones.reduce((sum, a) => sum + (Number(a.monto) || 0), 0);

  function agregarAplicacion() {
    const cargo = pendientes.find((c) => c.cargo_id === Number(cargoParaAgregar));
    if (!cargo) return;
    const saldoPendiente = Math.max(Number(cargo.monto) - Number(cargo.total_pagado), 0);
    setAplicaciones((prev) => [
      ...prev,
      {
        contrato_id: cargo.contrato_id,
        cargo_id: cargo.cargo_id,
        tipo_servicio: cargo.tipo_servicio,
        monto: saldoPendiente,
        saldo_pendiente: saldoPendiente,
        permitir_parcial: cargo.modalidad_facturacion === 'proyecto_unico',
      },
    ]);
    setCargoParaAgregar('');
  }

  function quitarAplicacion(index) {
    setAplicaciones((prev) => prev.filter((_, i) => i !== index));
  }

  function actualizarMonto(index, monto) {
    setAplicaciones((prev) => prev.map((a, i) => (i === index ? { ...a, monto } : a)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('fecha', form.fecha);
      formData.append('metodo', form.metodo);
      formData.append('referencia', form.referencia);
      formData.append(
        'aplicaciones',
        JSON.stringify(aplicaciones.map((a) => ({ contrato_id: a.contrato_id, cargo_id: a.cargo_id, monto: Number(a.monto) })))
      );
      if (comprobante) formData.append('comprobante', comprobante);

      await api.upload('/pagos', formData);
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
            {clienteNombre && <p className="text-secondary font-label-md text-label-md">{clienteNombre}</p>}
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
            <p className="text-xs text-text-muted">Un solo comprobante, aunque el pago cubra varios servicios.</p>
          </div>

          <div className="pt-4 border-t border-border-subtle space-y-3">
            <p className="font-label-md text-label-md text-secondary uppercase tracking-wider">Aplicar a</p>
            {aplicaciones.map((a, i) => {
              const bloqueada = !a.permitir_parcial;
              const montoIngresado = Number(a.monto) || 0;
              const tieneSaldoRef = a.saldo_pendiente != null;
              const esAnticipo = tieneSaldoRef && !bloqueada && montoIngresado > 0 && montoIngresado < Number(a.saldo_pendiente);
              const esLiquidacion = tieneSaldoRef && !bloqueada && montoIngresado > 0 && montoIngresado >= Number(a.saldo_pendiente);
              return (
                <div key={a.cargo_id ?? i}>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 min-w-0 truncate text-sm text-text-main">{a.tipo_servicio}</span>
                    <div className="relative w-24 sm:w-32 shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-sm">$</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        disabled={bloqueada}
                        className="w-full bg-surface-base border border-border-subtle rounded-lg pl-6 pr-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-action-blue disabled:opacity-60"
                        value={bloqueada ? (a.saldo_pendiente ?? a.monto) : a.monto}
                        onChange={(e) => actualizarMonto(i, e.target.value)}
                      />
                    </div>
                    {aplicaciones.length > 1 && (
                      <button type="button" className="p-1 text-secondary hover:text-status-error shrink-0" onClick={() => quitarAplicacion(i)}>
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    )}
                  </div>
                  {bloqueada && (
                    <p className="text-xs text-text-muted mt-1">Este servicio se cobra en una sola exhibición, sin anticipos.</p>
                  )}
                  {esAnticipo && (
                    <p className="text-xs text-status-warning mt-1">
                      Anticipo — quedará pendiente {formatMoney(Number(a.saldo_pendiente) - montoIngresado)}
                    </p>
                  )}
                  {esLiquidacion && (
                    <p className="text-xs text-status-success mt-1">Liquida el saldo pendiente por completo</p>
                  )}
                </div>
              );
            })}

            {opcionesDisponibles.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                <select
                  className="flex-1 min-w-0 bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-action-blue"
                  value={cargoParaAgregar}
                  onChange={(e) => setCargoParaAgregar(e.target.value)}
                >
                  <option value="">+ Aplicar también a otro servicio de este cliente...</option>
                  {opcionesDisponibles.map((c) => (
                    <option key={c.cargo_id} value={c.cargo_id}>
                      {c.tipo_servicio} — saldo {formatMoney(Math.max(Number(c.monto) - Number(c.total_pagado), 0))}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!cargoParaAgregar}
                  onClick={agregarAplicacion}
                  className="px-3 py-2 border border-border-subtle rounded-lg text-sm font-semibold text-action-blue hover:bg-surface-base disabled:opacity-40 shrink-0"
                >
                  Agregar
                </button>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
              <span className="text-sm font-semibold text-text-main">Total del pago</span>
              <span className="text-sm font-bold text-action-blue">{formatMoney(totalPago)}</span>
            </div>
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
