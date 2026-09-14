import { CONFIG_ALERTAS } from '../config/alertasConfig';
import { diasEntre, aFecha, calcularSemanaEmbarazo } from './fechas';

/**
 * Este archivo es el "cerebro" de los avisos de la app.
 * Sustituye a la idea original del Excel con colores: en vez de pintar
 * celdas a mano, aquí se decide con código cuándo una paciente necesita
 * atención, y con qué urgencia.
 *
 * Cada alerta tiene:
 *  - nivel: "urgente" (rojo), "atencion" (amarillo) o "info" (azul/gris)
 *  - mensaje: el texto que se le muestra a la fisioterapeuta
 */

/** Devuelve la fecha de la última visita registrada de una paciente (o null). */
function ultimaVisita(visitas) {
  if (!visitas || visitas.length === 0) return null;
  return visitas.reduce((masReciente, visita) =>
    !masReciente || visita.fecha > masReciente.fecha ? visita : masReciente
  );
}

/** Alerta genérica: "hace tiempo que no viene". Aplica a cualquier paciente activa. */
function alertaSinVisitas(paciente, visitas, hoy) {
  const visita = ultimaVisita(visitas);
  // Si nunca ha tenido visitas, se cuenta desde su fecha de alta.
  const fechaReferencia = visita ? aFecha(visita.fecha) : aFecha(paciente.fecha_alta);
  const dias = diasEntre(fechaReferencia, hoy);

  if (dias === null) return null;
  if (dias >= CONFIG_ALERTAS.DIAS_SIN_VISITA_URGENTE) {
    return { nivel: 'urgente', mensaje: `Hace ${dias} días que no acude a consulta` };
  }
  if (dias >= CONFIG_ALERTAS.DIAS_SIN_VISITA_ATENCION) {
    return { nivel: 'atencion', mensaje: `Hace ${dias} días que no coge cita, vigilar` };
  }
  return null;
}

/** Alertas específicas de un embarazo activo. */
function alertasEmbarazo(embarazo, hoy) {
  const alertas = [];
  const semana = calcularSemanaEmbarazo(embarazo.fecha_probable_parto, hoy);
  if (semana === null) return alertas;

  // 1. ¿Toca revisión según la semana en la que está?
  const revisionFrecuente = semana >= CONFIG_ALERTAS.SEMANA_EMBARAZO_REVISION_FRECUENTE;
  const intervaloSemanas = revisionFrecuente
    ? CONFIG_ALERTAS.INTERVALO_REVISION_EMBARAZO_FRECUENTE_SEMANAS
    : CONFIG_ALERTAS.INTERVALO_REVISION_EMBARAZO_NORMAL_SEMANAS;

  const fechaReferencia = embarazo.fecha_ultima_revision
    ? aFecha(embarazo.fecha_ultima_revision)
    : aFecha(embarazo.created_at?.slice(0, 10)) || hoy;
  const diasDesdeRevision = diasEntre(fechaReferencia, hoy);

  if (diasDesdeRevision !== null && diasDesdeRevision >= intervaloSemanas * 7) {
    alertas.push({
      nivel: revisionFrecuente ? 'urgente' : 'atencion',
      mensaje: `Semana ${semana} de embarazo: le toca revisión`,
    });
  }

  // 2. ¿Debería empezar a coger cita para preparación al parto?
  if (semana >= CONFIG_ALERTAS.SEMANA_INICIO_PREPARACION_PARTO && !embarazo.preparacion_parto_iniciada) {
    alertas.push({
      nivel: 'atencion',
      mensaje: `Semana ${semana}: coger cita para preparación al parto`,
    });
  }

  // 3. Si se ha pasado mucho de la fecha probable de parto, probablemente ya haya dado a luz.
  if (semana >= CONFIG_ALERTAS.SEMANA_AVISO_REVISAR_ESTADO_EMBARAZO) {
    alertas.push({
      nivel: 'info',
      mensaje: `Ya está en semana ${semana}: revisar si ha dado a luz y actualizar su ficha`,
    });
  }

  return alertas;
}

/** Alertas específicas de un posparto activo. */
function alertasPostparto(postparto, hoy) {
  const alertas = [];
  const fechaParto = aFecha(postparto.fecha_parto);
  const diasDesdeParto = diasEntre(fechaParto, hoy);
  if (diasDesdeParto === null) return alertas;

  if (!postparto.fecha_ultima_revision) {
    if (diasDesdeParto >= CONFIG_ALERTAS.DIAS_PRIMERA_REVISION_POSPARTO) {
      alertas.push({ nivel: 'urgente', mensaje: 'Toca primera revisión posparto' });
    }
    return alertas;
  }

  const diasDesdeRevision = diasEntre(aFecha(postparto.fecha_ultima_revision), hoy);
  if (diasDesdeRevision >= CONFIG_ALERTAS.DIAS_ENTRE_REVISIONES_POSPARTO) {
    alertas.push({ nivel: 'atencion', mensaje: 'Toca revisión de seguimiento posparto' });
  }

  return alertas;
}

/**
 * Función principal: recibe una paciente con sus datos relacionados
 * (visitas, embarazo activo, posparto activo) y devuelve la lista
 * completa de alertas que le corresponden hoy.
 */
export function calcularAlertasPaciente(paciente, { visitas = [], embarazoActivo, postpartoActivo }, hoy = new Date()) {
  if (!paciente.activa) return [];

  const alertas = [];

  const alertaGeneral = alertaSinVisitas(paciente, visitas, hoy);
  if (alertaGeneral) alertas.push(alertaGeneral);

  if (embarazoActivo) alertas.push(...alertasEmbarazo(embarazoActivo, hoy));
  if (postpartoActivo) alertas.push(...alertasPostparto(postpartoActivo, hoy));

  return alertas;
}

/** Devuelve el nivel más urgente de una lista de alertas (para pintar la fila/tarjeta). */
export function nivelMasUrgente(alertas) {
  if (alertas.some((a) => a.nivel === 'urgente')) return 'urgente';
  if (alertas.some((a) => a.nivel === 'atencion')) return 'atencion';
  if (alertas.some((a) => a.nivel === 'info')) return 'info';
  return 'ok';
}
