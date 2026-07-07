import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ClientesPage from './pages/ClientesPage';
import ClienteDetailPage from './pages/ClienteDetailPage';
import ContratosPage from './pages/ContratosPage';
import ContratoDetailPage from './pages/ContratoDetailPage';
import NuevoContratoPage from './pages/NuevoContratoPage';
import VencimientosPage from './pages/VencimientosPage';
import ConfiguracionPage from './pages/ConfiguracionPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/clientes/:id" element={<ClienteDetailPage />} />
        <Route path="/contratos" element={<ContratosPage />} />
        <Route path="/contratos/nuevo" element={<NuevoContratoPage />} />
        <Route path="/contratos/:id" element={<ContratoDetailPage />} />
        <Route path="/vencimientos" element={<VencimientosPage />} />
        <Route path="/configuracion" element={<ConfiguracionPage />} />
      </Routes>
    </BrowserRouter>
  );
}
