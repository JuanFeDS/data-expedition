# Encuestas, votaciones y preguntas relámpago

Lista de lo que se va a necesitar durante el curso y propuesta de un sistema, dentro de la app, para que el docente cree y guarde formularios sin esfuerzo. Todo es borrador.

## 1. Lista de encuestas

| # | Nombre | Cuándo | Tipo | Anonimato | Qué decisión alimenta |
|---|---|---|---|---|---|
| 1 | Autorización de tratamiento de datos | Antes de la S1 | Aceptación | Identificada | Requisito legal para guardar datos de los estudiantes (RFC, Ley 1581) |
| 2 | Contexto y expectativas | Antes de la S1 o en la S1 | Mixta | Identificada | Experiencia previa, objetivos, horas disponibles por semana, acceso a internet |
| 3 | Censo de equipos y entorno | S1 | Opción única | Identificada | Sistema operativo, memoria y navegador: define si Power BI es viable y si hace falta respaldo para Spark |
| 4 | Autoinforme de habilidades | Diagnóstico (S1) y forma B (S14) | Escala 1 a 5 | Identificada | Brecha entre lo que creen y lo que hacen, y cambio entre el inicio y el final |
| 5 | Uso y actitud frente a la IA | S1 y S16 | Mixta | Identificada | Cuánto cambia el uso de la IA a lo largo del curso (Dirección de IA) |
| 6 | Votación de librería de visualización | S4 | Opción única, en vivo | Anónima | Librería del T1 y del resto del curso |
| 7 | Votación de herramienta de dashboards | S9 | Opción única, en vivo | Anónima | Herramienta del T4 |
| 8 | Pulso semanal | Cierre de cada sesión B (8 veces) | 3 preguntas | Anónima | Ritmo (muy lento a muy rápido), claridad (1 a 5), qué mantener o cambiar. Es la retro individual de Scrum |
| 9 | Retro del equipo | S12, S14 y S16 | Mixta | Por equipo | Qué mantener, dejar y empezar; alimenta los sprints siguientes |
| 10 | Evaluación entre pares del equipo | S16 | Escala y texto | Confidencial para el docente | Aportes individuales al integrador, que pesan en el radar por rol |
| 11 | Seguimiento de quien no entrega | Cuando falta una entrega | 2 preguntas | Identificada | Razón (tiempo, técnica, comprensión) para intervenir a tiempo |
| 12 | Salida y satisfacción | S16 | Mixta | Anónima, con opción de dar testimonio | Qué cambiar para la siguiente edición |

Las encuestas 4, 5 y 12 comparten preguntas entre el inicio y el final para poder comparar.

## 2. Preguntas relámpago

Además de las encuestas, el curso usa preguntas relámpago con bonificación (plan de estudios, 12.4). Son una variante del mismo mecanismo: una pregunta con respuesta correcta, ventana de tiempo corta y XP.

## 3. Sistema para el docente (propuesta)

La idea es **un único módulo de formularios** que cubra tres usos: encuesta, votación y pregunta relámpago. Así se construye una vez.

**Qué puede hacer el docente:**
- Crear un formulario en menos de un minuto. Puede pegar las preguntas como texto simple y la app las convierte, o usar una plantilla ya guardada.
- Elegir el tipo de pregunta: opción única, opción múltiple, escala de 1 a 5, sí o no, número, texto corto y texto largo.
- Configurar:
  - Anónimo o identificado.
  - Apertura y cierre: manual, o con fecha y hora, o con cuenta regresiva visible.
  - Un solo intento.
  - Si se muestran los resultados: nunca, en vivo o al cerrar.
  - Para las relámpago: respuesta correcta, explicación, ventana de tiempo y XP de bonificación.
- Repartirlo con un **enlace corto y un código QR** generados automáticamente.
- Ver los resultados agregados en vivo y exportarlos a CSV.
- **Guardar y reutilizar**: cada formulario queda guardado, se puede duplicar y se copia con la edición del curso (F2), igual que los trabajos y las rúbricas.

**Reglas de privacidad:**
- En las anónimas no se guarda quién respondió, solo el contenido.
- El observador solo ve agregados, con el mismo mínimo de personas que el resto de la app.

**Para empezar (versión mínima):** crear, abrir y cerrar, enlace y QR, resultados en vivo, plantillas guardadas. Queda fuera por ahora la lógica condicional y la ramificación de preguntas.

**Mientras la app no esté lista:** Google Forms o una hoja de cálculo con las mismas preguntas guardadas como plantilla (plan B del RFC, hito H1). La pregunta relámpago se hace con un formulario que se cierra a mano.

**Pendiente de decidir:** agregar al RFC-010 los requisitos F22 (encuestas y votaciones guardadas) y F23 (preguntas relámpago con QR y bonificación). No se editó el RFC.
