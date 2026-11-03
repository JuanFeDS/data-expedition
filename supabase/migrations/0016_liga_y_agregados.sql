-- Liga semanal de XP (solo nombres de usuario) y resumen agregado para observadores.
-- El anonimato de los observadores lo garantiza la base: nada se devuelve con menos de 5 estudiantes
-- y cada indicador exige además 5 personas con datos.

create or replace function public.liga_semanal(p_edicion uuid)
returns table (usuario text, xp integer, soy_yo boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (public.es_docente() or public.en_edicion(p_edicion)) then
    raise exception 'Sin acceso al curso' using errcode = '42501';
  end if;
  return query
  select coalesce(p.usuario, 'estudiante'), coalesce(sum(s.xp), 0)::integer as xp_semana, p.id = (select auth.uid())
  from public.matriculas m
  join public.perfiles p on p.id = m.perfil_id and p.rol = 'estudiante'
  left join public.practica_sesiones s on s.perfil_id = p.id and s.edicion_id = p_edicion and s.terminada_en >= date_trunc('week', now())
  where m.edicion_id = p_edicion
  group by p.id, p.usuario
  order by xp_semana desc, p.usuario
  limit 20;
end;
$$;

create or replace function public.resumen_agregado(p_edicion uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_minimo constant integer := 5;
  v_estudiantes integer;
  v_trabajos jsonb;
  v_radar jsonb;
  v_asistencia jsonb;
  v_rol text := (select rol::text from public.perfiles where id = (select auth.uid()));
begin
  if v_rol is null or v_rol not in ('observador', 'docente') then
    raise exception 'Solo observación o docencia' using errcode = '42501';
  end if;

  select count(*) into v_estudiantes
  from public.matriculas m join public.perfiles p on p.id = m.perfil_id
  where m.edicion_id = p_edicion and p.rol = 'estudiante';

  if v_estudiantes < v_minimo then
    return jsonb_build_object('visible', false, 'estudiantes', v_estudiantes, 'minimo', v_minimo);
  end if;

  select coalesce(jsonb_agg(t order by t.semana nulls last, t.nombre), '[]'::jsonb) into v_trabajos
  from (
    select tr.nombre, tr.semana,
      count(e.id) filter (where e.estado <> 'borrador') as entregadas,
      count(e.id) filter (where e.estado <> 'borrador' and (tr.vence_en is null or e.entregada_en <= tr.vence_en)) as a_tiempo,
      case when count(e.id) filter (where e.nota is not null) >= v_minimo then jsonb_build_object(
        'bajas', count(e.id) filter (where e.nota < 3),
        'medias', count(e.id) filter (where e.nota >= 3 and e.nota < 4),
        'altas', count(e.id) filter (where e.nota >= 4 and e.nota < 4.6),
        'excelentes', count(e.id) filter (where e.nota >= 4.6)) end as notas
    from public.trabajos tr left join public.entregas e on e.trabajo_id = tr.id
    where tr.edicion_id = p_edicion and not tr.es_diagnostico
    group by tr.id
  ) t;

  select coalesce(jsonb_agg(r order by r.orden), '[]'::jsonb) into v_radar
  from (
    select d.nombre, d.orden,
      case when count(distinct ev.perfil_id) >= v_minimo then round(sum(ev.valor * ev.peso) / nullif(sum(ev.peso), 0))::integer end as ahora,
      case when count(distinct ev.perfil_id) filter (where ev.fuente = 'diagnostico_inicial') >= v_minimo then round(avg(ev.valor) filter (where ev.fuente = 'diagnostico_inicial'))::integer end as entrada
    from public.dimensiones d left join public.evidencias_radar ev on ev.dimension_id = d.id
    where d.edicion_id = p_edicion
    group by d.id
  ) r;

  select case when total > 0 and registros >= v_minimo then jsonb_build_object('porcentaje', round(100.0 * cuentan / (v_estudiantes * sesiones_dadas))) end into v_asistencia
  from (
    select (select count(*) from public.sesiones s where s.edicion_id = p_edicion and s.inicia_en < now()) as sesiones_dadas,
           (select count(*) from public.asistencias a join public.sesiones s on s.id = a.sesion_id where s.edicion_id = p_edicion and a.estado in ('presente', 'justificado')) as cuentan,
           (select count(*) from public.asistencias a join public.sesiones s on s.id = a.sesion_id where s.edicion_id = p_edicion) as registros,
           (select count(*) from public.sesiones s where s.edicion_id = p_edicion and s.inicia_en < now()) as total
  ) x;

  return jsonb_build_object('visible', true, 'estudiantes', v_estudiantes, 'minimo', v_minimo, 'trabajos', v_trabajos, 'radar', v_radar, 'asistencia', v_asistencia);
end;
$$;

revoke all on function public.liga_semanal(uuid), public.resumen_agregado(uuid) from public, anon;
grant execute on function public.liga_semanal(uuid), public.resumen_agregado(uuid) to authenticated;
