import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePacientesConAlertas } from '../hooks/usePacientesConAlertas';
import { MOTIVOS } from '../config/motivos';
import './ListaPacientes.css';

export default function ListaPacientes() {
  const { pacientes, cargando, error } = usePacientesConAlertas();
  const [busqueda, setBusqueda] = useState('');
  const [motivoFiltro, setMotivoFiltro] = useState('todos');

  const pacientesFiltradas = useMemo(() => {
    return pacientes.filter((paciente) => {
      const coincideNombre = paciente.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideMotivo = motivoFiltro === 'todos' || paciente.motivos?.includes(motivoFiltro);
      return coincideNombre && coincideMotivo;
    });
  }, [pacientes, busqueda, motivoFiltro]);

  if (cargando) return <p>Cargando pacientes...</p>;
  if (error) return <p className="mensaje-error">Error al cargar: {error}</p>;

  return (
    <div>
      <div className="cabecera-lista">
        <div>
          <h1>Pacientes</h1>
          <p>{pacientes.length} pacientes registradas</p>
        </div>
        <Link to="/pacientes/nueva" className="btn btn-primario">
          + Nueva paciente
        </Link>
      </div>

      <div className="filtros-lista">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-busqueda"
        />
        <select value={motivoFiltro} onChange={(e) => setMotivoFiltro(e.target.value)}>
          <option value="todos">Todos los motivos</option>
          {MOTIVOS.map((motivo) => (
            <option key={motivo.valor} value={motivo.valor}>
              {motivo.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {pacientesFiltradas.length === 0 ? (
        <div className="tarjeta estado-vacio">
          <p>No se ha encontrado ninguna paciente con ese filtro.</p>
        </div>
      ) : (
        <div className="tarjeta tabla-pacientes">
          {pacientesFiltradas.map((paciente) => (
            <Link to={`/pacientes/${paciente.id}`} key={paciente.id} className="fila-paciente">
              <span className={`punto-estado punto-${paciente.nivelAlerta}`} title="Estado de seguimiento" />
              <span className="celda-nombre">{paciente.nombre}</span>
              <span className="celda-motivos">
                {paciente.motivos?.map((valorMotivo) => (
                  <span
                    key={valorMotivo}
                    className={`etiqueta ${valorMotivo === 'embarazo' ? 'etiqueta-embarazo' : ''}`}
                  >
                    {MOTIVOS.find((m) => m.valor === valorMotivo)?.etiqueta ?? valorMotivo}
                  </span>
                ))}
              </span>
              <span className="celda-avisos">
                {paciente.alertas.length > 0 ? `${paciente.alertas.length} aviso(s)` : 'Sin avisos'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
