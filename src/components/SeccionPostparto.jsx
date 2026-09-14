import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { formatearFecha } from '../utils/fechas';

const HOY = () => new Date().toISOString().slice(0, 10);

export default function SeccionPostparto({ pacienteId, postpartoActivo, onCambio }) {
  const [fechaParto, setFechaParto] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function iniciarSeguimiento(evento) {
    evento.preventDefault();
    setGuardando(true);
    await supabase.from('postpartos').insert({ paciente_id: pacienteId, fecha_parto: fechaParto });
    setGuardando(false);
    onCambio();
  }

  async function marcarRevisionHoy() {
    await supabase.from('postpartos').update({ fecha_ultima_revision: HOY() }).eq('id', postpartoActivo.id);
    onCambio();
  }

  async function finalizarSeguimiento() {
    await supabase.from('postpartos').update({ estado: 'finalizado' }).eq('id', postpartoActivo.id);
    onCambio();
  }

  if (!postpartoActivo) {
    return (
      <section className="tarjeta seccion-ficha">
        <h2>Seguimiento posparto</h2>
        <p>Esta paciente no tiene un seguimiento posparto activo.</p>
        <form className="formulario-inicio-embarazo" onSubmit={iniciarSeguimiento}>
          <div className="campo">
            <label htmlFor="fecha_parto">Fecha del parto</label>
            <input
              id="fecha_parto"
              type="date"
              required
              value={fechaParto}
              onChange={(e) => setFechaParto(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primario" disabled={guardando}>
            Iniciar seguimiento
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="tarjeta seccion-ficha">
      <h2>Seguimiento posparto</h2>
      <p>Fecha del parto: {formatearFecha(postpartoActivo.fecha_parto)}</p>
      <p>
        Última revisión:{' '}
        {postpartoActivo.fecha_ultima_revision
          ? formatearFecha(postpartoActivo.fecha_ultima_revision)
          : 'sin registrar'}
      </p>

      <div className="acciones-embarazo">
        <button className="btn btn-secundario" onClick={marcarRevisionHoy}>
          Marcar revisión de hoy
        </button>
        <button className="btn btn-texto" onClick={finalizarSeguimiento}>
          Finalizar seguimiento posparto
        </button>
      </div>
    </section>
  );
}
