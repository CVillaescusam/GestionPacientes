import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

/**
 * Envuelve toda la app y expone la sesión actual del usuario.
 * Así cualquier componente puede saber si hay alguien identificado
 * sin tener que consultar a Supabase cada vez.
 */
export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. Al arrancar, comprobamos si ya hay una sesión guardada (localStorage).
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargando(false);
    });

    // 2. Nos suscribimos a cambios (login, logout, token refrescado).
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const valor = {
    sesion,
    usuario: sesion?.user ?? null,
    cargando,
    cerrarSesion: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

/** Hook de acceso rápido: const { usuario } = useAuth(); */
export function useAuth() {
  return useContext(AuthContext);
}
