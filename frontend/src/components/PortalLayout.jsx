import { Link, useNavigate } from 'react-router-dom';
import { usePortalAuth } from '../context/PortalAuthContext';
import { PORTAL_BASE, PORTAL_HOME } from '../utils/portalBase';

export default function PortalLayout({ children }) {
  const { cliente, logout } = usePortalAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate(`${PORTAL_BASE}/login`, { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <header className="h-16 sticky top-0 bg-surface-container-lowest border-b border-border-subtle flex items-center justify-between px-4 md:px-8 z-40">
        <Link to={PORTAL_HOME} className="flex items-center gap-3">
          <img src="/logo.svg" alt="Appgom" className="w-8 h-8" />
          <span className="font-bold text-on-surface hidden sm:inline">Portal Appgom</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-on-surface">{cliente?.nombre}</p>
            {cliente?.empresa && <p className="text-xs text-secondary">{cliente.empresa}</p>}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-secondary hover:text-status-error hover:bg-status-error/10 rounded-full transition-colors"
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
