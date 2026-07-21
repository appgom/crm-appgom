import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortalAuthProvider, usePortalAuth } from './context/PortalAuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import ClienteDetailPage from './pages/ClienteDetailPage';
import ContratosPage from './pages/ContratosPage';
import ContratoDetailPage from './pages/ContratoDetailPage';
import NuevoContratoPage from './pages/NuevoContratoPage';
import VencimientosPage from './pages/VencimientosPage';
import ProveedoresPage from './pages/ProveedoresPage';
import ProveedorDetailPage from './pages/ProveedorDetailPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import PerfilPage from './pages/PerfilPage';
import ReportesPagoPage from './pages/ReportesPagoPage';
import PortalLoginPage from './pages/portal/PortalLoginPage';
import PortalSolicitarResetPage from './pages/portal/PortalSolicitarResetPage';
import PortalRestablecerPage from './pages/portal/PortalRestablecerPage';
import PortalDashboardPage from './pages/portal/PortalDashboardPage';
import PortalContratoDetailPage from './pages/portal/PortalContratoDetailPage';
import { ES_SUBDOMINIO_PORTAL, PORTAL_BASE, PORTAL_HOME } from './utils/portalBase';

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
      <Route path="/reportes-pago" element={<RequireAuth><ReportesPagoPage /></RequireAuth>} />
      <Route path="/suscripciones" element={<RequireAuth><ProveedoresPage /></RequireAuth>} />
      <Route path="/suscripciones/:id" element={<RequireAuth><ProveedorDetailPage /></RequireAuth>} />
      <Route path="/configuracion" element={<RequireAuth><ConfiguracionPage /></RequireAuth>} />
      <Route path="/perfil" element={<RequireAuth><PerfilPage /></RequireAuth>} />
    </Routes>
  );
}

function RequirePortalAuth({ children }) {
  const { cliente, loading } = usePortalAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-surface-base" />;
  }
  if (!cliente) {
    return <Navigate to={`${PORTAL_BASE}/login`} state={{ from: location.pathname }} replace />;
  }
  return children;
}

function PortalRoutes() {
  const { cliente, setCliente } = usePortalAuth();

  return (
    <Routes>
      <Route
        path="login"
        element={cliente ? <Navigate to={PORTAL_HOME} replace /> : <PortalLoginPage onLogin={setCliente} />}
      />
      <Route path="solicitar-reset" element={<PortalSolicitarResetPage />} />
      <Route path="restablecer" element={<PortalRestablecerPage />} />
      <Route path="" element={<RequirePortalAuth><PortalDashboardPage /></RequirePortalAuth>} />
      <Route path="contratos/:id" element={<RequirePortalAuth><PortalContratoDetailPage /></RequirePortalAuth>} />
    </Routes>
  );
}

function PortalApp() {
  return (
    <PortalAuthProvider>
      <PortalRoutes />
    </PortalAuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {ES_SUBDOMINIO_PORTAL ? (
        // portal.appgom.com: el portal vive directo en la raiz, el cliente
        // nunca ve el dominio del CRM interno.
        <PortalApp />
      ) : (
        <Routes>
          {/* Compatibilidad con enlaces viejos a crm.appgom.com/portal */}
          <Route path="/portal/*" element={<PortalApp />} />
          <Route
            path="/*"
            element={
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            }
          />
        </Routes>
      )}
    </BrowserRouter>
  );
}
