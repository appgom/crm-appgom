import { createContext, useContext, useEffect, useState } from 'react';
import { portalApi } from '../api/portalClient';

const PortalAuthContext = createContext(null);

export function PortalAuthProvider({ children }) {
  const [cliente, setCliente] = useState(null); // null = verificando, false = no autenticado, objeto = autenticado
  const [loading, setLoading] = useState(true);

  async function verificarSesion() {
    try {
      const data = await portalApi.get('/portal/auth/me');
      setCliente(data);
    } catch {
      setCliente(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    verificarSesion();

    function handleUnauthorized() {
      setCliente(false);
    }
    window.addEventListener('portal:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('portal:unauthorized', handleUnauthorized);
  }, []);

  async function logout() {
    await portalApi.post('/portal/auth/logout', {}).catch(() => {});
    setCliente(false);
  }

  return (
    <PortalAuthContext.Provider value={{ cliente, loading, setCliente, logout }}>
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  return useContext(PortalAuthContext);
}
