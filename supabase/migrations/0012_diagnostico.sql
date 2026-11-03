-- Diagnóstico de entrada: autoinforme del estudiante, resultado con IA y sin IA que registra
-- el docente por dimensión, y la ruta del curso. El valor sin IA (o el de con IA si no hay)
-- alimenta además evidencias_radar como 'diagnostico_inicial', el punto de partida del radar.

alter table public.ediciones add column if not exists ruta_curso text check (ruta_curso is null or ruta_curso in ('nivelacion', 'estandar', 'profundizacion'));

create table public.diagnosticos (
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  dimension_id uuid not null references public.dimensiones(id) on delete cascade,
  autoinforme smallint check (autoinforme is null or autoinforme between 1 and 5),
  con_ia numeric check (con_ia is null or con_ia between 0 and 100),
  sin_ia numeric check (sin_ia is null or sin_ia between 0 and 100),
  actualizado_en timestamptz not null default now(),
  primary key (perfil_id, dimension_id)
);

alter table public.diagnosticos enable row level security;

create policy diagnosticos_docente on public.diagnosticos for all using (public.es_docente()) with check (public.es_docente());
create policy diagnosticos_propios on public.diagnosticos for select using (perfil_id = (select auth.uid()));

-- p_valores: [{"dimension_id": uuid, "autoinforme": 1-5}]
create or replace function public.guardar_autoinforme(p_valores jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_yo uuid := (select auth.uid());
begin
  if v_yo is null then
    raise exception 'Sin sesión' using errcode = '42501';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p_valores) as v(dimension_id uuid)
    left join public.dimensiones d on d.id = v.dimension_id and public.en_edicion(d.edicion_id)
    where d.id is null
  ) then
    raise exception 'Hay dimensiones que no son de tu curso' using errcode = '42501';
  end if;
  insert into public.diagnosticos (perfil_id, dimension_id, autoinforme)
  select v_yo, v.dimension_id, v.autoinforme
  from jsonb_to_recordset(p_valores) as v(dimension_id uuid, autoinforme smallint)
  on conflict (perfil_id, dimension_id) do update set autoinforme = excluded.autoinforme, actualizado_en = now();
end;
$$;

-- p_valores: [{"dimension_id": uuid, "con_ia": 0-100, "sin_ia": 0-100}] de un estudiante.
create or replace function public.registrar_diagnostico(p_perfil uuid, p_valores jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.es_docente() then
    raise exception 'Solo el docente puede registrar el diagnóstico' using errcode = '42501';
  end if;

  insert into public.diagnosticos (perfil_id, dimension_id, con_ia, sin_ia)
  select p_perfil, v.dimension_id, v.con_ia, v.sin_ia
  from jsonb_to_recordset(p_valores) as v(dimension_id uuid, con_ia numeric, sin_ia numeric)
  on conflict (perfil_id, dimension_id) do update set con_ia = excluded.con_ia, sin_ia = excluded.sin_ia, actualizado_en = now();

  delete from public.evidencias_radar
  where perfil_id = p_perfil and fuente = 'diagnostico_inicial'
    and dimension_id in (select v.dimension_id from jsonb_to_recordset(p_valores) as v(dimension_id uuid));

  insert into public.evidencias_radar (perfil_id, dimension_id, fuente, valor, peso)
  select p_perfil, v.dimension_id, 'diagnostico_inicial', coalesce(v.sin_ia, v.con_ia), 1
  from jsonb_to_recordset(p_valores) as v(dimension_id uuid, con_ia numeric, sin_ia numeric)
  where coalesce(v.sin_ia, v.con_ia) is not null;
end;
$$;

revoke all on function public.guardar_autoinforme(jsonb), public.registrar_diagnostico(uuid, jsonb) from public, anon;
grant execute on function public.guardar_autoinforme(jsonb), public.registrar_diagnostico(uuid, jsonb) to authenticated;
