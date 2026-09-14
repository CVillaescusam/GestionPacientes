import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

/**
 * Login sencillo con email y contraseña.
 * No hay pantalla de "registro" a propósito: al ser una app de uso
 * personal para una sola profesional, el usuario se crea una única vez
 * desde el panel de Supabase (Authentication -> Add user). Ver README.
 */
export default function LoginPage() {
  const { usuario } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  async function iniciarSesion(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);

    const { error: errorLogin } = await supabase.auth.signInWithPassword({ email, password });

    setEnviando(false);
    if (errorLogin) {
      setError('Email o contraseña incorrectos.');
    }
  }

  return (
    <div className="pantalla-login">
      <form className="tarjeta caja-login" onSubmit={iniciarSesion}>
        <h1>Gestión de Pacientes</h1>
        <p>Accede con tu cuenta para ver tus pacientes.</p>

        <div className="campo">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="campo">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="mensaje-error">{error}</p>}

        <button type="submit" className="btn btn-primario" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
