-- Usuario público de cada persona: lo elige en su primer ingreso y es único sin distinguir mayúsculas.
alter table public.perfiles add column usuario text;

alter table public.perfiles
  add constraint perfiles_usuario_formato check (usuario ~ '^[a-z0-9_]{3,20}$');

create unique index perfiles_usuario_unico on public.perfiles (usuario);

grant update (usuario) on public.perfiles to authenticated;

create function public.usuario_disponible(p_usuario text) returns boolean
language sql stable security definer set search_path = ''
as $$ select not exists (select 1 from public.perfiles where usuario = lower(p_usuario)) $$;

revoke execute on function public.usuario_disponible(text) from public, anon;
grant execute on function public.usuario_disponible(text) to authenticated;
