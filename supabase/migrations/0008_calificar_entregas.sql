-- Calificar entregas: comentario general y una sola función que guarda la rúbrica,
-- calcula la nota ponderada y deja la evidencia del radar, todo en una transacción.

alter table public.entregas add column if not exists retroalimentacion text;

create or replace function public.calificar_entrega(p_entrega uuid, p_niveles jsonb, p_retroalimentacion text)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_perfil uuid;
  v_trabajo uuid;
  v_nota numeric;
begin
  if not public.es_docente() then
    raise exception 'Solo el docente puede calificar' using errcode = '42501';
  end if;

  select perfil_id, trabajo_id into v_perfil, v_trabajo from public.entregas where id = p_entrega;
  if v_perfil is null then
    raise exception 'La entrega no existe';
  end if;

  if exists (
    select 1 from jsonb_to_recordset(p_niveles) as n(criterio_id uuid, nivel numeric)
    left join public.criterios c on c.id = n.criterio_id and c.trabajo_id = v_trabajo
    where c.id is null
  ) then
    raise exception 'Hay criterios que no pertenecen a este trabajo';
  end if;

  insert into public.calificaciones (entrega_id, criterio_id, nivel)
  select p_entrega, n.criterio_id, n.nivel
  from jsonb_to_recordset(p_niveles) as n(criterio_id uuid, nivel numeric)
  on conflict (entrega_id, criterio_id) do update set nivel = excluded.nivel;

  select round(sum(k.nivel * c.peso) / sum(c.peso), 1) into v_nota
  from public.calificaciones k join public.criterios c on c.id = k.criterio_id
  where k.entrega_id = p_entrega;

  update public.entregas
  set nota = v_nota, estado = 'calificada', retroalimentacion = nullif(trim(p_retroalimentacion), '')
  where id = p_entrega;

  delete from public.evidencias_radar where entrega_id = p_entrega and fuente = 'trabajo';
  insert into public.evidencias_radar (perfil_id, dimension_id, fuente, valor, peso, entrega_id)
  select v_perfil, c.dimension_id, 'trabajo', round(sum(k.nivel * c.peso) / sum(c.peso) * 20, 1), sum(c.peso), p_entrega
  from public.calificaciones k join public.criterios c on c.id = k.criterio_id
  where k.entrega_id = p_entrega
  group by c.dimension_id;

  return v_nota;
end;
$$;

revoke all on function public.calificar_entrega(uuid, jsonb, text) from public, anon;
grant execute on function public.calificar_entrega(uuid, jsonb, text) to authenticated;
