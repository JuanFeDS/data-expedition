create type public.rol_usuario as enum ('docente', 'estudiante', 'observador');
create type public.modo_ia as enum ('con_ia', 'sin_ia');
create type public.estado_entrega as enum ('borrador', 'entregada', 'calificada', 'no_presento');
create type public.fuente_evidencia as enum ('diagnostico_inicial', 'trabajo', 'leccion', 'diagnostico_final');

create table public.ediciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  periodo text,
  es_plantilla boolean not null default false,
  plantilla_origen_id uuid references public.ediciones (id),
  minimo_anonimato integer not null default 5 check (minimo_anonimato >= 1),
  creada_en timestamptz not null default now()
);

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  correo text not null,
  rol public.rol_usuario not null default 'estudiante',
  creado_en timestamptz not null default now()
);

create table public.grupos (
  id uuid primary key default gen_random_uuid(),
  edicion_id uuid not null references public.ediciones (id) on delete cascade,
  nombre text not null,
  unique (edicion_id, nombre)
);

create table public.matriculas (
  perfil_id uuid not null references public.perfiles (id) on delete cascade,
  edicion_id uuid not null references public.ediciones (id) on delete cascade,
  grupo_id uuid references public.grupos (id) on delete set null,
  primary key (perfil_id, edicion_id)
);

create table public.dimensiones (
  id uuid primary key default gen_random_uuid(),
  edicion_id uuid not null references public.ediciones (id) on delete cascade,
  nombre text not null,
  descripcion text,
  orden integer not null default 0,
  unique (edicion_id, nombre)
);

create table public.trabajos (
  id uuid primary key default gen_random_uuid(),
  edicion_id uuid not null references public.ediciones (id) on delete cascade,
  nombre text not null,
  semana integer,
  es_diagnostico boolean not null default false,
  por_equipo boolean not null default false
);

create table public.criterios (
  id uuid primary key default gen_random_uuid(),
  trabajo_id uuid not null references public.trabajos (id) on delete cascade,
  dimension_id uuid not null references public.dimensiones (id) on delete restrict,
  modo_ia public.modo_ia not null,
  nombre text not null,
  peso numeric(5, 2) not null default 1 check (peso > 0),
  descriptor_nivel_1 text not null,
  descriptor_nivel_2 text not null,
  descriptor_nivel_3 text not null,
  descriptor_nivel_4 text not null,
  descriptor_nivel_5 text not null
);

create table public.entregas (
  id uuid primary key default gen_random_uuid(),
  trabajo_id uuid not null references public.trabajos (id) on delete cascade,
  perfil_id uuid not null references public.perfiles (id) on delete cascade,
  modo_ia public.modo_ia not null,
  bitacora text,
  estado public.estado_entrega not null default 'borrador',
  nota numeric(2, 1) check (nota between 1 and 5),
  entregada_en timestamptz,
  unique (trabajo_id, perfil_id),
  check (modo_ia = 'sin_ia' or bitacora is not null or estado in ('borrador', 'no_presento'))
);

create table public.calificaciones (
  id uuid primary key default gen_random_uuid(),
  entrega_id uuid not null references public.entregas (id) on delete cascade,
  criterio_id uuid not null references public.criterios (id) on delete restrict,
  nivel numeric(2, 1) not null check (nivel between 1 and 5 and (nivel * 2) = trunc(nivel * 2)),
  comentario text,
  unique (entrega_id, criterio_id)
);

create table public.evidencias_radar (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfiles (id) on delete cascade,
  dimension_id uuid not null references public.dimensiones (id) on delete cascade,
  fuente public.fuente_evidencia not null,
  valor numeric(5, 2) not null check (valor between 0 and 100),
  peso numeric(5, 2) not null default 1 check (peso > 0),
  entrega_id uuid references public.entregas (id) on delete set null,
  creada_en timestamptz not null default now()
);

create index on public.matriculas (edicion_id);
create index on public.entregas (perfil_id);
create index on public.calificaciones (entrega_id);
create index on public.evidencias_radar (perfil_id, dimension_id);

-- El rol vive en perfiles (no en user_metadata, que el usuario puede editar).
-- Las funciones son security definer para que las políticas no recursen sobre perfiles.
create function public.rol_actual() returns public.rol_usuario
language sql stable security definer set search_path = ''
as $$ select rol from public.perfiles where id = (select auth.uid()) $$;

create function public.es_docente() returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce((select rol from public.perfiles where id = (select auth.uid())) = 'docente', false) $$;

create function public.en_edicion(p_edicion uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.matriculas
    where edicion_id = p_edicion and perfil_id = (select auth.uid())
  )
$$;

create function public.edicion_de_trabajo(p_trabajo uuid) returns uuid
language sql stable security definer set search_path = ''
as $$ select edicion_id from public.trabajos where id = p_trabajo $$;

create function public.propietario_de_entrega(p_entrega uuid) returns uuid
language sql stable security definer set search_path = ''
as $$ select perfil_id from public.entregas where id = p_entrega $$;

create function public.crear_perfil_al_registrarse() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.perfiles (id, correo, rol) values (new.id, new.email, 'estudiante');
  return new;
end;
$$;

create trigger al_crear_usuario
after insert on auth.users
for each row execute function public.crear_perfil_al_registrarse();

create function public.asignar_rol(p_perfil uuid, p_rol public.rol_usuario) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.es_docente() then
    raise exception 'Solo el docente puede asignar roles';
  end if;
  update public.perfiles set rol = p_rol where id = p_perfil;
end;
$$;

revoke execute on function public.asignar_rol(uuid, public.rol_usuario) from public, anon;
grant execute on function public.asignar_rol(uuid, public.rol_usuario) to authenticated;
revoke execute on function public.crear_perfil_al_registrarse() from public, anon, authenticated;

alter table public.ediciones enable row level security;
alter table public.perfiles enable row level security;
alter table public.grupos enable row level security;
alter table public.matriculas enable row level security;
alter table public.dimensiones enable row level security;
alter table public.trabajos enable row level security;
alter table public.criterios enable row level security;
alter table public.entregas enable row level security;
alter table public.calificaciones enable row level security;
alter table public.evidencias_radar enable row level security;

-- Un estudiante solo puede cambiar su nombre; el rol se asigna con asignar_rol().
revoke update on public.perfiles from authenticated;
grant update (nombre) on public.perfiles to authenticated;

create policy perfiles_leer on public.perfiles for select to authenticated
  using (id = (select auth.uid()) or public.es_docente());
create policy perfiles_actualizar on public.perfiles for update to authenticated
  using (id = (select auth.uid()) or public.es_docente())
  with check (id = (select auth.uid()) or public.es_docente());

create policy ediciones_leer on public.ediciones for select to authenticated
  using (public.es_docente() or public.en_edicion(id));
create policy ediciones_docente on public.ediciones for all to authenticated
  using (public.es_docente()) with check (public.es_docente());

create policy grupos_leer on public.grupos for select to authenticated
  using (public.es_docente() or public.en_edicion(edicion_id));
create policy grupos_docente on public.grupos for all to authenticated
  using (public.es_docente()) with check (public.es_docente());

create policy matriculas_leer on public.matriculas for select to authenticated
  using (perfil_id = (select auth.uid()) or public.es_docente());
create policy matriculas_docente on public.matriculas for all to authenticated
  using (public.es_docente()) with check (public.es_docente());

create policy dimensiones_leer on public.dimensiones for select to authenticated
  using (public.es_docente() or public.en_edicion(edicion_id));
create policy dimensiones_docente on public.dimensiones for all to authenticated
  using (public.es_docente()) with check (public.es_docente());

create policy trabajos_leer on public.trabajos for select to authenticated
  using (public.es_docente() or public.en_edicion(edicion_id));
create policy trabajos_docente on public.trabajos for all to authenticated
  using (public.es_docente()) with check (public.es_docente());

create policy criterios_leer on public.criterios for select to authenticated
  using (public.es_docente() or public.en_edicion(public.edicion_de_trabajo(trabajo_id)));
create policy criterios_docente on public.criterios for all to authenticated
  using (public.es_docente()) with check (public.es_docente());

create policy entregas_leer on public.entregas for select to authenticated
  using (perfil_id = (select auth.uid()) or public.es_docente());
create policy entregas_crear on public.entregas for insert to authenticated
  with check (
    perfil_id = (select auth.uid())
    and estado in ('borrador', 'entregada')
    and nota is null
    and public.en_edicion(public.edicion_de_trabajo(trabajo_id))
  );
create policy entregas_editar on public.entregas for update to authenticated
  using (perfil_id = (select auth.uid()) and estado in ('borrador', 'entregada'))
  with check (perfil_id = (select auth.uid()) and estado in ('borrador', 'entregada') and nota is null);
create policy entregas_docente on public.entregas for all to authenticated
  using (public.es_docente()) with check (public.es_docente());

create policy calificaciones_leer on public.calificaciones for select to authenticated
  using (public.propietario_de_entrega(entrega_id) = (select auth.uid()) or public.es_docente());
create policy calificaciones_docente on public.calificaciones for all to authenticated
  using (public.es_docente()) with check (public.es_docente());

-- evidencias_radar solo se escribe desde el servidor (service role, que se salta RLS).
create policy evidencias_leer on public.evidencias_radar for select to authenticated
  using (perfil_id = (select auth.uid()) or public.es_docente());

-- Observador: no tiene políticas sobre las tablas con datos de estudiantes.
-- Solo accede a estas funciones, que verifican el rol y ocultan grupos con pocas personas.
create function public.resumen_dimensiones_por_grupo(p_edicion uuid)
returns table (grupo text, dimension text, personas integer, promedio numeric)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_minimo integer;
begin
  if public.rol_actual() not in ('observador', 'docente') then
    raise exception 'Sin acceso';
  end if;
  select minimo_anonimato into v_minimo from public.ediciones where id = p_edicion;

  return query
  with por_persona as (
    select m.grupo_id, e.dimension_id, e.perfil_id,
           sum(e.valor * e.peso) / sum(e.peso) as valor
    from public.evidencias_radar e
    join public.matriculas m on m.perfil_id = e.perfil_id and m.edicion_id = p_edicion
    join public.dimensiones d on d.id = e.dimension_id and d.edicion_id = p_edicion
    group by m.grupo_id, e.dimension_id, e.perfil_id
  )
  select g.nombre, d.nombre, count(*)::integer, round(avg(pp.valor), 2)
  from por_persona pp
  join public.grupos g on g.id = pp.grupo_id
  join public.dimensiones d on d.id = pp.dimension_id
  group by g.nombre, d.nombre
  having count(*) >= v_minimo;
end;
$$;

create function public.resumen_trabajos_por_grupo(p_edicion uuid)
returns table (grupo text, trabajo text, personas integer, nota_promedio numeric)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_minimo integer;
begin
  if public.rol_actual() not in ('observador', 'docente') then
    raise exception 'Sin acceso';
  end if;
  select minimo_anonimato into v_minimo from public.ediciones where id = p_edicion;

  return query
  select g.nombre, t.nombre, count(*)::integer, round(avg(en.nota), 1)
  from public.entregas en
  join public.trabajos t on t.id = en.trabajo_id and t.edicion_id = p_edicion
  join public.matriculas m on m.perfil_id = en.perfil_id and m.edicion_id = p_edicion
  join public.grupos g on g.id = m.grupo_id
  where en.estado = 'calificada'
  group by g.nombre, t.nombre
  having count(*) >= v_minimo;
end;
$$;

revoke execute on function public.resumen_dimensiones_por_grupo(uuid) from public, anon;
revoke execute on function public.resumen_trabajos_por_grupo(uuid) from public, anon;
grant execute on function public.resumen_dimensiones_por_grupo(uuid) to authenticated;
grant execute on function public.resumen_trabajos_por_grupo(uuid) to authenticated;
revoke execute on function public.rol_actual() from public, anon;
revoke execute on function public.es_docente() from public, anon;
revoke execute on function public.en_edicion(uuid) from public, anon;
revoke execute on function public.edicion_de_trabajo(uuid) from public, anon;
revoke execute on function public.propietario_de_entrega(uuid) from public, anon;
grant execute on function public.rol_actual() to authenticated;
grant execute on function public.es_docente() to authenticated;
grant execute on function public.en_edicion(uuid) to authenticated;
grant execute on function public.edicion_de_trabajo(uuid) to authenticated;
grant execute on function public.propietario_de_entrega(uuid) to authenticated;
