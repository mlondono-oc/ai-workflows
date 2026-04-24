# Escenarios manuales MVP (DoD)

Este documento define una validacion manual minima para los 3 casos de uso del MVP.

## Prerrequisitos

- Tener `env.local` con `OPENROUTER_API_KEY` valido.
- Instalar dependencias en `projects/code-discovery-agent` con `npm install`.
- Ejecutar desde `projects/code-discovery-agent`.

## Escenario 1: Analisis de archivo/directorio

**Objetivo:** confirmar que el agente puede analizar codigo real del repositorio.

1. Ejecutar:
   - `npm run dev -- "Analiza el archivo src/agent/runAgent.ts y resume sus responsabilidades"`
2. Verificar que la respuesta:
   - este en espanol,
   - incluya secciones de **Resumen**, **Alcance**, **Flujo** y **Diagrama**,
   - mencione rutas reales del codigo analizado.

## Escenario 2: Diagrama de arquitectura del modulo

**Objetivo:** validar que el agente genere un diagrama compatible con Excalidraw.

1. Ejecutar:
   - `npm run dev -- "Genera un diagrama de arquitectura para src/agent y entrégalo en JSON Excalidraw"`
2. Verificar que la salida:
   - incluya un bloque JSON con `type: "excalidraw"`,
   - contenga `elements` con nodos y flechas,
   - sea importable en Excalidraw sin errores.

## Escenario 3: Flujo de una funcion

**Objetivo:** comprobar que el agente explique el flujo de una funcion concreta.

1. Ejecutar:
   - `npm run dev -- "Explica el flujo de la funcion runAgent del archivo src/agent/runAgent.ts"`
2. Verificar que la respuesta:
   - describa pasos en orden,
   - identifique decisiones clave (validacion, ejecucion y normalizacion),
   - no invente funciones fuera del archivo analizado.

## Criterio de aprobacion

Los 3 escenarios se consideran aprobados cuando:

- la salida mantiene formato minimo del MVP,
- no hay errores de guardrails en solicitudes validas,
- el contenido refleja solo informacion observada en el codigo.
