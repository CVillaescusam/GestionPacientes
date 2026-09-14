-- =====================================================================
-- ESQUEMA DE BASE DE DATOS · Gestión de Pacientes
-- =====================================================================
-- Cómo usarlo: Supabase -> tu proyecto -> "SQL Editor" -> "New query"
-- Pega TODO este archivo y dale a "Run". Se puede ejecutar de una vez,
-- crea las 4 tablas, sus índices, la seguridad (RLS) y un pequeño
-- automatismo para la fecha de actualización.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. PACIENTES
-- Un registro por paciente. "motivos" guarda uno o varios motivos de
-- consulta a la vez (ej. una paciente puede estar en embarazo Y suelo
-- pélvico). "user_id" es quién la dio de alta: así, si en el futuro
-- trabaja más de una profesional en la misma app, cada una solo ve
-- las suyas.
-- ---------------------------------------------------------------------
create table if not exists pacientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  telefono text,
  email text,
  fecha_nacimiento date,
  motivos text[] not null default '{}',
  fecha_alta date not null default current_date,
  activa boolean not null default true,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column pacientes.motivos is
  'Valores esperados: embarazo, posparto, preparacion_parto, suelo_pelvico, otro';

-- ---------------------------------------------------------------------
-- 2. VISITAS
-- El historial de citas de cada paciente. Sirve tanto para llevar
-- registro como para que la app sepa "cuánto hace que no viene".
-- ---------------------------------------------------------------------
create table if not exists visitas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  fecha date not null default current_date,
  tipo text not null default 'revision',
  notas text,
  created_at timestamptz not null default now()
);

comment on column visitas.tipo is
  'Valores esperados: primera_visita, revision, preparacion_parto, urgencia, otro';

-- ---------------------------------------------------------------------
-- 3. EMBARAZOS
-- Un registro por embarazo (si una paciente repite, tendrá varias filas
-- a lo largo del tiempo, pero solo una con estado = 'activo').
-- ---------------------------------------------------------------------
create table if not exists embarazos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  fecha_probable_parto date not null,
  fecha_ultima_revision date,
  preparacion_parto_iniciada boolean not null default false,
  estado text not null default 'activo' check (estado in ('activo', 'finalizado')),
  notas text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. POSTPARTOS
-- Igual que embarazos, pero para el seguimiento posterior al parto.
-- ---------------------------------------------------------------------
create table if not exists postpartos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references pacientes(id) on delete cascade,
  fecha_parto date not null,
  fecha_ultima_revision date,
  estado text not null default 'activo' check (estado in ('activo', 'finalizado')),
  notas text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ÍNDICES · para que las consultas de la app vayan rápidas
-- ---------------------------------------------------------------------
create index if not exists idx_pacientes_user on pacientes(user_id);
create index if not exists idx_visitas_paciente on visitas(paciente_id);
create index if not exists idx_embarazos_paciente on embarazos(paciente_id);
create index if not exists idx_postpartos_paciente on postpartos(paciente_id);

-- ---------------------------------------------------------------------
-- AUTOMATISMO · actualizar "updated_at" solo cuando se edita una paciente
-- ---------------------------------------------------------------------
create or replace function actualizar_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_pacientes_updated_at on pacientes;
create trigger trigger_pacientes_updated_at
  before update on pacientes
  for each row
  execute function actualizar_updated_at();

-- =====================================================================
-- SEGURIDAD (Row Level Security)
-- Cada fila queda ligada, directa o indirectamente, a "user_id".
-- Así, aunque la clave "anon" es pública, cada profesional solo puede
-- leer y modificar SUS PROPIAS pacientes, nunca las de otra cuenta.
-- =====================================================================
alter table pacientes enable row level security;
alter table visitas enable row level security;
alter table embarazos enable row level security;
alter table postpartos enable row level security;

-- Pacientes: acceso directo por user_id
create policy "pacientes_select_propias" on pacientes
  for select using (auth.uid() = user_id);
create policy "pacientes_insert_propias" on pacientes
  for insert with check (auth.uid() = user_id);
create policy "pacientes_update_propias" on pacientes
  for update using (auth.uid() = user_id);
create policy "pacientes_delete_propias" on pacientes
  for delete using (auth.uid() = user_id);

-- Visitas: acceso a través de la paciente a la que pertenecen
create policy "visitas_select_propias" on visitas
  for select using (exists (
    select 1 from pacientes p where p.id = visitas.paciente_id and p.user_id = auth.uid()
  ));
create policy "visitas_insert_propias" on visitas
  for insert with check (exists (
    select 1 from pacientes p where p.id = visitas.paciente_id and p.user_id = auth.uid()
  ));
create policy "visitas_update_propias" on visitas
  for update using (exists (
    select 1 from pacientes p where p.id = visitas.paciente_id and p.user_id = auth.uid()
  ));
create policy "visitas_delete_propias" on visitas
  for delete using (exists (
    select 1 from pacientes p where p.id = visitas.paciente_id and p.user_id = auth.uid()
  ));

-- Embarazos: mismo patrón que visitas
create policy "embarazos_select_propios" on embarazos
  for select using (exists (
    select 1 from pacientes p where p.id = embarazos.paciente_id and p.user_id = auth.uid()
  ));
create policy "embarazos_insert_propios" on embarazos
  for insert with check (exists (
    select 1 from pacientes p where p.id = embarazos.paciente_id and p.user_id = auth.uid()
  ));
create policy "embarazos_update_propios" on embarazos
  for update using (exists (
    select 1 from pacientes p where p.id = embarazos.paciente_id and p.user_id = auth.uid()
  ));
create policy "embarazos_delete_propios" on embarazos
  for delete using (exists (
    select 1 from pacientes p where p.id = embarazos.paciente_id and p.user_id = auth.uid()
  ));

-- Postpartos: mismo patrón
create policy "postpartos_select_propios" on postpartos
  for select using (exists (
    select 1 from pacientes p where p.id = postpartos.paciente_id and p.user_id = auth.uid()
  ));
create policy "postpartos_insert_propios" on postpartos
  for insert with check (exists (
    select 1 from pacientes p where p.id = postpartos.paciente_id and p.user_id = auth.uid()
  ));
create policy "postpartos_update_propios" on postpartos
  for update using (exists (
    select 1 from pacientes p where p.id = postpartos.paciente_id and p.user_id = auth.uid()
  ));
create policy "postpartos_delete_propios" on postpartos
  for delete using (exists (
    select 1 from pacientes p where p.id = postpartos.paciente_id and p.user_id = auth.uid()
  ));
