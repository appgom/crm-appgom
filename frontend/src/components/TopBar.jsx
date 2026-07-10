import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { estadoVencimiento } from '../utils/vencimiento';

function formatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function TopBar({ searchPlaceholder = 'Buscar...', onSearch, onMenuClick }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [avisosAbiertos, setAvisosAbiertos] = useState(false);
  const [busquedaMovilAbierta, setBusquedaMovilAbierta] = useState(false);
  const [avisos, setAvisos] = useState([]);
  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '';

  useEffect(() => {
    api.get('/vencimientos')
      .then((data) => {
        const relevantes = data
          .map((v) => ({ ...v, estado: estadoVencimiento(v) }))
          .filter((v) => v.estado.urgencia !== 'lejano')
          .sort((a, b) => (b.dias_atraso || 0) - (a.dias_atraso || 0));
        setAvisos(relevantes);
      })
      .catch(() => {});
  }, []);

  const vencidos = avisos.filter((v) => v.estado.urgencia === 'vencido').length;

  return (
    <header className="h-16 sticky top-0 bg-surface-container-lowest border-b border-border-subtle flex justify-between items-center gap-2 px-3 md:px-gutter z-40 relative">
      <button className="md:hidden text-secondary p-2 -ml-2 shrink-0" onClick={onMenuClick}>
        <span className="material-symbols-outlined">menu</span>
      </button>

      <div className="hidden sm:flex items-center gap-4 flex-1 min-w-0">
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

      <div className="sm:hidden flex-1"></div>

      <div className="flex items-center gap-2 md:gap-6 shrink-0">
        <button
          className="sm:hidden text-secondary hover:text-action-blue transition-colors p-2"
          onClick={() => setBusquedaMovilAbierta((v) => !v)}
        >
          <span className="material-symbols-outlined">search</span>
        </button>
        <div className="relative">
          <button
            className="text-secondary hover:text-action-blue transition-colors relative p-2 -m-2"
            onClick={() => setAvisosAbiertos((v) => !v)}
          >
            <span className="material-symbols-outlined">notifications</span>
            {avisos.length > 0 && (
              <span
                className={`absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  vencidos > 0 ? 'bg-status-error text-white' : 'bg-status-warning text-black'
                }`}
              >
                {avisos.length}
              </span>
            )}
          </button>
          {avisosAbiertos && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setAvisosAbiertos(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-surface-container-lowest border border-border-subtle rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border-subtle">
                  <p className="font-semibold text-on-surface text-sm">Avisos de cobranza</p>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-border-subtle">
                  {avisos.length === 0 && (
                    <p className="px-4 py-6 text-sm text-secondary text-center">Sin avisos pendientes.</p>
                  )}
                  {avisos.slice(0, 8).map((v) => (
                    <button
                      key={v.cargo_id}
                      className="w-full text-left px-4 py-3 hover:bg-surface-base transition-colors"
                      onClick={() => {
                        setAvisosAbiertos(false);
                        navigate(`/contratos/${v.contrato_id}`);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-on-surface truncate">{v.cliente_nombre}</p>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${v.estado.className}`}>
                          {v.estado.label}
                        </span>
                      </div>
                      <p className="text-xs text-secondary truncate">{v.tipo_servicio}</p>
                      <p className="text-xs text-text-muted mt-0.5">{formatMoney(v.saldo_pendiente)}</p>
                    </button>
                  ))}
                </div>
                {avisos.length > 0 && (
                  <button
                    className="w-full text-center px-4 py-2.5 text-sm text-action-blue hover:bg-surface-base transition-colors font-medium border-t border-border-subtle"
                    onClick={() => {
                      setAvisosAbiertos(false);
                      navigate('/vencimientos');
                    }}
                  >
                    Ver todas las cuentas por cobrar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        <div className="hidden md:block h-8 w-px bg-border-subtle"></div>
        <div className="relative">
          <button className="flex items-center gap-2 md:gap-3" onClick={() => setMenuAbierto((v) => !v)}>
            <span className="hidden md:inline text-sm font-medium">{usuario?.nombre || 'Administrator'}</span>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
              {iniciales}
            </div>
          </button>
          {menuAbierto && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest border border-border-subtle rounded-lg shadow-lg py-1 z-50">
              <button
                className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-surface-container-low flex items-center gap-2"
                onClick={() => {
                  setMenuAbierto(false);
                  navigate('/perfil');
                }}
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Mi perfil
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-status-error hover:bg-surface-container-low flex items-center gap-2"
                onClick={logout}
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {busquedaMovilAbierta && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-surface-container-lowest border-b border-border-subtle p-3 z-30">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              autoFocus
              className="w-full pl-10 pr-4 py-2 bg-surface-base border border-border-subtle rounded-lg text-sm focus:ring-1 focus:ring-action-blue focus:border-action-blue outline-none transition-all"
              placeholder={searchPlaceholder}
              type="text"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>
      )}
    </header>
  );
}
