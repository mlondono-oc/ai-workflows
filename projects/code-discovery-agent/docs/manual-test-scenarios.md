# Escenarios manuales MVP (DoD)

Este documento define una validacion manual minima para los 4 casos de uso del MVP.

## Prerrequisitos

- Tener `env.local` con `OPENROUTER_API_KEY` valido y `OPENROUTER_MODEL=anthropic/claude-sonnet-4.5`.
- Instalar dependencias en `projects/code-discovery-agent` con `npm install`.
- Ejecutar desde `projects/code-discovery-agent`.

## Escenario 1: Analisis de proyecto completo

**Objetivo:** confirmar que el agente usa la documentacion del proyecto para describir su proposito real, no el codigo scaffold.

1. Ejecutar:
   - `npm run dev -- "Analiza el proyecto image-link"`
2. Verificar que la respuesta:
   - este en espanol,
   - en la seccion **Que es** describa image-link como una plataforma de etiquetado y exploracion de datasets de imagenes con embeddings y clustering (segun `docs/image-link-brief.md`), no como una app genérica de CRUD de proyectos,
   - incluya secciones **Estructura**, **Flujo principal** y **Diagrama**,
   - mencione rutas reales de archivos del proyecto analizado.

## Escenario 2: Diagrama de secuencia del flujo principal

**Objetivo:** validar que el agente genere un diagrama de secuencia Mermaid persistido como `.md` y `.html`.

1. Ejecutar:
   - `npm run dev -- "Genera un diagrama del flujo de login en image-link"`
2. Verificar que la salida:
   - incluya rutas a dos artefactos: `.artifacts/diagrams/diagram-*.md` y `.artifacts/diagrams/diagram-*.html`,
   - el archivo `.html` se abra en el navegador y renderice el diagrama sin extensiones adicionales,
   - el diagrama sea un `sequenceDiagram` con actores y mensajes reales del flujo de login.

## Escenario 3: Analisis de modulo o carpeta

**Objetivo:** confirmar que el agente explica el proposito de un modulo y las relaciones entre sus archivos.

1. Ejecutar:
   - `npm run dev -- "Explica el modulo auth de image-link"`
2. Verificar que la respuesta:
   - describa la responsabilidad del modulo `auth` dentro del sistema,
   - liste los archivos clave con descripcion de lo que hace cada uno,
   - explique como se relacionan entre si (imports, dependencias, flujo).

## Escenario 4: Flujo de una funcion

**Objetivo:** comprobar que el agente explique el flujo de una funcion concreta basandose en el codigo real leido.

1. Ejecutar:
   - `npm run dev -- "Explica el flujo de la funcion runAgent del archivo src/agent/runAgent.ts"`
2. Verificar que la respuesta:
   - incluya las secciones **Proposito**, **Firma**, **Logica interna** y **Llamadas que hace**,
   - cite fragmentos reales del codigo (no descripciones vagas),
   - no invente funciones fuera del archivo analizado.

## Criterio de aprobacion

Los 4 escenarios se consideran aprobados cuando:

- el agente usa la documentacion del proyecto (brief/README) para describir el proposito — no infiere desde nombres de archivos,
- los diagramas son `sequenceDiagram` con flujo real, disponibles en `.html` y renderizables en el navegador,
- las explicaciones citan funciones y archivos reales con fragmentos de codigo,
- no hay errores de guardrails en solicitudes validas,
- las respuestas estan en espanol.
