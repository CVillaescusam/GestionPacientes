/**
 * Utilidades de fechas.
 * Todo en un solo sitio para no repetir cálculos de días/semanas por toda la app.
 */

const MS_POR_DIA = 1000 * 60 * 60 * 24;

/** Convierte un string "YYYY-MM-DD" (o null) a Date, sin problemas de huso horario. */
export function aFecha(fechaTexto) {
  if (!fechaTexto) return null;
  const [anio, mes, dia] = fechaTexto.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

/**
 * Días transcurridos entre dos fechas (positivo si "hasta" es posterior a "desde").
 * Se copian las fechas antes de tocarlas para no modificar por sorpresa
 * el objeto Date que nos pasó quien llama a la función.
 */
export function diasEntre(desde, hasta) {
  if (!desde || !hasta) return null;
  const inicioDesde = new Date(desde).setHours(0, 0, 0, 0);
  const inicioHasta = new Date(hasta).setHours(0, 0, 0, 0);
  return Math.round((inicioHasta - inicioDesde) / MS_POR_DIA);
}

/**
 * Calcula en qué semana de embarazo está la paciente a partir de la
 * Fecha Probable de Parto (FPP), que en obstetricia equivale a la
 * semana 40. Cuantas más semanas falten para la FPP, antes está el embarazo.
 */
export function calcularSemanaEmbarazo(fechaProbableParto, hoy = new Date()) {
  const fpp = aFecha(fechaProbableParto);
  if (!fpp) return null;
  const diasParaFPP = diasEntre(hoy, fpp);
  const semana = 40 - Math.floor(diasParaFPP / 7);
  return semana;
}

/** Formatea una fecha "YYYY-MM-DD" al formato español dd/mm/aaaa para mostrarla. */
export function formatearFecha(fechaTexto) {
  const fecha = aFecha(fechaTexto);
  if (!fecha) return '—';
  return fecha.toLocaleDateString('es-ES');
}
