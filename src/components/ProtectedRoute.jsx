import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Envuelve las páginas privadas. Si todavía no sabemos si hay sesión,
 * no mostramos nada (evita un parpadeo). Si no hay usuario, al login.
 */
export default function ProtectedRoute({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return null;
  if (!usuario) return <Navigate to="/login" replace />;

  return children;
}
