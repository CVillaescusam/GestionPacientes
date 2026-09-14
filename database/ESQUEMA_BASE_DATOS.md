# Esquema de la base de datos, explicado sin tecnicismos

La base de datos tiene 4 tablas. Puedes verlas y editarlas a mano en
cualquier momento desde Supabase → **Table Editor**.

## `pacientes`

Una fila = una paciente. Es la tabla principal.

| Columna | Qué guarda |
|---|---|
| `nombre` | Nombre completo |
| `telefono`, `email` | Contacto |
| `fecha_nacimiento` | Fecha de nacimiento |
| `motivos` | Uno o varios motivos de consulta a la vez (embarazo, posparto, preparación al parto, suelo pélvico, otro) |
| `fecha_alta` | Desde cuándo es paciente |
| `activa` | Si es `false`, se considera "dada de baja" y deja de generar avisos, pero no se borra su historial |
| `notas` | Cualquier anotación libre |

## `visitas`

Una fila = una cita/visita que ha tenido. Sirve como historial y para que
la app sepa cuánto tiempo lleva sin venir.

| Columna | Qué guarda |
|---|---|
| `paciente_id` | A qué paciente pertenece |
| `fecha` | Cuándo fue la visita |
| `tipo` | primera_visita / revision / preparacion_parto / urgencia / otro |
| `notas` | Anotación libre de esa visita |

## `embarazos`

Una fila = un embarazo. Si una paciente tiene más de un embarazo a lo largo
del tiempo con esta app, tendrá varias filas (una por embarazo), pero como
mucho una con `estado = 'activo'` a la vez.

| Columna | Qué guarda |
|---|---|
| `paciente_id` | A qué paciente pertenece |
| `fecha_probable_parto` | La FPP; con ella la app calcula en qué semana está |
| `fecha_ultima_revision` | Última vez que se revisó el embarazo |
| `preparacion_parto_iniciada` | Si ya ha empezado las clases/sesiones de preparación al parto |
| `estado` | `activo` o `finalizado` (se marca `finalizado` cuando da a luz) |

## `postpartos`

Una fila = un seguimiento posparto. Mismo patrón que `embarazos`.

| Columna | Qué guarda |
|---|---|
| `paciente_id` | A qué paciente pertenece |
| `fecha_parto` | Cuándo dio a luz |
| `fecha_ultima_revision` | Última revisión posparto |
| `estado` | `activo` o `finalizado` |

## ¿Por qué separar embarazo/posparto de la ficha principal?

Porque son procesos con fecha de inicio y fin: una paciente puede pasar por
varios embarazos, o dejar de necesitar seguimiento posparto y seguir siendo
paciente por otro motivo (por ejemplo suelo pélvico). Tenerlo en tablas
propias permite guardar el historial completo sin perder nada, y calcular
las alertas de cada proceso de forma independiente.
