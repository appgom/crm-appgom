export default function TopBar({ searchPlaceholder = 'Buscar...', onSearch }) {
  return (
    <header className="h-16 sticky top-0 bg-surface-container-lowest border-b border-border-subtle flex justify-between items-center px-gutter z-40">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-base border border-border-subtle rounded-lg text-sm focus:ring-1 focus:ring-action-blue focus:border-action-blue outline-none transition-all"
            placeholder={searchPlaceholder}
            type="text"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-secondary hover:text-action-blue transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="h-8 w-px bg-border-subtle"></div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Administrator</span>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
            AA
          </div>
        </div>
      </div>
    </header>
  );
}
