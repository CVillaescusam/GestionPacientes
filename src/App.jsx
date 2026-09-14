import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import ListaPacientes from './components/ListaPacientes';
import FormularioPaciente from './components/FormularioPaciente';
import FichaPaciente from './components/FichaPaciente';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Todas las rutas de aquí abajo requieren estar identificada */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pacientes" element={<ListaPacientes />} />
        <Route path="pacientes/nueva" element={<FormularioPaciente />} />
        <Route path="pacientes/:id" element={<FichaPaciente />} />
      </Route>
    </Routes>
  );
}
