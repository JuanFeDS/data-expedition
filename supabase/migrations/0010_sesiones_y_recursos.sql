-- Calendario del curso (sesiones virtuales y presenciales) y material por sesión.

create type public.modalidad_sesion as enum ('virtual', 'presencial');
create type public.idioma_recurso as enum ('ES', 'EN');

create table public.sesiones (
  id uuid primary key default gen_random_uuid(),
  edicion_id uuid not null references public.ediciones(id) on delete cascade,
  codigo text not null check (length(trim(codigo)) > 0),
  semana integer check (semana is null or semana between 1 and 52),
  modalidad public.modalidad_sesion not null default 'virtual',
  inicia_en timestamptz,
  tema text not null check (length(trim(tema)) > 0),
  dinamica jsonb not null default '[]'::jsonb,
  creada_en timestamptz not null default now(),
  unique (edicion_id, codigo)
);
create index sesiones_edicion_idx on public.sesiones (edicion_id, inicia_en);

create table public.recursos (
  id uuid primary key default gen_random_uuid(),
  edicion_id uuid not null references public.ediciones(id) on delete cascade,
  sesion_id uuid references public.sesiones(id) on delete set null,
  titulo text not null check (length(trim(titulo)) > 0),
  enlace text,
  tipo text,
  idioma public.idioma_recurso not null default 'ES',
  gratis boolean not null default true,
  verificado_en timestamptz,
  resumen text,
  glosario text[] not null default '{}',
  creado_en timestamptz not null default now()
);
create index recursos_edicion_idx on public.recursos (edicion_id, sesion_id);

alter table public.sesiones enable row level security;
alter table public.recursos enable row level security;

create policy sesiones_docente on public.sesiones for all using (public.es_docente()) with check (public.es_docente());
create policy sesiones_leer on public.sesiones for select using (public.en_edicion(edicion_id));

create policy recursos_docente on public.recursos for all using (public.es_docente()) with check (public.es_docente());
create policy recursos_leer on public.recursos for select using (public.en_edicion(edicion_id));
