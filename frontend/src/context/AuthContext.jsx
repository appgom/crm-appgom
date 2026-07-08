import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null); // null = verificando, false = no autenticado, objeto = autenticado
  const [loading, setLoading] = useState(true);

  async function verificarSesion() {
    try {
      const data = await api.get('/auth/me');
      setUsuario(data);
    } catch {
      setUsuario(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    verificarSesion();

    function handleUnauthorized() {
      setUsuario(false);
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  async function logout() {
    await api.post('/auth/logout', {}).catch(() => {});
    setUsuario(false);
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, setUsuario, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
