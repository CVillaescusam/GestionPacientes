import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { formatearFecha } from '../utils/fechas';

const TIPOS_VISITA = [
  { valor: 'primera_visita', etiqueta: 'Primera visita' },
  { valor: 'revision', etiqueta: 'Revisión' },
  { valor: 'preparacion_parto', etiqueta: 'Preparación al parto' },
  { valor: 'urgencia', etiqueta: 'Urgencia' },
  { valor: 'otro', etiqueta: 'Otro' },
];

/**
 * Muestra el historial de visitas (más reciente primero) y permite
 * registrar una nueva en un par de clics.
 */
export default function SeccionVisitas({ pacienteId, visitas, onCambio }) {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [tipo, setTipo] = useState('revision');
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);

  const visitasOrdenadas = [...visitas].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  async function anadirVisita(evento) {
    evento.preventDefault();
    setGuardando(true);

    await supabase.from('visitas').insert({ paciente_id: pacienteId, fecha, tipo, notas });

    setNotas('');
    setGuardando(false);
    onCambio();
  }

  return (
    <section className="tarjeta seccion-ficha">
      <h2>Historial de visitas</h2>

      <form className="formulario-visita" onSubmit={anadirVisita}>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS_VISITA.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.etiqueta}
            </option>
          ))}
        </select>
        <input
          placeholder="Notas (opcional)"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
        <button type="submit" className="btn btn-primario" disabled={guardando}>
          Añadir
        </button>
      </form>

      {visitasOrdenadas.length === 0 ? (
        <p>Todavía no hay visitas registradas.</p>
      ) : (
        <ul className="lista-visitas">
          {visitasOrdenadas.map((visita) => (
            <li key={visita.id}>
              <span className="fecha-visita">{formatearFecha(visita.fecha)}</span>
              <span className="tipo-visita">
                {TIPOS_VISITA.find((t) => t.valor === visita.tipo)?.etiqueta ?? visita.tipo}
              </span>
              {visita.notas && <span className="notas-visita">{visita.notas}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
