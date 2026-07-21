import { useState } from 'react';
import { Link } from 'react-router-dom';
import { portalApi } from '../../api/portalClient';

export default function PortalSolicitarResetPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await portalApi.post('/portal/auth/solicitar-reset', { email });
      setMensaje(res.mensaje);
      setEnviado(true);
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

        <h2 className="text-2xl font-bold text-on-surface mb-1">Restablecer contraseña</h2>
        <p className="text-secondary mb-8">Te enviaremos un enlace a tu correo para elegir una nueva contraseña.</p>

        {enviado ? (
          <div className="bg-status-success/10 border border-status-success/30 text-status-success text-sm rounded-lg px-4 py-3">
            {mensaje}
          </div>
        ) : (
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
                className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-4 py-2.5 text-on-surface outline-none focus:ring-2 focus:ring-action-blue focus:border-action-blue transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-action-blue text-white py-2.5 rounded-lg font-bold hover:bg-primary transition-all disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-8">
          <Link to="/portal/login" className="text-action-blue hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
