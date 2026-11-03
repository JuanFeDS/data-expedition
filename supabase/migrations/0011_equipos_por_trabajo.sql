-- Equipos por trabajo: cada trabajo define el tamaño de sus equipos y el docente los
-- sortea (con ajuste manual después). Un estudiante está en un solo equipo por trabajo.

alter table public.trabajos add column if not exists tamano_equipo smallint check (tamano_equipo is null or tamano_equipo between 2 and 8);

create table public.equipos_trabajo (
  id uuid primary key default gen_random_uuid(),
  trabajo_id uuid not null references public.trabajos(id) on delete cascade,
  nombre text not null,
  creado_en timestamptz not null default now(),
  unique (trabajo_id, nombre)
);

create table public.miembros_equipo (
  equipo_id uuid not null references public.equipos_trabajo(id) on delete cascade,
  trabajo_id uuid not null references public.trabajos(id) on delete cascade,
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  primary key (equipo_id, perfil_id),
  unique (trabajo_id, perfil_id)
);

alter table public.equipos_trabajo enable row level security;
alter table public.miembros_equipo enable row level security;

create policy equipos_docente on public.equipos_trabajo for all using (public.es_docente()) with check (public.es_docente());
create policy miembros_docente on public.miembros_equipo for all using (public.es_docente()) with check (public.es_docente());
create policy miembros_propios on public.miembros_equipo for select using (perfil_id = (select auth.uid()));

-- Reparte al azar a los estudiantes matriculados en equipos del tamaño del trabajo
-- (los tamaños difieren como mucho en uno). Reemplaza los equipos que ya hubiera.
create or replace function public.sortear_equipos(p_trabajo uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_edicion uuid;
  v_tamano smallint;
  v_total integer;
  v_equipos integer;
  v_ids uuid[];
  i integer;
begin
  if not public.es_docente() then
    raise exception 'Solo el docente puede sortear equipos' using errcode = '42501';
  end if;
  select edicion_id, tamano_equipo into v_edicion, v_tamano from public.trabajos where id = p_trabajo;
  if v_edicion is null then
    raise exception 'El trabajo no existe';
  end if;
  if v_tamano is null then
    raise exception 'El trabajo no es por equipos';
  end if;

  select array_agg(m.perfil_id order by random()) into v_ids
  from public.matriculas m join public.perfiles p on p.id = m.perfil_id
  where m.edicion_id = v_edicion and p.rol = 'estudiante';
  v_total := coalesce(array_length(v_ids, 1), 0);
  if v_total = 0 then
    raise exception 'No hay estudiantes en el curso';
  end if;

  delete from public.equipos_trabajo where trabajo_id = p_trabajo;
  v_equipos := ceil(v_total::numeric / v_tamano);

  for i in 1..v_equipos loop
    insert into public.equipos_trabajo (trabajo_id, nombre) values (p_trabajo, 'Equipo ' || i);
  end loop;

  insert into public.miembros_equipo (equipo_id, trabajo_id, perfil_id)
  select e.id, p_trabajo, u.perfil_id
  from unnest(v_ids) with ordinality as u(perfil_id, posicion)
  join public.equipos_trabajo e on e.trabajo_id = p_trabajo and e.nombre = 'Equipo ' || (((u.posicion - 1) % v_equipos) + 1);

  return v_equipos;
end;
$$;

-- El equipo de quien llama en un trabajo, con los nombres de sus integrantes.
create or replace function public.mi_equipo(p_trabajo uuid)
returns table (equipo text, nombre text, usuario text, soy_yo boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select e.nombre, coalesce(p.nombre, p.correo), p.usuario, p.id = (select auth.uid())
  from public.miembros_equipo mine
  join public.equipos_trabajo e on e.id = mine.equipo_id
  join public.miembros_equipo todos on todos.equipo_id = e.id
  join public.perfiles p on p.id = todos.perfil_id
  where mine.trabajo_id = p_trabajo and mine.perfil_id = (select auth.uid())
  order by (p.id = (select auth.uid())) desc, p.nombre;
$$;

revoke all on function public.sortear_equipos(uuid), public.mi_equipo(uuid) from public, anon;
grant execute on function public.sortear_equipos(uuid), public.mi_equipo(uuid) to authenticated;
