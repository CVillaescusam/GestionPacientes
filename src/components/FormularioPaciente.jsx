import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { MOTIVOS } from '../config/motivos';
import './FormularioPaciente.css';

const PACIENTE_VACIA = {
  nombre: '',
  telefono: '',
  email: '',
  fecha_nacimiento: '',
  motivos: [],
  notas: '',
};

/**
 * Alta de una nueva paciente con sus datos básicos.
 * El seguimiento de embarazo/posparto se añade después, desde su ficha,
 * para que este formulario inicial sea rápido de rellenar.
 */
export default function FormularioPaciente() {
  const [datos, setDatos] = useState(PACIENTE_VACIA);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const { usuario } = useAuth();
  const navegar = useNavigate();

  function actualizarCampo(campo, valor) {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function alternarMotivo(valorMotivo) {
    setDatos((anterior) => {
      const yaEstaba = anterior.motivos.includes(valorMotivo);
      const motivos = yaEstaba
        ? anterior.motivos.filter((m) => m !== valorMotivo)
        : [...anterior.motivos, valorMotivo];
      return { ...anterior, motivos };
    });
  }

  async function guardarPaciente(evento) {
    evento.preventDefault();
    setGuardando(true);
    setError('');

    const { data, error: errorGuardado } = await supabase
      .from('pacientes')
      // La fecha de nacimiento es opcional: si se deja vacía hay que mandar
      // "null" y no "" (una cadena vacía no es una fecha válida en la base de datos).
      .insert({ ...datos, fecha_nacimiento: datos.fecha_nacimiento || null, user_id: usuario.id })
      .select()
      .single();

    setGuardando(false);

    if (errorGuardado) {
      setError('No se ha podido guardar. Inténtalo de nuevo.');
      return;
    }

    // Vamos directas a su ficha para poder añadir el seguimiento si hace falta.
    navegar(`/pacientes/${data.id}`);
  }

  return (
    <div>
      <h1>Nueva paciente</h1>
      <p>Datos básicos. El seguimiento de embarazo o posparto se añade después, desde su ficha.</p>

      <form className="tarjeta formulario-paciente" onSubmit={guardarPaciente}>
        <div className="campo">
          <label htmlFor="nombre">Nombre completo *</label>
          <input
            id="nombre"
            required
            value={datos.nombre}
            onChange={(e) => actualizarCampo('nombre', e.target.value)}
          />
        </div>

        <div className="fila-dos-columnas">
          <div className="campo">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              value={datos.telefono}
              onChange={(e) => actualizarCampo('telefono', e.target.value)}
            />
          </div>
          <div className="campo">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={datos.email}
              onChange={(e) => actualizarCampo('email', e.target.value)}
            />
          </div>
        </div>

        <div className="campo">
          <label htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
          <input
            id="fecha_nacimiento"
            type="date"
            value={datos.fecha_nacimiento}
            onChange={(e) => actualizarCampo('fecha_nacimiento', e.target.value)}
          />
        </div>

        <div className="campo">
          <label>Motivo de consulta</label>
          <div className="fila-checkboxes">
            {MOTIVOS.map((motivo) => (
              <label key={motivo.valor}>
                <input
                  type="checkbox"
                  checked={datos.motivos.includes(motivo.valor)}
                  onChange={() => alternarMotivo(motivo.valor)}
                />
                {motivo.etiqueta}
              </label>
            ))}
          </div>
        </div>

        <div className="campo">
          <label htmlFor="notas">Notas</label>
          <textarea
            id="notas"
            rows={3}
            value={datos.notas}
            onChange={(e) => actualizarCampo('notas', e.target.value)}
          />
        </div>

        {error && <p className="mensaje-error">{error}</p>}

        <div className="acciones-formulario">
          <button type="button" className="btn btn-secundario" onClick={() => navegar(-1)}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primario" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar paciente'}
          </button>
        </div>
      </form>
    </div>
  );
}
