import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { MOTIVOS } from '../config/motivos';
import { calcularAlertasPaciente } from '../utils/alertas';
import { formatearFecha } from '../utils/fechas';
import SeccionVisitas from './SeccionVisitas';
import SeccionEmbarazo from './SeccionEmbarazo';
import SeccionPostparto from './SeccionPostparto';
import './FichaPaciente.css';

export default function FichaPaciente() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [paciente, setPaciente] = useState(null);
  const [visitas, setVisitas] = useState([]);
  const [embarazoActivo, setEmbarazoActivo] = useState(null);
  const [postpartoActivo, setPostpartoActivo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState(null);

  const cargarTodo = useCallback(async () => {
    const [{ data: datosPaciente }, { data: datosVisitas }, { data: datosEmbarazos }, { data: datosPostpartos }] =
      await Promise.all([
        supabase.from('pacientes').select('*').eq('id', id).single(),
        supabase.from('visitas').select('*').eq('paciente_id', id),
        supabase.from('embarazos').select('*').eq('paciente_id', id).eq('estado', 'activo').maybeSingle(),
        supabase.from('postpartos').select('*').eq('paciente_id', id).eq('estado', 'activo').maybeSingle(),
      ]);

    setPaciente(datosPaciente);
    setVisitas(datosVisitas ?? []);
    setEmbarazoActivo(datosEmbarazos ?? null);
    setPostpartoActivo(datosPostpartos ?? null);
    setCargando(false);
  }, [id]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  function empezarEdicion() {
    setDatosEdicion({ ...paciente });
    setEditando(true);
  }

  function alternarMotivoEdicion(valorMotivo) {
    setDatosEdicion((anterior) => {
      const yaEstaba = anterior.motivos.includes(valorMotivo);
      const motivos = yaEstaba
        ? anterior.motivos.filter((m) => m !== valorMotivo)
        : [...anterior.motivos, valorMotivo];
      return { ...anterior, motivos };
    });
  }

  async function guardarEdicion(evento) {
    evento.preventDefault();
    const { nombre, telefono, email, fecha_nacimiento, motivos, notas } = datosEdicion;
    await supabase
      .from('pacientes')
      // Igual que en el alta: cadena vacía -> null para la fecha.
      .update({ nombre, telefono, email, fecha_nacimiento: fecha_nacimiento || null, motivos, notas })
      .eq('id', id);
    setEditando(false);
    cargarTodo();
  }

  async function alternarActiva() {
    await supabase.from('pacientes').update({ activa: !paciente.activa }).eq('id', id);
    cargarTodo();
  }

  if (cargando) return <p>Cargando ficha...</p>;
  if (!paciente) return <p>No se ha encontrado esta paciente.</p>;

  const alertas = calcularAlertasPaciente(paciente, { visitas, embarazoActivo, postpartoActivo });

  return (
    <div>
      <Link to="/pacientes" className="enlace-volver">
        ← Volver al listado
      </Link>

      <div className="cabecera-ficha">
        <div>
          <h1>{paciente.nombre}</h1>
          {!paciente.activa && <span className="etiqueta">Paciente inactiva</span>}
        </div>
        <div className="acciones-cabecera">
          <button className="btn btn-secundario" onClick={empezarEdicion}>
            Editar datos
          </button>
          <button className="btn btn-texto" onClick={alternarActiva}>
            {paciente.activa ? 'Dar de baja' : 'Reactivar'}
          </button>
        </div>
      </div>

      {alertas.length > 0 && (
        <div className="tarjeta bloque-alertas-ficha">
          {alertas.map((alerta, indice) => (
            <span key={indice} className={`badge-nivel badge-${alerta.nivel}`}>
              {alerta.mensaje}
            </span>
          ))}
        </div>
      )}

      {editando ? (
        <form className="tarjeta formulario-paciente" onSubmit={guardarEdicion}>
          <div className="campo">
            <label>Nombre completo</label>
            <input
              required
              value={datosEdicion.nombre}
              onChange={(e) => setDatosEdicion({ ...datosEdicion, nombre: e.target.value })}
            />
          </div>
          <div className="fila-dos-columnas">
            <div className="campo">
              <label>Teléfono</label>
              <input
                value={datosEdicion.telefono ?? ''}
                onChange={(e) => setDatosEdicion({ ...datosEdicion, telefono: e.target.value })}
              />
            </div>
            <div className="campo">
              <label>Email</label>
              <input
                value={datosEdicion.email ?? ''}
                onChange={(e) => setDatosEdicion({ ...datosEdicion, email: e.target.value })}
              />
            </div>
          </div>
          <div className="campo">
            <label>Fecha de nacimiento</label>
            <input
              type="date"
              value={datosEdicion.fecha_nacimiento ?? ''}
              onChange={(e) => setDatosEdicion({ ...datosEdicion, fecha_nacimiento: e.target.value })}
            />
          </div>
          <div className="campo">
            <label>Motivo de consulta</label>
            <div className="fila-checkboxes">
              {MOTIVOS.map((motivo) => (
                <label key={motivo.valor}>
                  <input
                    type="checkbox"
                    checked={datosEdicion.motivos.includes(motivo.valor)}
                    onChange={() => alternarMotivoEdicion(motivo.valor)}
                  />
                  {motivo.etiqueta}
                </label>
              ))}
            </div>
          </div>
          <div className="campo">
            <label>Notas</label>
            <textarea
              rows={3}
              value={datosEdicion.notas ?? ''}
              onChange={(e) => setDatosEdicion({ ...datosEdicion, notas: e.target.value })}
            />
          </div>
          <div className="acciones-formulario">
            <button type="button" className="btn btn-secundario" onClick={() => setEditando(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primario">
              Guardar cambios
            </button>
          </div>
        </form>
      ) : (
        <div className="tarjeta ficha-datos">
          <div>
            <span className="etiqueta-campo">Teléfono</span>
            <p>{paciente.telefono || '—'}</p>
          </div>
          <div>
            <span className="etiqueta-campo">Email</span>
            <p>{paciente.email || '—'}</p>
          </div>
          <div>
            <span className="etiqueta-campo">Fecha de nacimiento</span>
            <p>{formatearFecha(paciente.fecha_nacimiento)}</p>
          </div>
          <div>
            <span className="etiqueta-campo">Motivo de consulta</span>
            <p>
              {paciente.motivos?.map((valorMotivo) => (
                <span
                  key={valorMotivo}
                  className={`etiqueta ${valorMotivo === 'embarazo' ? 'etiqueta-embarazo' : ''}`}
                >
                  {MOTIVOS.find((m) => m.valor === valorMotivo)?.etiqueta ?? valorMotivo}
                </span>
              )) || '—'}
            </p>
          </div>
          {paciente.notas && (
            <div className="campo-ancho">
              <span className="etiqueta-campo">Notas</span>
              <p>{paciente.notas}</p>
            </div>
          )}
        </div>
      )}

      <SeccionEmbarazo pacienteId={id} embarazoActivo={embarazoActivo} onCambio={cargarTodo} />
      <SeccionPostparto pacienteId={id} postpartoActivo={postpartoActivo} onCambio={cargarTodo} />
      <SeccionVisitas pacienteId={id} visitas={visitas} onCambio={cargarTodo} />
    </div>
  );
}
