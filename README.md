# Gestión de Pacientes

Aplicación web privada para llevar en un solo sitio a todas tus pacientes
(sin importar de qué clínica vengan), con avisos automáticos de seguimiento:
quién hace tiempo que no viene, a quién le toca revisión de embarazo, quién
tiene que coger cita para preparación al parto o revisión posparto.

Sustituye a la idea del Excel con colores: aquí los "colores" (avisos) los
calcula la propia app cada vez que la abres, a partir de las fechas que
vayas registrando.

## Índice de la documentación

- Este archivo: instalación y visión general.
- `database/schema.sql` — el SQL para crear la base de datos en Supabase.
- `database/ESQUEMA_BASE_DATOS.md` — qué guarda cada tabla, explicado sin tecnicismos.
- `docs/FUNCIONAMIENTO_ALERTAS.md` — cómo decide la app cuándo avisar, y cómo cambiar esos criterios.

## Tecnologías usadas

| Parte | Tecnología | Por qué |
|---|---|---|
| Frontend | React + Vite | Rápido de arrancar, código organizado en componentes pequeños |
| Estilos | CSS puro con variables | Cero dependencias extra, fácil de tocar colores/tipografías desde un solo archivo (`src/index.css`) |
| Backend / base de datos | Supabase (Postgres + Auth) | Base de datos ya montada en la nube, con login incluido, sin tener que programar un servidor propio |
| Rutas | React Router | Navegación entre Avisos / Pacientes / Ficha de paciente |

No se ha usado ninguna librería de componentes (Material UI, Bootstrap...)
a propósito, para que el código sea fácil de leer y modificar sin tener que
aprender una librería nueva. Si en el futuro se quiere un diseño más
elaborado, la app es compatible con añadir Tailwind CSS sin reescribir nada.



 Estructura del proyecto

```
src/
├── components/       Cada pantalla y pieza visual (Dashboard, ficha de paciente...)
├── config/           Listas y umbrales configurables (motivos de consulta, alertas)
├── context/          Sesión de usuario (login) compartida por toda la app
├── hooks/            Lógica de acceso a datos reutilizable
├── utils/            Funciones puras (fechas, cálculo de alertas)
├── App.jsx           Define las rutas/páginas de la app
└── supabaseClient.js Conexión con Supabase
database/
├── schema.sql                 SQL para crear todo en Supabase
└── ESQUEMA_BASE_DATOS.md      Explicación de cada tabla
docs/
└── FUNCIONAMIENTO_ALERTAS.md  Cómo funcionan los avisos automáticos
```

