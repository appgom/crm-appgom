import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { portalApi } from '../../api/portalClient';

export default function PortalLoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cliente = await portalApi.post('/portal/auth/login', form);
      onLogin(cliente);
      navigate('/portal', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <img src="/logo.svg" alt="Appgom" className="w-11 h-11" />
          <span className="text-xl font-bold text-on-surface">Portal Appgom</span>
        </div>

        <h2 className="text-2xl font-bold text-on-surface mb-1">Ingresa a tu portal</h2>
        <p className="text-secondary mb-8">Consulta tus contratos, saldos y reporta tus pagos.</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-status-error/10 border border-status-error/30 text-status-error text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary block">Correo</label>
            <input
              type="email"
              required
              autoFocus
              placeholder="tu@empresa.com"
              className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-action-blue focus:border-action-blue transition-all"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary block">Contraseña</label>
              <Link to="/portal/solicitar-reset" className="text-xs text-action-blue hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <input
                type={mostrarPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 pr-11 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-action-blue focus:border-action-blue transition-all"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-secondary transition-colors"
                onClick={() => setMostrarPassword((v) => !v)}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {mostrarPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-action-blue text-white py-2.5 rounded-lg font-bold hover:bg-primary transition-all disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-outline mt-10">Appgom · Portal de clientes</p>
      </div>
    </div>
  );
}
