-- Endurecimiento tras la revisión del asesor de Supabase.
-- 1. Las funciones de disparadores no deben poder llamarse como RPC, ni por anónimos ni por usuarios.
-- 2. Índices para las llaves foráneas que no los tenían (joins y borrados en cascada más rápidos).

revoke all on function public.registrar_cambio(), public.registrar_ingreso(), public.versionar_entrega() from public, anon, authenticated;

create index if not exists asistencias_perfil_idx on public.asistencias (perfil_id);
create index if not exists banco_preguntas_dimension_idx on public.banco_preguntas (dimension_id);
create index if not exists calificaciones_criterio_idx on public.calificaciones (criterio_id);
create index if not exists criterios_dimension_idx on public.criterios (dimension_id);
create index if not exists criterios_trabajo_idx on public.criterios (trabajo_id);
create index if not exists diagnosticos_dimension_idx on public.diagnosticos (dimension_id);
create index if not exists ediciones_plantilla_origen_idx on public.ediciones (plantilla_origen_id);
create index if not exists evidencias_radar_dimension_idx on public.evidencias_radar (dimension_id);
create index if not exists evidencias_radar_entrega_idx on public.evidencias_radar (entrega_id);
create index if not exists formularios_creado_por_idx on public.formularios (creado_por);
create index if not exists matriculas_grupo_idx on public.matriculas (grupo_id);
create index if not exists miembros_equipo_perfil_idx on public.miembros_equipo (perfil_id);
create index if not exists participaciones_formulario_perfil_idx on public.participaciones_formulario (perfil_id);
create index if not exists practica_respuestas_pregunta_idx on public.practica_respuestas (pregunta_id);
create index if not exists practica_sesiones_edicion_idx on public.practica_sesiones (edicion_id);
create index if not exists recursos_sesion_idx on public.recursos (sesion_id);
create index if not exists respuestas_formulario_perfil_idx on public.respuestas_formulario (perfil_id);
create index if not exists respuestas_formulario_pregunta_idx on public.respuestas_formulario (pregunta_id);
