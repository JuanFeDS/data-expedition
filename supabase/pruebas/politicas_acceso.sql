-- Pruebas de las politicas de acceso por fila. Se corren como el rol postgres (por ejemplo con el
-- editor SQL de Supabase) y deben devolver `ok = true` en las 28 filas.
-- Cada prueba ejecuta una operacion COMO un usuario (con su rol y su identificador) y compara el
-- resultado con lo esperado. Los usuarios llevan el dominio @prueba.invalid y se borran al final.
-- Ejecutar en 3 pasos: preparar, probar y limpiar.

-- ============ 1. PREPARAR ============
insert into public.ediciones (id, nombre) values ('b0000000-0000-0000-0000-000000000001', 'PRUEBA');
insert into public.grupos (id, edicion_id, nombre) values ('b1000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'G1');
insert into public.correos_autorizados (correo, rol, edicion_id, grupo_id) values
 ('estudiante1@prueba.invalid', 'estudiante', null, null),
 ('estudiante2@prueba.invalid', 'estudiante', null, null),
 ('docente@prueba.invalid', 'estudiante', null, null),
 ('observador@prueba.invalid', 'estudiante', null, null),
 ('invitado@prueba.invalid', 'estudiante', 'b0000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001');
insert into auth.users (id, email, instance_id, aud, role, email_confirmed_at) values
 ('a0000000-0000-0000-0000-000000000001', 'estudiante1@prueba.invalid', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', now()),
 ('a0000000-0000-0000-0000-000000000002', 'estudiante2@prueba.invalid', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', now()),
 ('a0000000-0000-0000-0000-000000000003', 'docente@prueba.invalid', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', now()),
 ('a0000000-0000-0000-0000-000000000004', 'observador@prueba.invalid', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', now()),
 ('a0000000-0000-0000-0000-000000000005', 'invitado@prueba.invalid', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', now());
update public.perfiles set rol = 'docente' where id = 'a0000000-0000-0000-0000-000000000003';
update public.perfiles set rol = 'observador' where id = 'a0000000-0000-0000-0000-000000000004';
update public.perfiles set usuario = 'est_uno' where id = 'a0000000-0000-0000-0000-000000000001';
insert into public.matriculas (perfil_id, edicion_id, grupo_id) values
 ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001'),
 ('a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001');
insert into public.trabajos (id, edicion_id, nombre) values ('b2000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'T-prueba');
insert into public.dimensiones (id, edicion_id, nombre) values ('b3000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'D-prueba');
insert into public.entregas (id, trabajo_id, perfil_id, modo_ia, estado) values
 ('b4000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'sin_ia', 'entregada'),
 ('b4000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'sin_ia', 'entregada');
insert into public.evidencias_radar (perfil_id, dimension_id, fuente, valor) values
 ('a0000000-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001', 'trabajo', 60),
 ('a0000000-0000-0000-0000-000000000002', 'b3000000-0000-0000-0000-000000000001', 'trabajo', 40);

-- ============ 2. PROBAR ============
create function pg_temp.ejecutar(p_usuario uuid, p_rol text, p_sql text) returns text
language plpgsql as $$
declare v_n bigint; v_msg text;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_usuario, 'role', p_rol)::text, true);
  execute format('set local role %I', p_rol);
  begin
    execute p_sql;
    get diagnostics v_n = row_count;
    v_msg := 'filas=' || v_n;
  exception when others then
    v_msg := 'error ' || sqlstate || ' ' || left(sqlerrm, 70);
  end;
  reset role;
  return v_msg;
end $$;

with c as (
  select 'a0000000-0000-0000-0000-000000000001'::uuid e1, 'a0000000-0000-0000-0000-000000000002'::uuid e2,
         'a0000000-0000-0000-0000-000000000003'::uuid doc, 'a0000000-0000-0000-0000-000000000004'::uuid obs,
         'b0000000-0000-0000-0000-000000000001'::uuid ed, 'b2000000-0000-0000-0000-000000000001'::uuid tr,
         'b3000000-0000-0000-0000-000000000001'::uuid dim, 'b4000000-0000-0000-0000-000000000001'::uuid ent1
), t as (
  select 1 n, 'Estudiante: lee solo su perfil' prueba, 'filas=1' esperado, pg_temp.ejecutar(e1, 'authenticated', 'select * from public.perfiles') r from c
  union all select 2, 'Estudiante: lee solo sus entregas', 'filas=1', pg_temp.ejecutar(e1, 'authenticated', 'select * from public.entregas') from c
  union all select 3, 'Estudiante: no puede subirse el rol', 'error 42501%', pg_temp.ejecutar(e1, 'authenticated', format('update public.perfiles set rol = ''docente'' where id = %L', e1)) from c
  union all select 4, 'Estudiante: si puede cambiar su nombre', 'filas=1', pg_temp.ejecutar(e1, 'authenticated', format('update public.perfiles set nombre = ''X'' where id = %L', e1)) from c
  union all select 5, 'Estudiante: no cambia el nombre de otro', 'filas=0', pg_temp.ejecutar(e1, 'authenticated', format('update public.perfiles set nombre = ''Y'' where id = %L', e2)) from c
  union all select 6, 'Estudiante: no crea entrega a nombre de otro', 'error 42501%', pg_temp.ejecutar(e1, 'authenticated', format('insert into public.entregas (trabajo_id, perfil_id, modo_ia, estado) values (%L, %L, ''sin_ia'', ''borrador'')', tr, e2)) from c
  union all select 7, 'Estudiante: no se pone nota', 'error 42501%', pg_temp.ejecutar(e1, 'authenticated', format('update public.entregas set nota = 5 where id = %L', ent1)) from c
  union all select 8, 'Estudiante: no asigna roles', 'error P0001 Solo el docente%', pg_temp.ejecutar(e1, 'authenticated', format('select public.asignar_rol(%L, ''docente'')', e2)) from c
  union all select 9, 'Estudiante: no usa los resumenes del observador', 'error P0001 Sin acceso%', pg_temp.ejecutar(e1, 'authenticated', format('select * from public.resumen_dimensiones_por_grupo(%L)', ed)) from c
  union all select 10, 'Estudiante: no escribe evidencias del radar', 'error 42501%', pg_temp.ejecutar(e1, 'authenticated', format('insert into public.evidencias_radar (perfil_id, dimension_id, fuente, valor) values (%L, %L, ''leccion'', 99)', e1, dim)) from c
  union all select 11, 'Estudiante: ve solo su edicion', 'filas=1', pg_temp.ejecutar(e1, 'authenticated', 'select * from public.ediciones') from c
  union all select 12, 'Anonimo: no lee perfiles', 'filas=0|error 42501%', pg_temp.ejecutar(e1, 'anon', 'select * from public.perfiles') from c
  union all select 13, 'Anonimo: no llama asignar_rol', 'error 42501%', pg_temp.ejecutar(e1, 'anon', format('select public.asignar_rol(%L, ''docente'')', e1)) from c
  union all select 14, 'Docente: ve todos los perfiles', 'filas=' || (5 + (select count(*) from public.perfiles where correo not like '%@prueba.invalid')), pg_temp.ejecutar(doc, 'authenticated', 'select * from public.perfiles') from c
  union all select 15, 'Docente: asigna un rol', 'filas=1', pg_temp.ejecutar(doc, 'authenticated', format('select public.asignar_rol(%L, ''observador'')', e2)) from c
  union all select 16, 'Observador: solo ve su perfil', 'filas=1', pg_temp.ejecutar(obs, 'authenticated', 'select * from public.perfiles') from c
  union all select 17, 'Observador: no ve entregas', 'filas=0', pg_temp.ejecutar(obs, 'authenticated', 'select * from public.entregas') from c
  union all select 18, 'Observador: no ve ediciones', 'filas=0', pg_temp.ejecutar(obs, 'authenticated', 'select * from public.ediciones') from c
  union all select 19, 'Observador: resumen oculto con menos de 5 personas', 'filas=0', pg_temp.ejecutar(obs, 'authenticated', format('select * from public.resumen_dimensiones_por_grupo(%L)', ed)) from c
  union all select 20, 'Observador: no asigna roles', 'error P0001 Solo el docente%', pg_temp.ejecutar(obs, 'authenticated', format('select public.asignar_rol(%L, ''docente'')', e1)) from c
  union all select 21, 'Estudiante: si elige su usuario', 'filas=1', pg_temp.ejecutar(e2, 'authenticated', format('update public.perfiles set usuario = ''est_dos'' where id = %L', e2)) from c
  union all select 22, 'Estudiante: usuario repetido se rechaza', 'error 23505%', pg_temp.ejecutar(e2, 'authenticated', format('update public.perfiles set usuario = ''est_uno'' where id = %L', e2)) from c
  union all select 23, 'Estudiante: usuario con formato invalido se rechaza', 'error 23514%', pg_temp.ejecutar(e2, 'authenticated', format('update public.perfiles set usuario = ''A'' where id = %L', e2)) from c
  union all select 24, 'Estudiante: no cambia el usuario de otro', 'filas=0', pg_temp.ejecutar(e2, 'authenticated', format('update public.perfiles set usuario = ''robado'' where id = %L', e1)) from c
  union all select 25, 'Invitado: se matricula solo en su grupo', 'filas=1', pg_temp.ejecutar(doc, 'authenticated', 'select * from public.matriculas where perfil_id = ''a0000000-0000-0000-0000-000000000005'' and grupo_id = ''b1000000-0000-0000-0000-000000000001''') from c
  union all select 26, 'Estudiante: no ve la lista de invitados', 'filas=0', pg_temp.ejecutar(e1, 'authenticated', 'select * from public.correos_autorizados') from c
  union all select 27, 'Estudiante: no invita a nadie', 'error 42501%', pg_temp.ejecutar(e1, 'authenticated', 'insert into public.correos_autorizados (correo) values (''x@prueba.invalid'')') from c
  union all select 28, 'Docente: crea grupos', 'filas=1', pg_temp.ejecutar(doc, 'authenticated', format('insert into public.grupos (edicion_id, nombre) values (%L, ''G2'')', ed)) from c
)
select n, prueba, esperado, r as obtenido, (r like any (string_to_array(esperado, '|'))) as ok from t order by n;

-- 2b. Un correo fuera de la lista no puede registrarse (debe terminar sin error visible):
do $$ begin
  begin
    insert into auth.users (id, email, instance_id, aud, role) values ('a0000000-0000-0000-0000-0000000000ff', 'intruso@prueba.invalid', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated');
    raise exception 'el intruso se registro';
  exception when others then
    if sqlerrm <> 'correo_no_autorizado' then raise; end if;
  end;
end $$;

-- ============ 3. LIMPIAR ============
delete from public.ediciones where id = 'b0000000-0000-0000-0000-000000000001';
delete from auth.users where email like '%@prueba.invalid';
delete from public.correos_autorizados where correo like '%@prueba.invalid';
