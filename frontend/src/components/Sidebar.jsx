import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/clientes', label: 'Clientes', icon: 'group' },
  { to: '/contratos', label: 'Contratos', icon: 'description' },
  { to: '/vencimientos', label: 'Cuentas por cobrar', icon: 'event_busy' },
  { to: '/proveedores', label: 'Proveedores', icon: 'inventory_2', disabled: true },
];

function NavItem({ to, label, icon, end, disabled, onNavigate }) {
  if (disabled) {
    return (
      <span className="flex items-center gap-3 px-4 py-3 text-secondary/50 cursor-not-allowed">
        <span className="material-symbols-outlined">{icon}</span>
        <span className="font-label-md text-label-md">{label}</span>
        <span className="ml-auto text-[10px] bg-surface-container-high text-secondary px-1.5 py-0.5 rounded-full">Pronto</span>
      </span>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 transition-colors ${
          isActive
            ? 'text-action-blue border-l-2 border-action-blue bg-surface-container-low font-bold'
            : 'text-secondary hover:bg-surface-container-low hover:text-on-surface'
        }`
      }
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="font-label-md text-label-md">{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const { usuario } = useAuth();
  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : 'AA';

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onClose} aria-hidden="true"></div>
      )}
      <aside
        className={`w-[260px] md:w-sidebar-width h-screen fixed left-0 top-0 bg-surface-container-lowest border-r border-border-subtle flex flex-col py-6 z-50 transform transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="px-6 mb-8 flex items-center gap-3">
          <img src="/logo.svg" alt="Appgom" className="w-10 h-10 shrink-0" />
          <div className="overflow-hidden flex-1">
            <h1 className="font-display-sm text-[18px] leading-tight font-bold text-on-surface truncate">Appgom CRM</h1>
            <p className="font-label-md text-label-md text-secondary truncate">Panel de administración</p>
          </div>
          <button className="md:hidden text-secondary p-1" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.label} {...item} onNavigate={onClose} />
          ))}
          <div className="pt-4 mt-4 border-t border-border-subtle">
            <NavItem to="/configuracion" label="Configuración" icon="settings" onNavigate={onClose} />
          </div>
        </nav>
        <div className="px-4 mt-auto pt-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low">
            <div className="w-8 h-8 rounded-full bg-action-blue flex items-center justify-center text-white font-bold text-xs shrink-0">
              {iniciales}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-on-surface truncate">{usuario?.nombre || 'Administrador'}</p>
              <p className="text-xs text-secondary truncate">{usuario?.email || ''}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
