-- Todo lo que pasa en la plataforma queda guardado: eventos de uso y de negocio, historial de entregas,
-- progreso de cada persona y fechas de creación y cambio. Los eventos no llevan llaves foráneas a propósito,
-- para que sigan existiendo aunque se borre la persona, el curso o el trabajo al que se refieren.

-- ---------- Fechas ----------
alter table public.matriculas add column creada_en timestamptz not null default now();
alter table public.trabajos add column creado_en timestamptz not null default now(), add column actualizado_en timestamptz not null default now();
alter table public.entregas add column creada_en timestamptz not null default now(), add column actualizado_en timestamptz not null default now();
alter table public.perfiles add column actualizado_en timestamptz not null default now();
alter table public.ediciones add column actualizado_en timestamptz not null default now();

create function public.tocar_actualizacion() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

create trigger tocar_trabajos before update on public.trabajos for each row execute function public.tocar_actualizacion();
create trigger tocar_entregas before update on public.entregas for each row execute function public.tocar_actualizacion();
create trigger tocar_perfiles before update on public.perfiles for each row execute function public.tocar_actualizacion();
create trigger tocar_ediciones before update on public.ediciones for each row execute function public.tocar_actualizacion();

-- ---------- Eventos ----------
create table public.eventos (
  id bigint generated always as identity primary key,
  creado_en timestamptz not null default now(),
  perfil_id uuid,
  edicion_id uuid,
  tipo text not null,
  entidad text,
  entidad_id text,
  datos jsonb not null default '{}'::jsonb
);

create index on public.eventos (perfil_id, creado_en desc);
create index on public.eventos (edicion_id, tipo, creado_en desc);
create index on public.eventos (tipo, creado_en desc);

alter table public.eventos enable row level security;
revoke update, delete, truncate on public.eventos from anon, authenticated;

create policy eventos_insertar on public.eventos for insert to authenticated
  with check (perfil_id = (select auth.uid()));
create policy eventos_leer on public.eventos for select to authenticated
  using (perfil_id = (select auth.uid()) or public.es_docente());

create function public.registrar_evento(p_tipo text, p_edicion uuid, p_entidad text, p_entidad_id text, p_datos jsonb default '{}'::jsonb, p_perfil uuid default null)
returns void
language sql security definer set search_path = ''
as $$
  insert into public.eventos (perfil_id, edicion_id, tipo, entidad, entidad_id, datos)
  values (coalesce(p_perfil, (select auth.uid())), p_edicion, p_tipo, p_entidad, p_entidad_id, p_datos)
$$;

revoke execute on function public.registrar_evento(text, uuid, text, text, jsonb, uuid) from public, anon, authenticated;

-- Cada cambio en las tablas de negocio deja un evento. No se guardan correos, nombres ni el texto de la bitácora.
create function public.registrar_cambio() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_fila jsonb := to_jsonb(case when tg_op = 'DELETE' then old else new end);
  v_limpia jsonb;
  v_edicion uuid;
  v_id text;
begin
  v_id := case tg_table_name
    when 'invitaciones' then md5(v_fila ->> 'correo')
    when 'correos_autorizados' then md5(v_fila ->> 'correo')
    else coalesce(v_fila ->> 'id', v_fila ->> 'perfil_id')
  end;
  v_edicion := case tg_table_name
    when 'ediciones' then (v_fila ->> 'id')::uuid
    when 'entregas' then public.edicion_de_trabajo((v_fila ->> 'trabajo_id')::uuid)
    when 'calificaciones' then public.edicion_de_trabajo((select e.trabajo_id from public.entregas e where e.id = (v_fila ->> 'entrega_id')::uuid))
    when 'perfiles' then null
    when 'correos_autorizados' then null
    else nullif(v_fila ->> 'edicion_id', '')::uuid
  end;
  v_limpia := v_fila - 'bitacora' - 'correo' - 'nombre' - 'usuario' - 'enlace_pr';
  perform public.registrar_evento(
    tg_table_name || '_' || lower(tg_op),
    v_edicion,
    tg_table_name,
    v_id,
    case when tg_op = 'UPDATE' then jsonb_build_object('antes', to_jsonb(old) - 'bitacora' - 'correo' - 'nombre' - 'usuario' - 'enlace_pr', 'despues', v_limpia) else v_limpia end
  );
  return null;
end;
$$;

create trigger registrar_ediciones after insert or update or delete on public.ediciones for each row execute function public.registrar_cambio();
create trigger registrar_matriculas after insert or update or delete on public.matriculas for each row execute function public.registrar_cambio();
create trigger registrar_trabajos after insert or update or delete on public.trabajos for each row execute function public.registrar_cambio();
create trigger registrar_entregas after insert or update or delete on public.entregas for each row execute function public.registrar_cambio();
create trigger registrar_calificaciones after insert or update or delete on public.calificaciones for each row execute function public.registrar_cambio();
create trigger registrar_perfiles after insert or update or delete on public.perfiles for each row execute function public.registrar_cambio();
create trigger registrar_invitaciones after insert or update or delete on public.invitaciones for each row execute function public.registrar_cambio();
create trigger registrar_autorizados after insert or update or delete on public.correos_autorizados for each row execute function public.registrar_cambio();
create trigger registrar_radar after insert or update or delete on public.evidencias_radar for each row execute function public.registrar_cambio();

-- Cada ingreso a la plataforma queda registrado.
create function public.registrar_ingreso() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.last_sign_in_at is distinct from old.last_sign_in_at then
    perform public.registrar_evento('sesion_iniciada', null, 'perfil', new.id::text, '{}'::jsonb, new.id);
  end if;
  return null;
end;
$$;

create trigger registrar_ingreso after update of last_sign_in_at on auth.users for each row execute function public.registrar_ingreso();

-- ---------- Historial de entregas: cada envío o cambio es una versión ----------
create table public.entregas_versiones (
  id bigint generated always as identity primary key,
  entrega_id uuid not null,
  version integer not null,
  registrada_en timestamptz not null default now(),
  trabajo_id uuid not null,
  perfil_id uuid not null,
  modo_ia public.modo_ia not null,
  bitacora text,
  estado public.estado_entrega not null,
  nota numeric(2, 1),
  enlace_pr text,
  entregada_en timestamptz,
  unique (entrega_id, version)
);

create index on public.entregas_versiones (perfil_id);
create index on public.entregas_versiones (trabajo_id);

alter table public.entregas_versiones enable row level security;
revoke insert, update, delete, truncate on public.entregas_versiones from anon, authenticated;
create policy versiones_leer on public.entregas_versiones for select to authenticated
  using (perfil_id = (select auth.uid()) or public.es_docente());

create function public.versionar_entrega() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.entregas_versiones (entrega_id, version, trabajo_id, perfil_id, modo_ia, bitacora, estado, nota, enlace_pr, entregada_en)
  values (
    new.id,
    coalesce((select max(v.version) from public.entregas_versiones v where v.entrega_id = new.id), 0) + 1,
    new.trabajo_id, new.perfil_id, new.modo_ia, new.bitacora, new.estado, new.nota, new.enlace_pr, new.entregada_en
  );
  return null;
end;
$$;

create trigger versionar_entregas after insert or update on public.entregas for each row execute function public.versionar_entrega();

-- ---------- Progreso de cada persona (desbloqueos, tutorial…), para que viaje con la cuenta ----------
create table public.progreso_usuario (
  perfil_id uuid not null references public.perfiles (id) on delete cascade,
  clave text not null,
  valor jsonb not null default '{}'::jsonb,
  actualizado_en timestamptz not null default now(),
  primary key (perfil_id, clave)
);

alter table public.progreso_usuario enable row level security;

create policy progreso_propio on public.progreso_usuario for all to authenticated
  using (perfil_id = (select auth.uid())) with check (perfil_id = (select auth.uid()));
create policy progreso_docente on public.progreso_usuario for select to authenticated
  using (public.es_docente());

create trigger tocar_progreso before update on public.progreso_usuario for each row execute function public.tocar_actualizacion();
