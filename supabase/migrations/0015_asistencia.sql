-- Asistencia por sesión con un código que rota cada 20 segundos. La semilla vive en una tabla
-- que solo lee el docente, así que el código solo se puede calcular desde el servidor.

create type public.estado_asistencia as enum ('presente', 'ausente', 'justificado');
create type public.origen_asistencia as enum ('codigo', 'manual');

create table public.sesiones_asistencia (
  sesion_id uuid primary key references public.sesiones(id) on delete cascade,
  semilla text not null,
  abierta boolean not null default true,
  abierta_en timestamptz not null default now()
);

create table public.asistencias (
  sesion_id uuid not null references public.sesiones(id) on delete cascade,
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  estado public.estado_asistencia not null,
  origen public.origen_asistencia not null,
  registrada_en timestamptz not null default now(),
  primary key (sesion_id, perfil_id)
);

alter table public.sesiones_asistencia enable row level security;
alter table public.asistencias enable row level security;

create policy sesiones_asistencia_docente on public.sesiones_asistencia for all using (public.es_docente()) with check (public.es_docente());
create policy asistencias_docente on public.asistencias for all using (public.es_docente()) with check (public.es_docente());
create policy asistencias_propias on public.asistencias for select using (perfil_id = (select auth.uid()));

create or replace function public.calcular_codigo_asistencia(p_semilla text, p_ventana bigint)
returns text
language sql
immutable
set search_path = ''
as $$ select upper(substr(md5(p_semilla || ':' || p_ventana::text), 1, 6)) $$;

create or replace function public.abrir_asistencia(p_sesion uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.es_docente() then
    raise exception 'Solo el docente puede abrir la asistencia' using errcode = '42501';
  end if;
  insert into public.sesiones_asistencia (sesion_id, semilla, abierta, abierta_en)
  values (p_sesion, gen_random_uuid()::text, true, now())
  on conflict (sesion_id) do update set semilla = excluded.semilla, abierta = true, abierta_en = now();
end;
$$;

create or replace function public.cerrar_asistencia(p_sesion uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.es_docente() then
    raise exception 'Solo el docente puede cerrar la asistencia' using errcode = '42501';
  end if;
  update public.sesiones_asistencia set abierta = false where sesion_id = p_sesion;
end;
$$;

-- Código vigente y segundos que le quedan, solo para el docente.
create or replace function public.codigo_asistencia(p_sesion uuid)
returns table (codigo text, segundos integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_semilla text;
  v_epoch bigint := floor(extract(epoch from now()))::bigint;
  v_ventana bigint := v_epoch / 20;
begin
  if not public.es_docente() then
    raise exception 'Solo el docente ve el código' using errcode = '42501';
  end if;
  select semilla into v_semilla from public.sesiones_asistencia where sesion_id = p_sesion and abierta;
  if v_semilla is null then
    raise exception 'La asistencia no está abierta';
  end if;
  return query select public.calcular_codigo_asistencia(v_semilla, v_ventana), (20 - (v_epoch % 20))::integer;
end;
$$;

-- Registra la asistencia de quien llama. Sin p_sesion, busca entre las sesiones abiertas del curso
-- la que coincide con el código. Acepta el código vigente y el anterior (margen de una ventana).
create or replace function public.registrar_asistencia(p_edicion uuid, p_codigo text, p_sesion uuid default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_yo uuid := (select auth.uid());
  v_ventana bigint := floor(extract(epoch from now()))::bigint / 20;
  v_fila record;
  v_encontrada uuid;
begin
  if v_yo is null or not public.en_edicion(p_edicion) then
    raise exception 'Sin acceso al curso' using errcode = '42501';
  end if;
  for v_fila in
    select a.sesion_id, a.semilla from public.sesiones_asistencia a join public.sesiones s on s.id = a.sesion_id
    where s.edicion_id = p_edicion and a.abierta and (p_sesion is null or a.sesion_id = p_sesion)
  loop
    if upper(trim(p_codigo)) in (public.calcular_codigo_asistencia(v_fila.semilla, v_ventana), public.calcular_codigo_asistencia(v_fila.semilla, v_ventana - 1)) then
      v_encontrada := v_fila.sesion_id;
      exit;
    end if;
  end loop;
  if v_encontrada is null then
    raise exception 'Código inválido o vencido';
  end if;
  insert into public.asistencias (sesion_id, perfil_id, estado, origen) values (v_encontrada, v_yo, 'presente', 'codigo')
  on conflict (sesion_id, perfil_id) do update set estado = 'presente', origen = 'codigo', registrada_en = now();
  return v_encontrada;
end;
$$;

revoke all on function public.calcular_codigo_asistencia(text, bigint), public.abrir_asistencia(uuid), public.cerrar_asistencia(uuid), public.codigo_asistencia(uuid), public.registrar_asistencia(uuid, text, uuid) from public, anon;
grant execute on function public.abrir_asistencia(uuid), public.cerrar_asistencia(uuid), public.codigo_asistencia(uuid), public.registrar_asistencia(uuid, text, uuid) to authenticated;
