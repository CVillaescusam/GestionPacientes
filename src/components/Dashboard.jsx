import { Link } from 'react-router-dom';
import { usePacientesConAlertas } from '../hooks/usePacientesConAlertas';
import './Dashboard.css';

const ORDEN_NIVELES = { urgente: 0, atencion: 1, info: 2 };

export default function Dashboard() {
  const { pacientes, cargando, error } = usePacientesConAlertas();

  if (cargando) return <p>Cargando avisos...</p>;
  if (error) return <p className="mensaje-error">Error al cargar: {error}</p>;

  // Una fila por cada alerta individual (una paciente puede tener varias),
  // ordenadas para que lo más urgente aparezca siempre arriba.
  const filasDeAviso = pacientes
    .flatMap((paciente) => paciente.alertas.map((alerta) => ({ paciente, alerta })))
    .sort((a, b) => ORDEN_NIVELES[a.alerta.nivel] - ORDEN_NIVELES[b.alerta.nivel]);

  const totalUrgentes = filasDeAviso.filter((f) => f.alerta.nivel === 'urgente').length;
  const totalAtencion = filasDeAviso.filter((f) => f.alerta.nivel === 'atencion').length;

  return (
    <div>
      <h1>Avisos</h1>
      <p>Esto es lo que hoy necesita tu atención, calculado automáticamente.</p>

      <div className="resumen-avisos">
        <div className="tarjeta resumen-item">
          <span className="resumen-numero" style={{ color: 'var(--color-urgente)' }}>
            {totalUrgentes}
          </span>
          <span>Urgentes</span>
        </div>
        <div className="tarjeta resumen-item">
          <span className="resumen-numero" style={{ color: 'var(--color-atencion)' }}>
            {totalAtencion}
          </span>
          <span>Para vigilar</span>
        </div>
        <div className="tarjeta resumen-item">
          <span className="resumen-numero">{pacientes.length}</span>
          <span>Pacientes activas</span>
        </div>
      </div>

      {filasDeAviso.length === 0 ? (
        <div className="tarjeta estado-vacio">
          <p>No hay ningún aviso pendiente ahora mismo. Todo al día. 🎉</p>
        </div>
      ) : (
        <ul className="lista-avisos">
          {filasDeAviso.map(({ paciente, alerta }, indice) => (
            <li key={`${paciente.id}-${indice}`} className={`tarjeta fila-aviso fila-aviso-${alerta.nivel}`}>
              <div>
                <Link to={`/pacientes/${paciente.id}`} className="nombre-paciente-aviso">
                  {paciente.nombre}
                </Link>
                <p className="texto-aviso">{alerta.mensaje}</p>
              </div>
              <span className={`badge-nivel badge-${alerta.nivel}`}>
                {alerta.nivel === 'urgente' && 'Urgente'}
                {alerta.nivel === 'atencion' && 'Vigilar'}
                {alerta.nivel === 'info' && 'Info'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
