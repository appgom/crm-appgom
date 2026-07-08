import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const usuario = await api.post('/auth/login', form);
      onLogin(usuario);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-base flex">
      {/* Panel de marca — oculto en mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-navy items-center justify-center p-16">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-orange/30 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-brand-purple/40 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-brand-blue/20 blur-3xl"></div>

        <div className="relative z-10 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-purple flex items-center justify-center text-white font-bold text-2xl mb-8 shadow-lg shadow-brand-orange/20">
            AG
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Appgom <span className="text-brand-orange">CRM</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Gestiona clientes, contratos y cobros en un solo lugar. Panel de uso interno para el equipo de Appgom.
          </p>
        </div>
      </div>

      {/* Panel de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-orange to-brand-purple flex items-center justify-center text-white font-bold text-sm">
              AG
            </div>
            <span className="text-xl font-bold text-on-surface">Appgom CRM</span>
          </div>

          <h2 className="text-2xl font-bold text-on-surface mb-1">Iniciar sesión</h2>
          <p className="text-secondary mb-8">Entra con tu correo y contraseña de administrador.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-status-error/10 border border-status-error/30 text-status-error text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary block">Correo</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  mail
                </span>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="tu@appgom.com"
                  className="w-full bg-surface-container-low border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-action-blue focus:border-action-blue transition-all"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary block">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border border-border-subtle rounded-lg pl-10 pr-11 py-2.5 text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-action-blue focus:border-action-blue transition-all"
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
              className="w-full bg-action-blue text-white py-2.5 rounded-lg font-bold hover:bg-primary transition-all disabled:opacity-50 shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-outline mt-10">Appgom · Uso interno</p>
        </div>
      </div>
    </div>
  );
}
