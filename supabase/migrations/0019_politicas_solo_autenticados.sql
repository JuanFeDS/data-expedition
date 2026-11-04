-- Estas políticas estaban abiertas al rol público (incluye anon). Ninguna dejaba pasar datos, porque todas dependen de auth.uid(),
-- pero no tiene sentido evaluarlas para quien no ha iniciado sesión. Quedan solo para authenticated, como el resto.

alter policy asistencias_docente on public.asistencias to authenticated;
alter policy asistencias_propias on public.asistencias to authenticated;
alter policy banco_docente on public.banco_preguntas to authenticated;
alter policy banco_leer on public.banco_preguntas to authenticated;
alter policy claves_docente on public.claves_formulario to authenticated;
alter policy diagnosticos_docente on public.diagnosticos to authenticated;
alter policy diagnosticos_propios on public.diagnosticos to authenticated;
alter policy equipos_docente on public.equipos_trabajo to authenticated;
alter policy formularios_docente on public.formularios to authenticated;
alter policy formularios_leer on public.formularios to authenticated;
alter policy miembros_docente on public.miembros_equipo to authenticated;
alter policy miembros_propios on public.miembros_equipo to authenticated;
alter policy participaciones_docente on public.participaciones_formulario to authenticated;
alter policy participaciones_propias on public.participaciones_formulario to authenticated;
alter policy practica_respuestas_docente on public.practica_respuestas to authenticated;
alter policy practica_respuestas_propias on public.practica_respuestas to authenticated;
alter policy practica_sesiones_docente on public.practica_sesiones to authenticated;
alter policy practica_sesiones_propias on public.practica_sesiones to authenticated;
alter policy preguntas_docente on public.preguntas_formulario to authenticated;
alter policy preguntas_leer on public.preguntas_formulario to authenticated;
alter policy recursos_docente on public.recursos to authenticated;
alter policy recursos_leer on public.recursos to authenticated;
alter policy respuestas_docente on public.respuestas_formulario to authenticated;
alter policy respuestas_propias on public.respuestas_formulario to authenticated;
alter policy sesiones_docente on public.sesiones to authenticated;
alter policy sesiones_leer on public.sesiones to authenticated;
alter policy sesiones_asistencia_docente on public.sesiones_asistencia to authenticated;
