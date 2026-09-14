# Cómo funcionan los avisos

Toda la lógica de avisos vive en un único archivo:
`src/utils/alertas.js`. Los números que usa (cuántos días, cuántas
semanas...) están todos separados en `src/config/alertasConfig.js`,
precisamente para que se puedan ajustar sin tener que entender ni tocar
el resto del código.

Cada aviso tiene un **nivel**, que es lo que decide el color con el que se
ve en la app:

- 🔴 **urgente** — requiere atención pronto
- 🟡 **atencion** — conviene vigilarlo
- 🔵 **info** — un aviso informativo, no urgente

## Reglas actuales

### 1. Paciente que hace tiempo que no viene

Se mira la fecha de su última visita (o su fecha de alta, si nunca ha
tenido ninguna).

- A partir de `DIAS_SIN_VISITA_ATENCION` (45 días por defecto) → aviso amarillo.
- A partir de `DIAS_SIN_VISITA_URGENTE` (90 días por defecto) → aviso rojo.

### 2. Revisión de embarazo pendiente

La app calcula la semana de embarazo a partir de la Fecha Probable de
Parto. Antes de la semana `SEMANA_EMBARAZO_REVISION_FRECUENTE` (36 por
defecto) espera una revisión cada `INTERVALO_REVISION_EMBARAZO_NORMAL_SEMANAS`
semanas (4 por defecto); a partir de esa semana, espera una cada
`INTERVALO_REVISION_EMBARAZO_FRECUENTE_SEMANAS` semana (1 por defecto).
Si se ha superado ese intervalo desde la última revisión registrada, avisa.

### 3. Preparación al parto

A partir de la semana `SEMANA_INICIO_PREPARACION_PARTO` (28 por defecto),
si todavía no se ha marcado "preparación al parto iniciada" en su ficha,
avisa para que se le proponga coger cita.

### 4. Revisar si ya ha dado a luz

Si el embarazo sigue "activo" a partir de la semana
`SEMANA_AVISO_REVISAR_ESTADO_EMBARAZO` (42 por defecto), es una señal de
que probablemente ya haya dado a luz y falte marcar el embarazo como
finalizado (y, si procede, iniciar su seguimiento posparto). Es un aviso
informativo, no una urgencia médica.

### 5. Seguimiento posparto

- Si no hay ninguna revisión registrada todavía y han pasado
  `DIAS_PRIMERA_REVISION_POSPARTO` días (40 por defecto) desde el parto → aviso rojo.
- Si ya hubo alguna revisión, y han pasado `DIAS_ENTRE_REVISIONES_POSPARTO`
  días (30 por defecto) desde la última → aviso amarillo.

## Cómo cambiar estos criterios

Abre `src/config/alertasConfig.js` y cambia el número que quieras. Por
ejemplo, para avisar de pacientes "perdidas" a los 30 días en vez de 45:

```js
DIAS_SIN_VISITA_ATENCION: 30,
```

Guarda el archivo y recarga la app: el cambio se aplica al momento, no hace
falta tocar nada más.

## Cómo añadir una regla nueva

Si en el futuro se quiere, por ejemplo, avisar de "revisión anual de suelo
pélvico", el patrón a seguir es:

1. Añadir el número que haga falta (ej. `DIAS_REVISION_SUELO_PELVICO`) en
   `alertasConfig.js`.
2. Escribir una función pequeña en `alertas.js`, siguiendo el estilo de
   `alertaSinVisitas` o `alertasPostparto`, que devuelva `{ nivel, mensaje }`.
3. Llamarla desde `calcularAlertasPaciente`.

Ninguna otra parte de la app necesita cambios: tanto el Dashboard como la
ficha de cada paciente muestran automáticamente cualquier alerta que
devuelva esta función.
