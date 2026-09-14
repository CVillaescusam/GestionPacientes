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

## 1. Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com), crea una cuenta y un proyecto nuevo.
2. Dentro del proyecto, abre **SQL Editor** → **New query**.
3. Copia y pega todo el contenido de `database/schema.sql` y pulsa **Run**.
   Esto crea las 4 tablas, los índices y la seguridad (nadie puede ver los
   datos de otra persona, ni siquiera con la clave pública de la app).
4. Ve a **Authentication → Users → Add user** y crea el usuario con el que
   se va a entrar en la app (email + contraseña). No hace falta pantalla de
   registro: al ser una app de una sola profesional, el usuario se crea aquí
   una única vez.
5. Ve a **Settings → API** y copia:
   - **Project URL** 
   - **anon public key** 

## 2. Configurar el proyecto en tu ordenador (Visual Studio Code)

Necesitas tener [Node.js](https://nodejs.org) instalado (versión 18 o superior).

```bash
# 1. Abre la carpeta del proyecto en VS Code y abre una terminal (Ctrl + ñ)

# 2. Instala las dependencias
npm install

# 3. Crea tu archivo de variables de entorno
cp .env.example .env
```

Abre el `.env` recién creado y pega los datos del paso anterior:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-publica-anon
```

```bash
# 4. Arranca la app en modo desarrollo
npm run dev
```

Abre el enlace que aparece en la terminal (normalmente `http://localhost:5173`)
y entra con el usuario que creaste en el paso 4 de Supabase.

## 3. Estructura del proyecto

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

## 4. Cómo ampliar la app más adelante

- **Cambiar colores o tipografías**: todo está centralizado en
  `src/index.css`, en el bloque `:root` de arriba del todo.
- **Cambiar los motivos de consulta**: añade o quita líneas en
  `src/config/motivos.js`.
- **Cambiar cuándo avisa la app** (por ejemplo, avisar a los 30 días en vez
  de 45): edita los números en `src/config/alertasConfig.js`. Ver
  `docs/FUNCIONAMIENTO_ALERTAS.md` para el detalle de cada uno.
- **Notificaciones por email o WhatsApp**: la versión actual muestra los
  avisos dentro de la app (pantalla "Avisos"), que es lo más simple y
  rápido de tener funcionando. Si más adelante se quiere recibir un aviso
  fuera de la app, el siguiente paso natural es una "Edge Function" de
  Supabase programada para ejecutarse cada mañana, que revise las mismas
  reglas de `alertas.js` y envíe un email (por ejemplo con Resend). No está
  incluido en esta primera versión para no complicar ni retrasar la entrega.

## 5. Publicar la app en internet (opcional)

Para poder abrirla también desde el móvil sin tener el ordenador encendido,
se puede publicar gratis en [Vercel](https://vercel.com) o
[Netlify](https://netlify.com): conectas el repositorio de código y le
indicas las mismas dos variables de entorno del `.env`. Ambos detectan
automáticamente que es un proyecto Vite + React.
