-- Pruebas de las funciones y políticas de las migraciones 0008 a 0016.
--
-- Cómo correrlas: ejecuta cada bloque DO por separado (SQL editor de Supabase o `execute_sql`).
-- Cada bloque crea sus propios datos y termina con una excepción para deshacerlo todo:
--   · pasa  → el error empieza con «OK»
--   · falla → el error empieza con «FALLO»
-- Necesitan en la base al menos un docente, un estudiante matriculado en un curso que no sea la plantilla.

-- 1. Formularios: el estudiante no ve la clave ni el resultado en vivo, y no responde dos veces
do $$
declare d uuid; e uuid; ed uuid; f uuid; q uuid; leidas int; bloqueado boolean := false; doble boolean := false; r jsonb;
begin
  select id into d from public.perfiles where rol = 'docente' limit 1;
  select p.id, m.edicion_id into e, ed from public.perfiles p join public.matriculas m on m.perfil_id = p.id where p.rol = 'estudiante' limit 1;
  insert into public.formularios (edicion_id, tipo, titulo, anonimo, duracion_segundos) values (ed, 'encuesta', '__prueba', true, 60) returning id into f;
  insert into public.preguntas_formulario (formulario_id, orden, tipo, enunciado, opciones) values (f, 1, 'opcion', 'x', '{a,b}') returning id into q;
  insert into public.claves_formulario values (q, 1);
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.abrir_formulario(f);
  perform set_config('request.jwt.claims', json_build_object('sub', e, 'role', 'authenticated')::text, true);
  perform public.responder_formulario(f, jsonb_build_array(jsonb_build_object('pregunta_id', q, 'opcion', 1)));
  begin perform public.responder_formulario(f, '[]'::jsonb); exception when others then doble := true; end;
  select count(*) into leidas from public.claves_formulario;
  begin perform public.resultados_formulario(f); exception when others then bloqueado := true; end;
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
  r := public.resultados_formulario(f);
  if not doble then raise exception 'FALLO: permitió responder dos veces'; end if;
  if leidas <> 0 then raise exception 'FALLO: el estudiante ve las claves'; end if;
  if not bloqueado then raise exception 'FALLO: el estudiante vio el resultado de una encuesta abierta'; end if;
  if (r ->> 'total')::int <> 1 then raise exception 'FALLO: el docente no ve la respuesta'; end if;
  raise exception 'OK formularios';
end $$;

-- 2. Calificar: nota ponderada, estado, evidencia para el radar y permisos
do $$
declare d uuid; e uuid; ed uuid; dim uuid; t uuid; c1 uuid; c2 uuid; en uuid; nota numeric; ev int; est text; rechazado boolean := false;
begin
  select id into d from public.perfiles where rol = 'docente' limit 1;
  select p.id, m.edicion_id into e, ed from public.perfiles p join public.matriculas m on m.perfil_id = p.id where p.rol = 'estudiante' limit 1;
  insert into public.trabajos (edicion_id, nombre) values (ed, '__prueba') returning id into t;
  insert into public.dimensiones (edicion_id, nombre, orden) values (ed, '__d', 99) returning id into dim;
  insert into public.criterios (trabajo_id, dimension_id, modo_ia, nombre, peso, descriptor_nivel_1, descriptor_nivel_2, descriptor_nivel_3, descriptor_nivel_4, descriptor_nivel_5) values (t, dim, 'sin_ia', 'a', 2, '1', '2', '3', '4', '5') returning id into c1;
  insert into public.criterios (trabajo_id, dimension_id, modo_ia, nombre, peso, descriptor_nivel_1, descriptor_nivel_2, descriptor_nivel_3, descriptor_nivel_4, descriptor_nivel_5) values (t, dim, 'sin_ia', 'b', 1, '1', '2', '3', '4', '5') returning id into c2;
  insert into public.entregas (trabajo_id, perfil_id, modo_ia, estado) values (t, e, 'sin_ia', 'entregada') returning id into en;
  perform set_config('request.jwt.claims', json_build_object('sub', e, 'role', 'authenticated')::text, true);
  set local role authenticated;
  begin perform public.calificar_entrega(en, '[]'::jsonb, ''); exception when others then rechazado := true; end;
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
  nota := public.calificar_entrega(en, jsonb_build_array(jsonb_build_object('criterio_id', c1, 'nivel', 4), jsonb_build_object('criterio_id', c2, 'nivel', 2.5)), ' bien ');
  select count(*) into ev from public.evidencias_radar where entrega_id = en;
  select estado::text into est from public.entregas where id = en;
  if not rechazado then raise exception 'FALLO: un estudiante pudo calificar'; end if;
  if nota <> 3.5 then raise exception 'FALLO: nota %, se esperaba 3.5', nota; end if;
  if ev <> 1 or est <> 'calificada' then raise exception 'FALLO: evidencias=% estado=%', ev, est; end if;
  raise exception 'OK calificar';
end $$;

-- 3. Asistencia: el estudiante no ve el código ni la semilla; el código malo se rechaza y el bueno registra
do $$
declare d uuid; e uuid; ed uuid; s uuid; cod text; semillas int; malo boolean := false; no_ve boolean := false; r uuid;
begin
  select id into d from public.perfiles where rol = 'docente' limit 1;
  select p.id, m.edicion_id into e, ed from public.perfiles p join public.matriculas m on m.perfil_id = p.id where p.rol = 'estudiante' limit 1;
  insert into public.sesiones (edicion_id, codigo, tema) values (ed, '__p', 't') returning id into s;
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.abrir_asistencia(s);
  select c.codigo into cod from public.codigo_asistencia(s) c;
  perform set_config('request.jwt.claims', json_build_object('sub', e, 'role', 'authenticated')::text, true);
  begin perform public.codigo_asistencia(s); exception when others then no_ve := true; end;
  begin perform public.registrar_asistencia(ed, 'ZZZZZZ'); exception when others then malo := true; end;
  select count(*) into semillas from public.sesiones_asistencia;
  r := public.registrar_asistencia(ed, lower(cod));
  if not no_ve then raise exception 'FALLO: el estudiante vio el código'; end if;
  if not malo then raise exception 'FALLO: aceptó un código inválido'; end if;
  if semillas <> 0 then raise exception 'FALLO: el estudiante ve la semilla'; end if;
  if r <> s then raise exception 'FALLO: no registró la asistencia'; end if;
  raise exception 'OK asistencia';
end $$;

-- 4. Equipos: el docente sortea, el estudiante ve solo el suyo y no puede sortear
do $$
declare d uuid; e uuid; ed uuid; t uuid; n int; filas int; rechazado boolean := false;
begin
  select id into d from public.perfiles where rol = 'docente' limit 1;
  select p.id, m.edicion_id into e, ed from public.perfiles p join public.matriculas m on m.perfil_id = p.id where p.rol = 'estudiante' limit 1;
  insert into public.trabajos (edicion_id, nombre, por_equipo, tamano_equipo) values (ed, '__p', true, 2) returning id into t;
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
  set local role authenticated;
  n := public.sortear_equipos(t);
  perform set_config('request.jwt.claims', json_build_object('sub', e, 'role', 'authenticated')::text, true);
  select count(*) into filas from public.mi_equipo(t);
  begin perform public.sortear_equipos(t); exception when others then rechazado := true; end;
  if n < 1 or filas < 1 then raise exception 'FALLO: equipos=% filas=%', n, filas; end if;
  if not rechazado then raise exception 'FALLO: un estudiante pudo sortear'; end if;
  raise exception 'OK equipos';
end $$;

-- 5. Diagnóstico: el autoinforme sobrevive al registro del docente y el estudiante no registra
do $$
declare d uuid; e uuid; ed uuid; dim uuid; auto int; ev numeric; rechazado boolean := false;
begin
  select id into d from public.perfiles where rol = 'docente' limit 1;
  select p.id, m.edicion_id into e, ed from public.perfiles p join public.matriculas m on m.perfil_id = p.id where p.rol = 'estudiante' limit 1;
  insert into public.dimensiones (edicion_id, nombre, orden) values (ed, '__d', 99) returning id into dim;
  perform set_config('request.jwt.claims', json_build_object('sub', e, 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.guardar_autoinforme(jsonb_build_array(jsonb_build_object('dimension_id', dim, 'autoinforme', 4)));
  begin perform public.registrar_diagnostico(e, '[]'::jsonb); exception when others then rechazado := true; end;
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
  perform public.registrar_diagnostico(e, jsonb_build_array(jsonb_build_object('dimension_id', dim, 'con_ia', 80, 'sin_ia', 55)));
  select autoinforme into auto from public.diagnosticos where perfil_id = e and dimension_id = dim;
  select valor into ev from public.evidencias_radar where perfil_id = e and fuente = 'diagnostico_inicial' and dimension_id = dim;
  if not rechazado then raise exception 'FALLO: un estudiante registró diagnóstico'; end if;
  if auto <> 4 then raise exception 'FALLO: el autoinforme se perdió'; end if;
  if ev <> 55 then raise exception 'FALLO: el radar no usa el resultado sin IA (%)', ev; end if;
  raise exception 'OK diagnóstico';
end $$;

-- 6. Práctica: 30 XP, evidencia ligera y solo el docente escribe el banco
do $$
declare e uuid; ed uuid; dim uuid; q1 uuid; q2 uuid; r jsonb; ev int; escribio boolean := false;
begin
  select p.id, m.edicion_id into e, ed from public.perfiles p join public.matriculas m on m.perfil_id = p.id where p.rol = 'estudiante' limit 1;
  insert into public.dimensiones (edicion_id, nombre, orden) values (ed, '__d', 99) returning id into dim;
  insert into public.banco_preguntas (edicion_id, dimension_id, formato, contenido) values (ed, dim, 'opciones', '{"enunciado":"x"}') returning id into q1;
  insert into public.banco_preguntas (edicion_id, dimension_id, formato, contenido) values (ed, dim, 'opciones', '{"enunciado":"y"}') returning id into q2;
  perform set_config('request.jwt.claims', json_build_object('sub', e, 'role', 'authenticated')::text, true);
  set local role authenticated;
  r := public.terminar_practica(ed, jsonb_build_array(jsonb_build_object('pregunta_id', q1, 'primer_intento', true), jsonb_build_object('pregunta_id', q2, 'primer_intento', false)));
  select count(*) into ev from public.evidencias_radar where perfil_id = e and fuente = 'leccion' and dimension_id = dim;
  begin insert into public.banco_preguntas (edicion_id, dimension_id, formato, contenido) values (ed, dim, 'vf', '{}'); escribio := true; exception when others then null; end;
  if (r ->> 'xp')::int <> 30 or (r ->> 'aciertos')::int <> 1 then raise exception 'FALLO: %', r; end if;
  if ev <> 1 then raise exception 'FALLO: evidencias de práctica=%', ev; end if;
  if escribio then raise exception 'FALLO: un estudiante escribió en el banco'; end if;
  raise exception 'OK práctica';
end $$;

-- 7. Sesiones y recursos: los miembros leen, solo el docente escribe
do $$
declare d uuid; e uuid; ed uuid; leidas int; escribio boolean := false;
begin
  select id into d from public.perfiles where rol = 'docente' limit 1;
  select p.id, m.edicion_id into e, ed from public.perfiles p join public.matriculas m on m.perfil_id = p.id where p.rol = 'estudiante' limit 1;
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into public.sesiones (edicion_id, codigo, tema) values (ed, '__p', 't');
  perform set_config('request.jwt.claims', json_build_object('sub', e, 'role', 'authenticated')::text, true);
  select count(*) into leidas from public.sesiones where codigo = '__p';
  begin insert into public.sesiones (edicion_id, codigo, tema) values (ed, '__q', 'x'); escribio := true; exception when others then null; end;
  if leidas <> 1 then raise exception 'FALLO: el estudiante no lee las sesiones'; end if;
  if escribio then raise exception 'FALLO: el estudiante escribió una sesión'; end if;
  raise exception 'OK sesiones';
end $$;

-- 8. Agregados y liga: el observador y el docente ven resúmenes solo con 5 estudiantes o más; la liga solo da usuario y XP
do $$
declare d uuid; e uuid; ed uuid; filas int; r jsonb; rechazado boolean := false;
begin
  select id into d from public.perfiles where rol = 'docente' limit 1;
  select p.id, m.edicion_id into e, ed from public.perfiles p join public.matriculas m on m.perfil_id = p.id where p.rol = 'estudiante' limit 1;
  perform set_config('request.jwt.claims', json_build_object('sub', e, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into filas from public.liga_semanal(ed);
  begin perform public.resumen_agregado(ed); exception when others then rechazado := true; end;
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
  r := public.resumen_agregado(ed);
  if filas < 1 then raise exception 'FALLO: la liga está vacía'; end if;
  if not rechazado then raise exception 'FALLO: un estudiante pudo pedir el resumen agregado'; end if;
  if (r ->> 'estudiantes')::int < 5 and (r ->> 'visible')::boolean then raise exception 'FALLO: mostró datos con menos de 5 estudiantes'; end if;
  raise exception 'OK agregados';
end $$;

-- 9. Errores del cliente: cada persona registra los suyos y solo el docente los lee
do $$
declare d uuid; e uuid; ajeno boolean := false; largo boolean := false; vistos_estudiante int; vistos_docente int;
begin
  select id into d from public.perfiles where rol = 'docente' limit 1;
  select id into e from public.perfiles where rol = 'estudiante' limit 1;
  perform set_config('request.jwt.claims', json_build_object('sub', e, 'role', 'authenticated')::text, true);
  set local role authenticated;
  insert into public.errores_cliente (perfil_id, origen, mensaje) values (e, 'ventana', '__prueba');
  begin insert into public.errores_cliente (perfil_id, origen, mensaje) values (d, 'ventana', '__ajeno'); ajeno := true; exception when others then null; end;
  begin insert into public.errores_cliente (perfil_id, origen, mensaje) values (e, 'ventana', repeat('x', 501)); largo := true; exception when others then null; end;
  select count(*) into vistos_estudiante from public.errores_cliente;
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
  select count(*) into vistos_docente from public.errores_cliente where mensaje = '__prueba';
  if ajeno then raise exception 'FALLO: registró un error a nombre de otra persona'; end if;
  if largo then raise exception 'FALLO: aceptó un mensaje de más de 500 caracteres'; end if;
  if vistos_estudiante <> 0 then raise exception 'FALLO: un estudiante lee los errores'; end if;
  if vistos_docente <> 1 then raise exception 'FALLO: el docente no lee los errores (%)', vistos_docente; end if;
  raise exception 'OK errores del cliente';
end $$;

-- 10. Ninguna política queda abierta al rol público: todas son para authenticated
do $$
declare abiertas int;
begin
  select count(*) into abiertas from pg_policies where schemaname = 'public' and 'public' = any (roles);
  if abiertas > 0 then raise exception 'FALLO: % políticas abiertas al rol público', abiertas; end if;
  raise exception 'OK políticas solo para authenticated';
end $$;

-- 11. Modo invitado: con el código y un apodo se entra a la clase, se compite en el marcador y no se escala nada
do $$
declare d uuid; ed uuid; inv uuid := gen_random_uuid(); f uuid; q uuid; cod text; entrada uuid; malo boolean := false; cerrado boolean := false; abrio boolean := false; filas int; pts int; rol_final text;
begin
  select id into d from public.perfiles where rol = 'docente' limit 1;
  select edicion_id into ed from public.matriculas limit 1;
  insert into auth.users (id, aud, role, is_anonymous) values (inv, 'authenticated', 'authenticated', true);
  if not exists (select 1 from public.perfiles where id = inv and es_invitado and correo is null) then raise exception 'FALLO: la sesión anónima no creó un perfil de invitado'; end if;
  insert into public.formularios (edicion_id, tipo, titulo, anonimo, duracion_segundos) values (ed, 'relampago', '__prueba', false, 60) returning id into f;
  insert into public.preguntas_formulario (formulario_id, orden, tipo, enunciado, opciones) values (f, 1, 'opcion', 'x', '{a,b}') returning id into q;
  insert into public.claves_formulario values (q, 1);
  perform set_config('request.jwt.claims', json_build_object('sub', inv, 'role', 'authenticated')::text, true);
  set local role authenticated;
  begin perform public.unirse_como_invitado('XXXXX', 'Ana'); exception when others then malo := true; end;
  begin perform public.abrir_clase_invitados(ed); abrio := true; exception when others then null; end;
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
  cod := public.abrir_clase_invitados(ed);
  perform public.abrir_formulario(f);
  perform set_config('request.jwt.claims', json_build_object('sub', inv, 'role', 'authenticated')::text, true);
  entrada := public.unirse_como_invitado(lower(cod), 'Ana');
  perform public.responder_formulario(f, jsonb_build_array(jsonb_build_object('pregunta_id', q, 'opcion', 1)));
  select count(*), max(puntos) into filas, pts from public.marcador_clase(ed);
  perform set_config('request.jwt.claims', json_build_object('sub', d, 'role', 'authenticated')::text, true);
  perform public.cerrar_clase_invitados(ed);
  perform set_config('request.jwt.claims', json_build_object('sub', inv, 'role', 'authenticated')::text, true);
  begin perform public.unirse_como_invitado(cod, 'Ana'); exception when others then cerrado := true; end;
  reset role;
  select rol::text into rol_final from public.perfiles where id = inv;
  if not malo then raise exception 'FALLO: aceptó un código inválido'; end if;
  if abrio then raise exception 'FALLO: un invitado pudo abrir la clase'; end if;
  if entrada <> ed then raise exception 'FALLO: no lo matriculó en el curso'; end if;
  if filas <> 1 or pts < 100 or pts > 150 then raise exception 'FALLO: marcador filas=% puntos=%', filas, pts; end if;
  if not cerrado then raise exception 'FALLO: entró con la clase cerrada'; end if;
  if rol_final <> 'estudiante' then raise exception 'FALLO: el invitado tiene rol %', rol_final; end if;
  raise exception 'OK modo invitado';
end $$;
