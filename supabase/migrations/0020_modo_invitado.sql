-- Modo invitado: entrar a una clase con un código y un apodo, sin correo ni cuenta, para poder
-- responder relámpagos, votaciones y encuestas y competir en un marcador. Por debajo es una sesión anónima
-- de Supabase (hay que activar "Allow anonymous sign-ins" en Authentication), así que las políticas de
-- seguridad y las funciones de siempre siguen funcionando: el invitado solo ve su clase porque se matricula.

alter table public.perfiles alter column correo drop not null;
alter table public.perfiles add column es_invitado boolean not null default false;

-- Un código por curso mientras la clase está abierta. Solo el docente lo ve: no se guarda en `ediciones`
-- porque cualquier estudiante puede leer su curso.
create table public.clases_invitados (
  edicion_id uuid primary key references public.ediciones (id) on delete cascade,
  codigo text not null unique check (codigo ~ '^[A-Z2-9]{5}$'),
  hasta timestamptz not null,
  abierta_en timestamptz not null default now()
);

alter table public.clases_invitados enable row level security;
create policy clases_invitados_docente on public.clases_invitados for all to authenticated
  using (public.es_docente()) with check (public.es_docente());

-- Las sesiones anónimas no traen correo: se dejan crear y su perfil queda marcado como invitado, sin matrícula.
create or replace function public.exigir_correo_autorizado() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.is_anonymous then
    return new;
  end if;
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
  if new.is_anonymous then
    insert into public.perfiles (id, correo, rol, es_invitado) values (new.id, null, 'estudiante', true);
    return new;
  end if;

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

revoke execute on function public.exigir_correo_autorizado(), public.crear_perfil_al_registrarse() from public, anon, authenticated;

-- El docente abre la clase a invitados y recibe el código (5 caracteres sin letras ni números que se confundan).
create function public.abrir_clase_invitados(p_edicion uuid, p_horas integer default 4) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_codigo text;
  v_intentos integer := 0;
begin
  if not public.es_docente() then
    raise exception 'Solo el docente abre la clase' using errcode = '42501';
  end if;
  loop
    v_codigo := (select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::integer, 1), '') from generate_series(1, 5));
    begin
      insert into public.clases_invitados (edicion_id, codigo, hasta)
      values (p_edicion, v_codigo, now() + make_interval(hours => greatest(1, least(coalesce(p_horas, 4), 12))))
      on conflict (edicion_id) do update set codigo = excluded.codigo, hasta = excluded.hasta, abierta_en = now();
      return v_codigo;
    exception when unique_violation then
      v_intentos := v_intentos + 1;
      if v_intentos > 10 then
        raise exception 'No se pudo generar un código';
      end if;
    end;
  end loop;
end;
$$;

create function public.cerrar_clase_invitados(p_edicion uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.es_docente() then
    raise exception 'Solo el docente cierra la clase' using errcode = '42501';
  end if;
  delete from public.clases_invitados where edicion_id = p_edicion;
end;
$$;

create function public.estado_clase_invitados(p_edicion uuid) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_clase public.clases_invitados%rowtype;
  v_invitados integer;
begin
  if not public.es_docente() then
    raise exception 'Solo el docente ve la clase' using errcode = '42501';
  end if;
  select * into v_clase from public.clases_invitados where edicion_id = p_edicion and hasta > now();
  select count(*)::integer into v_invitados
  from public.matriculas m join public.perfiles p on p.id = m.perfil_id
  where m.edicion_id = p_edicion and p.es_invitado;
  return jsonb_build_object('abierta', v_clase.edicion_id is not null, 'codigo', v_clase.codigo, 'hasta', v_clase.hasta, 'abierta_en', v_clase.abierta_en, 'invitados', v_invitados);
end;
$$;

-- Quien tiene una sesión anónima entra a la clase con el código y su apodo. Devuelve el curso al que quedó matriculado.
create function public.unirse_como_invitado(p_codigo text, p_apodo text) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_yo uuid := (select auth.uid());
  v_apodo text := trim(coalesce(p_apodo, ''));
  v_edicion uuid;
begin
  if not exists (select 1 from public.perfiles where id = v_yo and es_invitado) then
    raise exception 'Esta entrada es solo para invitados' using errcode = '42501';
  end if;
  if char_length(v_apodo) not between 2 and 20 then
    raise exception 'El apodo debe tener entre 2 y 20 caracteres';
  end if;
  select edicion_id into v_edicion from public.clases_invitados where codigo = upper(trim(coalesce(p_codigo, ''))) and hasta > now();
  if v_edicion is null then
    raise exception 'codigo_invalido';
  end if;

  update public.perfiles
  set nombre = v_apodo, usuario = coalesce(usuario, 'inv_' || substr(replace(v_yo::text, '-', ''), 1, 8))
  where id = v_yo;
  insert into public.matriculas (perfil_id, edicion_id) values (v_yo, v_edicion) on conflict do nothing;
  return v_edicion;
end;
$$;

-- Marcador de la competencia: cada relámpago acertado vale 100 puntos más hasta 50 por rapidez. Lo ven el docente y la clase;
-- para no exponer nombres reales entre estudiantes, un invitado aparece con su apodo y los demás con su usuario público.
create function public.marcador_clase(p_edicion uuid, p_desde timestamptz default null)
returns table (perfil_id uuid, apodo text, es_invitado boolean, aciertos integer, respondidas integer, puntos integer)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not (public.es_docente() or public.en_edicion(p_edicion)) then
    raise exception 'Marcador no disponible' using errcode = '42501';
  end if;
  return query
  select p.id,
         case when p.es_invitado then coalesce(p.nombre, 'Invitado') else coalesce(p.usuario, 'Anónimo') end,
         p.es_invitado,
         (count(*) filter (where r.es_correcta))::integer,
         count(*)::integer,
         coalesce(sum(case when r.es_correcta
           then 100 + greatest(0, 50 - floor(50 * extract(epoch from (r.respondida_en - f.abierto_en)) / greatest(coalesce(f.duracion_segundos, 60), 1))::integer)
           else 0 end), 0)::integer as puntos
  from public.respuestas_formulario r
  join public.formularios f on f.id = r.formulario_id and f.edicion_id = p_edicion and f.tipo = 'relampago'
  join public.perfiles p on p.id = r.perfil_id
  where r.es_correcta is not null and (p_desde is null or f.abierto_en >= p_desde)
  group by p.id, p.nombre, p.usuario, p.es_invitado
  order by 6 desc, 4 desc, 5 asc
  limit 50;
end;
$$;

revoke all on function public.abrir_clase_invitados(uuid, integer), public.cerrar_clase_invitados(uuid), public.estado_clase_invitados(uuid),
  public.unirse_como_invitado(text, text), public.marcador_clase(uuid, timestamptz) from public, anon;
grant execute on function public.abrir_clase_invitados(uuid, integer), public.cerrar_clase_invitados(uuid), public.estado_clase_invitados(uuid),
  public.unirse_como_invitado(text, text), public.marcador_clase(uuid, timestamptz) to authenticated;
