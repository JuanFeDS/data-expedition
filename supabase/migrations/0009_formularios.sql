-- Formularios: un solo módulo para relámpagos, votaciones y encuestas.
-- La clave de las respuestas correctas vive aparte para que nunca viaje al estudiante.
-- La participación (quién respondió) se guarda separada de las respuestas: en una
-- encuesta anónima las respuestas no llevan perfil y no se pueden ligar a nadie.

create type public.tipo_formulario as enum ('relampago', 'votacion', 'encuesta');
create type public.estado_formulario as enum ('borrador', 'abierto', 'cerrado');
create type public.tipo_pregunta as enum ('opcion', 'escala', 'texto');

create table public.formularios (
  id uuid primary key default gen_random_uuid(),
  edicion_id uuid not null references public.ediciones(id) on delete cascade,
  tipo public.tipo_formulario not null,
  titulo text not null check (length(trim(titulo)) > 0),
  anonimo boolean not null default false,
  mostrar_resultado boolean not null default true,
  duracion_segundos integer check (duracion_segundos is null or duracion_segundos between 10 and 3600),
  estado public.estado_formulario not null default 'borrador',
  abierto_en timestamptz,
  cierra_en timestamptz,
  creado_por uuid references public.perfiles(id) on delete set null,
  creado_en timestamptz not null default now(),
  check (tipo <> 'relampago' or anonimo = false)
);
create index formularios_edicion_idx on public.formularios (edicion_id, estado);

create table public.preguntas_formulario (
  id uuid primary key default gen_random_uuid(),
  formulario_id uuid not null references public.formularios(id) on delete cascade,
  orden integer not null default 1,
  tipo public.tipo_pregunta not null,
  enunciado text not null check (length(trim(enunciado)) > 0),
  opciones text[] not null default '{}',
  unique (formulario_id, orden)
);

create table public.claves_formulario (
  pregunta_id uuid primary key references public.preguntas_formulario(id) on delete cascade,
  correcta smallint not null check (correcta >= 0)
);

create table public.participaciones_formulario (
  formulario_id uuid not null references public.formularios(id) on delete cascade,
  perfil_id uuid not null references public.perfiles(id) on delete cascade,
  respondida_en timestamptz not null default now(),
  primary key (formulario_id, perfil_id)
);

create table public.respuestas_formulario (
  id uuid primary key default gen_random_uuid(),
  formulario_id uuid not null references public.formularios(id) on delete cascade,
  pregunta_id uuid not null references public.preguntas_formulario(id) on delete cascade,
  perfil_id uuid references public.perfiles(id) on delete cascade,
  opcion smallint,
  escala smallint check (escala is null or escala between 1 and 5),
  texto text,
  es_correcta boolean,
  respondida_en timestamptz not null default now()
);
create index respuestas_formulario_idx on public.respuestas_formulario (formulario_id, pregunta_id);

alter table public.formularios enable row level security;
alter table public.preguntas_formulario enable row level security;
alter table public.claves_formulario enable row level security;
alter table public.participaciones_formulario enable row level security;
alter table public.respuestas_formulario enable row level security;

create policy formularios_docente on public.formularios for all using (public.es_docente()) with check (public.es_docente());
create policy formularios_leer on public.formularios for select using (estado <> 'borrador' and public.en_edicion(edicion_id));

create policy preguntas_docente on public.preguntas_formulario for all using (public.es_docente()) with check (public.es_docente());
create policy preguntas_leer on public.preguntas_formulario for select using (
  exists (select 1 from public.formularios f where f.id = formulario_id and f.estado <> 'borrador' and public.en_edicion(f.edicion_id))
);

create policy claves_docente on public.claves_formulario for all using (public.es_docente()) with check (public.es_docente());

create policy participaciones_docente on public.participaciones_formulario for select using (public.es_docente());
create policy participaciones_propias on public.participaciones_formulario for select using (perfil_id = (select auth.uid()));

create policy respuestas_docente on public.respuestas_formulario for select using (public.es_docente());
create policy respuestas_propias on public.respuestas_formulario for select using (perfil_id = (select auth.uid()));

create or replace function public.abrir_formulario(p_formulario uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cierre timestamptz;
begin
  if not public.es_docente() then
    raise exception 'Solo el docente puede abrir formularios' using errcode = '42501';
  end if;
  if not exists (select 1 from public.preguntas_formulario where formulario_id = p_formulario) then
    raise exception 'El formulario no tiene preguntas';
  end if;
  update public.formularios
  set estado = 'abierto', abierto_en = now(), cierra_en = case when duracion_segundos is null then null else now() + make_interval(secs => duracion_segundos) end
  where id = p_formulario
  returning cierra_en into v_cierre;
  return v_cierre;
end;
$$;

create or replace function public.cerrar_formulario(p_formulario uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.es_docente() then
    raise exception 'Solo el docente puede cerrar formularios' using errcode = '42501';
  end if;
  update public.formularios set estado = 'cerrado', cierra_en = now() where id = p_formulario;
end;
$$;

-- p_respuestas: [{"pregunta_id": uuid, "opcion": n} | {"pregunta_id": uuid, "escala": n} | {"pregunta_id": uuid, "texto": "..."}]
-- Devuelve cuántas preguntas con clave acertó (null si el formulario no tiene clave).
create or replace function public.responder_formulario(p_formulario uuid, p_respuestas jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_yo uuid := (select auth.uid());
  v_form public.formularios%rowtype;
  v_correctas integer;
  v_con_clave integer;
begin
  select * into v_form from public.formularios where id = p_formulario;
  if v_form.id is null or not public.en_edicion(v_form.edicion_id) then
    raise exception 'Formulario no disponible' using errcode = '42501';
  end if;
  if v_form.estado <> 'abierto' or (v_form.cierra_en is not null and now() > v_form.cierra_en) then
    raise exception 'El formulario ya está cerrado';
  end if;

  begin
    insert into public.participaciones_formulario (formulario_id, perfil_id) values (p_formulario, v_yo);
  exception when unique_violation then
    raise exception 'Ya respondiste este formulario';
  end;

  if exists (
    select 1 from jsonb_to_recordset(p_respuestas) as r(pregunta_id uuid)
    left join public.preguntas_formulario q on q.id = r.pregunta_id and q.formulario_id = p_formulario
    where q.id is null
  ) then
    raise exception 'Hay preguntas que no pertenecen a este formulario';
  end if;

  -- En una encuesta anónima la hora de la respuesta se fija a la de apertura: si no, coincidiría
  -- con la de la participación y se podría ligar cada respuesta con quien la dio.
  insert into public.respuestas_formulario (formulario_id, pregunta_id, perfil_id, opcion, escala, texto, es_correcta, respondida_en)
  select p_formulario, r.pregunta_id, case when v_form.anonimo then null else v_yo end, r.opcion, r.escala, nullif(trim(r.texto), ''),
         case when k.correcta is null then null else r.opcion = k.correcta end,
         case when v_form.anonimo then v_form.abierto_en else now() end
  from jsonb_to_recordset(p_respuestas) as r(pregunta_id uuid, opcion smallint, escala smallint, texto text)
  left join public.claves_formulario k on k.pregunta_id = r.pregunta_id;

  select count(*) filter (where es_correcta), count(*) filter (where es_correcta is not null)
  into v_correctas, v_con_clave
  from public.respuestas_formulario
  where formulario_id = p_formulario and perfil_id = v_yo and not v_form.anonimo;

  return jsonb_build_object('correctas', v_correctas, 'con_clave', v_con_clave);
end;
$$;

-- Conteos agregados por pregunta. El docente ve también los textos y la clave; el estudiante
-- solo recuentos, y únicamente si el formulario muestra resultado.
create or replace function public.resultados_formulario(p_formulario uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_form public.formularios%rowtype;
  v_docente boolean := public.es_docente();
begin
  select * into v_form from public.formularios where id = p_formulario;
  if v_form.id is null or not (v_docente or public.en_edicion(v_form.edicion_id)) then
    raise exception 'Formulario no disponible' using errcode = '42501';
  end if;
  if not v_docente and not (v_form.mostrar_resultado and (v_form.estado = 'cerrado' or v_form.tipo = 'votacion')) then
    raise exception 'El resultado aún no está disponible' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'total', (select count(*) from public.participaciones_formulario where formulario_id = p_formulario),
    'preguntas', coalesce((
      select jsonb_agg(jsonb_build_object(
        'pregunta_id', q.id,
        'orden', q.orden,
        'tipo', q.tipo,
        'enunciado', q.enunciado,
        'opciones', to_jsonb(q.opciones),
        'correcta', case when v_docente or v_form.estado = 'cerrado' then k.correcta end,
        'conteos', (
          select coalesce(jsonb_object_agg(c.clave, c.n), '{}'::jsonb) from (
            select coalesce(r.opcion, r.escala)::text as clave, count(*) as n
            from public.respuestas_formulario r
            where r.pregunta_id = q.id and q.tipo <> 'texto'
            group by 1
          ) c
        ),
        'textos', case when v_docente then (
          select coalesce(jsonb_agg(r.texto order by r.respondida_en), '[]'::jsonb) from public.respuestas_formulario r where r.pregunta_id = q.id and r.texto is not null
        ) else '[]'::jsonb end
      ) order by q.orden)
      from public.preguntas_formulario q left join public.claves_formulario k on k.pregunta_id = q.id
      where q.formulario_id = p_formulario
    ), '[]'::jsonb)
  );
end;
$$;

-- Quién ya participó, solo para el docente (la presencia en clase). No incluye respuestas.
create or replace function public.participantes_formulario(p_formulario uuid)
returns table (perfil_id uuid, respondida_en timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select p.perfil_id, p.respondida_en from public.participaciones_formulario p
  where p.formulario_id = p_formulario and public.es_docente();
$$;

revoke all on function public.abrir_formulario(uuid), public.cerrar_formulario(uuid), public.responder_formulario(uuid, jsonb), public.resultados_formulario(uuid), public.participantes_formulario(uuid) from public, anon;
grant execute on function public.abrir_formulario(uuid), public.cerrar_formulario(uuid), public.responder_formulario(uuid, jsonb), public.resultados_formulario(uuid), public.participantes_formulario(uuid) to authenticated;
