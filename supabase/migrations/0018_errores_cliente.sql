-- Errores que ocurren en el navegador de las personas (fallos de dibujo, excepciones sin atrapar y promesas rechazadas).
-- Cada persona registra solo los suyos y solo el docente los lee. Los límites de tamaño evitan que la tabla se llene de texto.

create table public.errores_cliente (
  id bigint generated always as identity primary key,
  creado_en timestamptz not null default now(),
  perfil_id uuid,
  origen text not null check (origen in ('ventana', 'promesa', 'interfaz')),
  mensaje text not null check (char_length(mensaje) <= 500),
  pila text check (char_length(pila) <= 4000),
  ruta text check (char_length(ruta) <= 200),
  agente text check (char_length(agente) <= 300)
);

create index on public.errores_cliente (creado_en desc);
create index on public.errores_cliente (mensaje, creado_en desc);

alter table public.errores_cliente enable row level security;
revoke update, delete, truncate on public.errores_cliente from anon, authenticated;

create policy errores_insertar on public.errores_cliente for insert to authenticated
  with check (perfil_id = (select auth.uid()));
create policy errores_leer on public.errores_cliente for select to authenticated
  using (public.es_docente());
