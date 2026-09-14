import { createClient } from '@supabase/supabase-js';

// Las credenciales se leen del archivo .env (ver .env.example).
// La "anon key" es pública y segura de exponer en el frontend:
// la seguridad real la dan las políticas de Row Level Security (RLS)
// definidas en database/schema.sql.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Aviso claro en desarrollo si alguien olvida configurar el .env
  console.error(
    'Faltan las variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Revisa tu archivo .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
