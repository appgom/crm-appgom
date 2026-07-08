import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import ClienteDetailPage from './pages/ClienteDetailPage';
import ContratosPage from './pages/ContratosPage';
import ContratoDetailPage from './pages/ContratoDetailPage';
import NuevoContratoPage from './pages/NuevoContratoPage';
import VencimientosPage from './pages/VencimientosPage';
import ConfiguracionPage from './pages/ConfiguracionPage';

function RequireAuth({ children }) {
  const { usuario, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-surface-base" />;
  }
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

function AppRoutes() {
  const { usuario, setUsuario } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={usuario ? <Navigate to="/" replace /> : <LoginPage onLogin={setUsuario} />}
      />
      <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/clientes" element={<RequireAuth><ClientesPage /></RequireAuth>} />
      <Route path="/clientes/:id" element={<RequireAuth><ClienteDetailPage /></RequireAuth>} />
      <Route path="/contratos" element={<RequireAuth><ContratosPage /></RequireAuth>} />
      <Route path="/contratos/nuevo" element={<RequireAuth><NuevoContratoPage /></RequireAuth>} />
      <Route path="/contratos/:id/editar" element={<RequireAuth><NuevoContratoPage /></RequireAuth>} />
      <Route path="/contratos/:id" element={<RequireAuth><ContratoDetailPage /></RequireAuth>} />
      <Route path="/vencimientos" element={<RequireAuth><VencimientosPage /></RequireAuth>} />
      <Route path="/configuracion" element={<RequireAuth><ConfiguracionPage /></RequireAuth>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
