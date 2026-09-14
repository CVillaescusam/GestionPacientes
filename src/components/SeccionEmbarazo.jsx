import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { calcularSemanaEmbarazo, formatearFecha } from '../utils/fechas';

const HOY = () => new Date().toISOString().slice(0, 10);

/**
 * Si la paciente no tiene un embarazo activo, muestra el formulario para
 * empezar a hacerle seguimiento. Si ya lo tiene, muestra en qué semana
 * está y los botones rápidos que usará la fisioterapeuta en cada revisión.
 */
export default function SeccionEmbarazo({ pacienteId, embarazoActivo, onCambio }) {
  const [fpp, setFpp] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function iniciarSeguimiento(evento) {
    evento.preventDefault();
    setGuardando(true);
    await supabase.from('embarazos').insert({ paciente_id: pacienteId, fecha_probable_parto: fpp });
    setGuardando(false);
    onCambio();
  }

  async function marcarRevisionHoy() {
    await supabase.from('embarazos').update({ fecha_ultima_revision: HOY() }).eq('id', embarazoActivo.id);
    onCambio();
  }

  async function marcarPreparacionPartoIniciada() {
    await supabase.from('embarazos').update({ preparacion_parto_iniciada: true }).eq('id', embarazoActivo.id);
    onCambio();
  }

  async function finalizarEmbarazo() {
    await supabase.from('embarazos').update({ estado: 'finalizado' }).eq('id', embarazoActivo.id);
    onCambio();
  }

  if (!embarazoActivo) {
    return (
      <section className="tarjeta seccion-ficha">
        <h2>Seguimiento de embarazo</h2>
        <p>Esta paciente no tiene un embarazo activo registrado.</p>
        <form className="formulario-inicio-embarazo" onSubmit={iniciarSeguimiento}>
          <div className="campo">
            <label htmlFor="fpp">Fecha probable de parto</label>
            <input id="fpp" type="date" required value={fpp} onChange={(e) => setFpp(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primario" disabled={guardando}>
            Iniciar seguimiento
          </button>
        </form>
      </section>
    );
  }

  const semana = calcularSemanaEmbarazo(embarazoActivo.fecha_probable_parto);
  const porcentaje = Math.min(100, Math.max(0, (semana / 40) * 100));

  return (
    <section className="tarjeta seccion-ficha">
      <h2>Seguimiento de embarazo</h2>

      <p className="texto-semana">
        Semana <strong>{semana}</strong> de 40 · FPP: {formatearFecha(embarazoActivo.fecha_probable_parto)}
      </p>
      <div className="barra-progreso-embarazo">
        <div className="relleno-progreso-embarazo" style={{ width: `${porcentaje}%` }} />
      </div>

      <p>
        Última revisión:{' '}
        {embarazoActivo.fecha_ultima_revision ? formatearFecha(embarazoActivo.fecha_ultima_revision) : 'sin registrar'}
      </p>

      <div className="acciones-embarazo">
        <button className="btn btn-secundario" onClick={marcarRevisionHoy}>
          Marcar revisión de hoy
        </button>
        {!embarazoActivo.preparacion_parto_iniciada && (
          <button className="btn btn-secundario" onClick={marcarPreparacionPartoIniciada}>
            Marcar preparación al parto iniciada
          </button>
        )}
        <button className="btn btn-texto" onClick={finalizarEmbarazo}>
          Finalizar embarazo (ya ha dado a luz)
        </button>
      </div>
    </section>
  );
}
