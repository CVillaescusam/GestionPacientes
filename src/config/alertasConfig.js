/**
 * CONFIGURACIÓN DE ALERTAS
 * ------------------------
 * Aquí se ajustan TODOS los números que usa la aplicación para decidir
 * cuándo avisar de algo. Si mañana se quiere avisar antes o después,
 * solo hay que cambiar un número aquí, no hace falta tocar el resto del código.
 */
export const CONFIG_ALERTAS = {
  // Pacientes en general (independientemente del motivo de consulta)
  // Días sin acudir a consulta a partir de los cuales se avisa "atención" y "urgente".
  DIAS_SIN_VISITA_ATENCION: 30,
  DIAS_SIN_VISITA_URGENTE: 90,

  // Embarazo
  // A partir de esta semana de embarazo, las revisiones deben ser más frecuentes.
  SEMANA_EMBARAZO_REVISION_FRECUENTE: 36,
  // Cada cuántas semanas se revisa antes/después de esa semana.
  INTERVALO_REVISION_EMBARAZO_NORMAL_SEMANAS: 4,
  INTERVALO_REVISION_EMBARAZO_FRECUENTE_SEMANAS: 1,
  // Semana a partir de la cual conviene citar para preparación al parto.
  SEMANA_INICIO_PREPARACION_PARTO: 28,
  // Semana en la que, si sigue "activo", probablemente haya que actualizar el estado
  // (ya debería haber dado a luz).
  SEMANA_AVISO_REVISAR_ESTADO_EMBARAZO: 42,

  // Posparto
  // Días tras el parto para la primera revisión recomendada.
  DIAS_PRIMERA_REVISION_POSPARTO: 40,
  // Cada cuántos días se revisa a partir de ahí.
  DIAS_ENTRE_REVISIONES_POSPARTO: 30,
};
