with plantilla as (
  insert into public.ediciones (nombre, es_plantilla)
  values ('Plantilla de ejemplo', true)
  returning id
)
insert into public.dimensiones (edicion_id, nombre, descripcion, orden)
select plantilla.id, d.nombre, d.descripcion, d.orden
from plantilla,
  (values
    ('Datos', 'Obtener, limpiar y entender la calidad de los datos', 1),
    ('Análisis', 'Explorar, formular preguntas y sacar hallazgos', 2),
    ('Modelado', 'Elegir y construir modelos', 3),
    ('Validación', 'Evaluar, comparar y detectar errores o sesgos', 4),
    ('Comunicación', 'Contar el resultado a una audiencia', 5),
    ('Producción', 'Código reproducible y puesta en uso', 6),
    ('Dirección de IA', 'Pedir, revisar, aceptar o descartar lo que produce la IA', 7)
  ) as d (nombre, descripcion, orden);
