import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
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
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface-container-lowest border border-border-subtle rounded-xl shadow-sm p-8">
        <h1 className="font-display-sm text-display-sm font-bold text-primary text-center">Appcom CRM</h1>
        <p className="text-secondary text-center font-label-md text-label-md mt-1 mb-8">Panel de administración</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && <p className="text-status-error text-sm">{error}</p>}
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Correo</label>
            <input
              type="email"
              required
              autoFocus
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-md text-label-md text-secondary block">Contraseña</label>
            <input
              type="password"
              required
              className="w-full bg-surface-base border border-border-subtle rounded-lg px-4 py-2.5 text-body-md outline-none focus:ring-2 focus:ring-action-blue"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-action-blue text-white py-2.5 rounded-lg font-bold hover:bg-primary transition-all disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
