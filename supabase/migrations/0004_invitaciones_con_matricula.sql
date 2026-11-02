-- Cada invitación puede traer la edición y el grupo donde se matricula la persona al registrarse.
alter table public.correos_autorizados
  add column edicion_id uuid references public.ediciones (id) on delete cascade,
  add column grupo_id uuid references public.grupos (id) on delete set null;

create index on public.correos_autorizados (edicion_id);
create index on public.correos_autorizados (grupo_id);

create or replace function public.crear_perfil_al_registrarse() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_invitacion public.correos_autorizados;
begin
  select * into v_invitacion from public.correos_autorizados where correo = lower(new.email);

  insert into public.perfiles (id, correo, rol)
  values (new.id, new.email, coalesce(v_invitacion.rol, 'estudiante'));

  if v_invitacion.rol = 'estudiante' and v_invitacion.edicion_id is not null then
    insert into public.matriculas (perfil_id, edicion_id, grupo_id)
    values (
      new.id,
      v_invitacion.edicion_id,
      (select id from public.grupos where id = v_invitacion.grupo_id and edicion_id = v_invitacion.edicion_id)
    );
  end if;
  return new;
end;
$$;
