import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/clientes', label: 'Clientes', icon: 'group' },
  { to: '/contratos', label: 'Contratos', icon: 'description' },
  { to: '/vencimientos', label: 'Cuentas por cobrar', icon: 'event_busy' },
  { to: '/proveedores', label: 'Proveedores', icon: 'inventory_2', disabled: true },
];

function NavItem({ to, label, icon, end, disabled }) {
  if (disabled) {
    return (
      <span className="flex items-center gap-3 px-4 py-3 text-secondary/50 cursor-not-allowed">
        <span className="material-symbols-outlined">{icon}</span>
        <span className="font-label-md text-label-md">{label}</span>
        <span className="ml-auto text-[10px] bg-surface-container px-1.5 py-0.5 rounded-full">Pronto</span>
      </span>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 transition-colors ${
          isActive
            ? 'text-action-blue border-l-2 border-action-blue bg-surface-container-low font-bold'
            : 'text-secondary hover:bg-surface-base'
        }`
      }
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="font-label-md text-label-md">{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-sidebar-width h-screen fixed left-0 top-0 bg-surface-container-lowest border-r border-border-subtle flex flex-col py-6 z-50">
      <div className="px-6 mb-8">
        <h1 className="font-display-sm text-display-sm font-bold text-primary">Appcom CRM</h1>
        <p className="font-label-md text-label-md text-secondary mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
        <div className="pt-4 mt-4 border-t border-border-subtle">
          <NavItem to="/configuracion" label="Configuración" icon="settings" />
        </div>
      </nav>
      <div className="px-4 mt-auto">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-base">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
            AA
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">Appcom Admin</p>
            <p className="text-xs text-secondary truncate">admin@appcom.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
