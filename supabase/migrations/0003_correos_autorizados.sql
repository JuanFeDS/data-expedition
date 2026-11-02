-- Lista de correos que pueden registrarse. Sin fila aquí, nadie crea cuenta (ni con enlace ni con Google).
-- El rol de la fila es el que recibe la persona al registrarse.
create table public.correos_autorizados (
  correo text primary key check (correo = lower(correo)),
  rol public.rol_usuario not null default 'estudiante',
  creado_en timestamptz not null default now()
);

alter table public.correos_autorizados enable row level security;

create policy correos_autorizados_docente on public.correos_autorizados
  for all to authenticated
  using (public.es_docente()) with check (public.es_docente());

create function public.exigir_correo_autorizado() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.correos_autorizados where correo = lower(new.email)) then
    raise exception 'correo_no_autorizado';
  end if;
  return new;
end;
$$;

revoke execute on function public.exigir_correo_autorizado() from public, anon, authenticated;

create trigger antes_de_crear_usuario
before insert on auth.users
for each row execute function public.exigir_correo_autorizado();

create or replace function public.crear_perfil_al_registrarse() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.perfiles (id, correo, rol)
  values (
    new.id,
    new.email,
    coalesce((select rol from public.correos_autorizados where correo = lower(new.email)), 'estudiante')
  );
  return new;
end;
$$;
