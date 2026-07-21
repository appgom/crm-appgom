import { Link, NavLink, useNavigate } from 'react-router-dom';
import { usePortalAuth } from '../context/PortalAuthContext';
import { PORTAL_BASE, PORTAL_HOME } from '../utils/portalBase';

const NAV_ITEMS = [
  { to: PORTAL_HOME, label: 'Inicio', icon: 'home', end: true },
  { to: `${PORTAL_BASE}/pagos`, label: 'Pagos', icon: 'payments' },
  { to: `${PORTAL_BASE}/facturas`, label: 'Facturas', icon: 'receipt_long' },
];

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
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                  isActive ? 'bg-action-blue/10 text-action-blue' : 'text-secondary hover:bg-surface-base'
                }`
              }
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
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
      <nav className="sm:hidden sticky top-16 z-30 bg-surface-container-lowest border-b border-border-subtle flex items-stretch">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 py-2.5 flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors ${
                isActive ? 'text-action-blue' : 'text-secondary'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="max-w-4xl mx-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
