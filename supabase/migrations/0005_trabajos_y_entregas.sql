-- Datos que el docente configura por trabajo y el enlace que entrega cada estudiante.
alter table public.trabajos
  add column tema text,
  add column vence_en timestamptz,
  add column min_pylint integer not null default 8 check (min_pylint between 0 and 10);

alter table public.entregas
  add column enlace_pr text check (enlace_pr is null or enlace_pr ~ '^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/pull/[0-9]+/?$');

create index on public.trabajos (edicion_id);
create index on public.entregas (trabajo_id);
