-- Un curso (fila de `ediciones`) invita a personas con su rol y grupo. Una persona puede estar
-- invitada a varios cursos. `correos_autorizados` queda solo para cuentas sin curso (por ejemplo el docente).
create table public.invitaciones (
  correo text not null check (correo = lower(correo)),
  edicion_id uuid not null references public.ediciones (id) on delete cascade,
  grupo_id uuid references public.grupos (id) on delete set null,
  rol public.rol_usuario not null default 'estudiante',
  creado_en timestamptz not null default now(),
  primary key (correo, edicion_id)
);

create index on public.invitaciones (edicion_id);
create index on public.invitaciones (grupo_id);

alter table public.invitaciones enable row level security;

create policy invitaciones_docente on public.invitaciones
  for all to authenticated
  using (public.es_docente()) with check (public.es_docente());

drop index if exists public.correos_autorizados_edicion_id_idx;
drop index if exists public.correos_autorizados_grupo_id_idx;
alter table public.correos_autorizados drop column edicion_id, drop column grupo_id;

create or replace function public.exigir_correo_autorizado() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.correos_autorizados where correo = lower(new.email))
     and not exists (select 1 from public.invitaciones where correo = lower(new.email)) then
    raise exception 'correo_no_autorizado';
  end if;
  return new;
end;
$$;

create or replace function public.crear_perfil_al_registrarse() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_rol public.rol_usuario;
begin
  select rol into v_rol from public.correos_autorizados where correo = lower(new.email);
  if v_rol is null then
    select rol into v_rol from public.invitaciones where correo = lower(new.email) order by creado_en limit 1;
  end if;

  insert into public.perfiles (id, correo, rol) values (new.id, new.email, coalesce(v_rol, 'estudiante'));

  insert into public.matriculas (perfil_id, edicion_id, grupo_id)
  select new.id, i.edicion_id, (select g.id from public.grupos g where g.id = i.grupo_id and g.edicion_id = i.edicion_id)
  from public.invitaciones i
  where i.correo = lower(new.email);
  return new;
end;
$$;
