import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { portalApi } from '../../api/portalClient';

export default function PortalRestablecerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [passwordNueva, setPasswordNueva] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await portalApi.post('/portal/auth/restablecer', { token, passwordNueva });
      navigate('/portal/login', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <p className="text-status-error mb-4">Este enlace no es válido.</p>
          <Link to="/portal/solicitar-reset" className="text-action-blue hover:underline">
            Solicitar un nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <img src="/logo.svg" alt="Appgom" className="w-11 h-11" />
          <span className="text-xl font-bold text-on-surface">Portal Appgom</span>
        </div>

        <h2 className="text-2xl font-bold text-on-surface mb-1">Elige una nueva contraseña</h2>
        <p className="text-secondary mb-8">Mínimo 8 caracteres.</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-status-error/10 border border-status-error/30 text-status-error text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary block">Nueva contraseña</label>
            <input
              type="password"
              required
              minLength={8}
              autoFocus
              className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-action-blue focus:border-action-blue transition-all"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-action-blue text-white py-2.5 rounded-lg font-bold hover:bg-primary transition-all disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
