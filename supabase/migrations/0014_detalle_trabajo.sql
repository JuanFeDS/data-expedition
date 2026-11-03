-- Detalle de cada trabajo: qué se pide y con qué material arrancar.

alter table public.trabajos add column if not exists descripcion text;
alter table public.trabajos add column if not exists entregables text;
alter table public.trabajos add column if not exists enlace_base text;
