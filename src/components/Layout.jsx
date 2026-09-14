import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

/**
 * Menú lateral fijo + zona de contenido (Outlet = la página activa).
 * Se usa una sola vez, envolviendo todas las rutas privadas en App.jsx.
 */
export default function Layout() {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <div className="app-layout">
      <aside className="barra-lateral">
        <div className="marca">
          <span className="marca-icono">+</span>
          <span>Mis Pacientes</span>
        </div>

        <nav className="menu-navegacion">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'activo' : '')}>
            Avisos
          </NavLink>
          <NavLink to="/pacientes" className={({ isActive }) => (isActive ? 'activo' : '')}>
            Pacientes
          </NavLink>
          <NavLink to="/pacientes/nueva" className={({ isActive }) => (isActive ? 'activo' : '')}>
            + Nueva paciente
          </NavLink>
        </nav>

        <div className="pie-barra-lateral">
          <span className="email-usuario">{usuario?.email}</span>
          <button className="btn-texto" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="contenido-principal">
        <Outlet />
      </main>
    </div>
  );
}
