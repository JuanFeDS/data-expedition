-- Práctica tipo Duolingo: banco de preguntas por dimensión y dificultad, sesiones de práctica
-- con su XP, y una evidencia pequeña para el radar con tope semanal. El XP no es nota.

create type public.dificultad_pregunta as enum ('base', 'estandar', 'reto');
create type public.formato_pregunta as enum ('opciones', 'vf', 'unir', 'ordenar', 'completar');

create table public.banco_preguntas (
  id uuid primary key default gen_random_uuid(),
  edicion_id uuid not null references public.ediciones(id) on delete cascade,
  dimension_id uuid not null references public.dimensiones(id) on delete cascade,
  dificultad public.dificultad_pregunta not null default 'estandar',
  formato public.formato_pregunta not null,
  contenido jsonb not null,
  explicacion text not null default '',
  activa boolean not null default true,
  creada_en timestamptz not null default now()
);
create index banco_preguntas_idx on public.banco_preguntas (edicion_id, dimension_id, dificultad) where activa;

create table public.practica_sesiones (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  edicion_id uuid not null references public.ediciones(id) on delete cascade,
  aciertos smallint not null check (aciertos >= 0),
  total smallint not null check (total > 0 and aciertos <= total),
  xp integer not null check (xp >= 0),
  terminada_en timestamptz not null default now()
);
create index practica_sesiones_perfil_idx on public.practica_sesiones (perfil_id, terminada_en desc);

create table public.practica_respuestas (
  sesion_id uuid not null references public.practica_sesiones(id) on delete cascade,
  pregunta_id uuid not null references public.banco_preguntas(id) on delete cascade,
  primer_intento boolean not null,
  primary key (sesion_id, pregunta_id)
);

alter table public.banco_preguntas enable row level security;
alter table public.practica_sesiones enable row level security;
alter table public.practica_respuestas enable row level security;

create policy banco_docente on public.banco_preguntas for all using (public.es_docente()) with check (public.es_docente());
create policy banco_leer on public.banco_preguntas for select using (activa and public.en_edicion(edicion_id));

create policy practica_sesiones_docente on public.practica_sesiones for select using (public.es_docente());
create policy practica_sesiones_propias on public.practica_sesiones for select using (perfil_id = (select auth.uid()));

create policy practica_respuestas_docente on public.practica_respuestas for select using (public.es_docente());
create policy practica_respuestas_propias on public.practica_respuestas for select using (
  exists (select 1 from public.practica_sesiones s where s.id = sesion_id and s.perfil_id = (select auth.uid()))
);

-- p_respuestas: [{"pregunta_id": uuid, "primer_intento": bool}]. Registra la sesión (30 XP por
-- sesión completada) y deja una evidencia 'leccion' ligera por dimensión, con tope de 5 por semana.
create or replace function public.terminar_practica(p_edicion uuid, p_respuestas jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_yo uuid := (select auth.uid());
  v_sesion uuid;
  v_total integer;
  v_aciertos integer;
  v_xp constant integer := 30;
  v_inicio_semana timestamptz := date_trunc('week', now());
  v_dim record;
begin
  if v_yo is null or not public.en_edicion(p_edicion) then
    raise exception 'Sin acceso al curso' using errcode = '42501';
  end if;

  if jsonb_array_length(p_respuestas) = 0 then
    raise exception 'La sesión no tiene respuestas';
  end if;

  if exists (
    select 1 from jsonb_to_recordset(p_respuestas) as r(pregunta_id uuid)
    left join public.banco_preguntas b on b.id = r.pregunta_id and b.edicion_id = p_edicion
    where b.id is null
  ) then
    raise exception 'Hay preguntas que no son de este curso';
  end if;

  select count(*), count(*) filter (where r.primer_intento) into v_total, v_aciertos
  from jsonb_to_recordset(p_respuestas) as r(pregunta_id uuid, primer_intento boolean);

  insert into public.practica_sesiones (perfil_id, edicion_id, aciertos, total, xp) values (v_yo, p_edicion, v_aciertos, v_total, v_xp) returning id into v_sesion;

  insert into public.practica_respuestas (sesion_id, pregunta_id, primer_intento)
  select v_sesion, r.pregunta_id, r.primer_intento from jsonb_to_recordset(p_respuestas) as r(pregunta_id uuid, primer_intento boolean)
  on conflict do nothing;

  for v_dim in
    select b.dimension_id, round(100.0 * count(*) filter (where r.primer_intento) / count(*), 1) as valor
    from jsonb_to_recordset(p_respuestas) as r(pregunta_id uuid, primer_intento boolean)
    join public.banco_preguntas b on b.id = r.pregunta_id
    group by b.dimension_id
  loop
    if (select count(*) from public.evidencias_radar e where e.perfil_id = v_yo and e.dimension_id = v_dim.dimension_id and e.fuente = 'leccion' and e.creada_en >= v_inicio_semana) < 5 then
      insert into public.evidencias_radar (perfil_id, dimension_id, fuente, valor, peso) values (v_yo, v_dim.dimension_id, 'leccion', v_dim.valor, 0.25);
    end if;
  end loop;

  return jsonb_build_object('sesion_id', v_sesion, 'xp', v_xp, 'aciertos', v_aciertos, 'total', v_total);
end;
$$;

revoke all on function public.terminar_practica(uuid, jsonb) from public, anon;
grant execute on function public.terminar_practica(uuid, jsonb) to authenticated;
