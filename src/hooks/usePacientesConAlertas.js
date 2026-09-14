import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { calcularAlertasPaciente, nivelMasUrgente } from '../utils/alertas';

/**
 * Hook central de datos de la app.
 *
 * Trae a todas las pacientes junto con sus visitas, su embarazo activo
 * (si tiene) y su posparto activo (si tiene), y le calcula sus alertas.
 * Tanto el Dashboard como el listado de pacientes usan este mismo hook
 * para no duplicar las consultas a Supabase.
 */
export function usePacientesConAlertas() {
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    const { data: listaPacientes, error: errorPacientes } = await supabase
      .from('pacientes')
      .select('*')
      .order('nombre', { ascending: true });

    if (errorPacientes) {
      setError(errorPacientes.message);
      setCargando(false);
      return;
    }

    const idsPacientes = listaPacientes.map((p) => p.id);

    // Si no hay pacientes todavía, no hace falta pedir el resto de tablas.
    if (idsPacientes.length === 0) {
      setPacientes([]);
      setCargando(false);
      return;
    }

    const [{ data: visitas }, { data: embarazos }, { data: postpartos }] = await Promise.all([
      supabase.from('visitas').select('*').in('paciente_id', idsPacientes),
      supabase.from('embarazos').select('*').eq('estado', 'activo').in('paciente_id', idsPacientes),
      supabase.from('postpartos').select('*').eq('estado', 'activo').in('paciente_id', idsPacientes),
    ]);

    const pacientesCompletas = listaPacientes.map((paciente) => {
      const visitasPaciente = (visitas ?? []).filter((v) => v.paciente_id === paciente.id);
      const embarazoActivo = (embarazos ?? []).find((e) => e.paciente_id === paciente.id) ?? null;
      const postpartoActivo = (postpartos ?? []).find((p) => p.paciente_id === paciente.id) ?? null;

      const alertas = calcularAlertasPaciente(paciente, {
        visitas: visitasPaciente,
        embarazoActivo,
        postpartoActivo,
      });

      return {
        ...paciente,
        visitas: visitasPaciente,
        embarazoActivo,
        postpartoActivo,
        alertas,
        nivelAlerta: nivelMasUrgente(alertas),
      };
    });

    setPacientes(pacientesCompletas);
    setCargando(false);
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { pacientes, cargando, error, recargar };
}
