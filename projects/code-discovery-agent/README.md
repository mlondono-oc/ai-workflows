# Code Discovery Agent (MVP)

Agente CLI en TypeScript + LangChain para entender codigo de forma didactica.
Este MVP cubre 3 casos de uso:

- Analisis de archivo o directorio.
- Diagrama de arquitectura de un modulo.
- Explicacion del flujo de una funcion.

## Requisitos

- Node.js `>=20`
- `npm`
- API key valida de OpenRouter

## Instalacion

Desde `projects/code-discovery-agent`:

```bash
npm install
```

## Configuracion (`env.local`)

Crea un archivo `env.local` en la raiz de `projects/code-discovery-agent`.

Ejemplo completo:

```env
OPENROUTER_API_KEY=tu_api_key_aqui
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TEMPERATURE=0
OPENROUTER_HTTP_REFERER=
OPENROUTER_APP_TITLE=code-discovery-agent

AGENT_MAX_INPUT_LENGTH=2000
AGENT_MAX_OUTPUT_LENGTH=5000
AGENT_MAX_ITERATIONS=5
AGENT_VERBOSE=false

AGENT_MAX_FILE_SIZE_BYTES=500000
AGENT_MAX_FILES_PER_ANALYSIS=50
AGENT_MAX_DIRECTORY_DEPTH=5
AGENT_ENABLE_INPUT_FILTER=true
AGENT_ENABLE_OUTPUT_FILTER=true
AGENT_REPO_ROOT=.
```

Notas:

- `OPENROUTER_API_KEY` es obligatoria.
- `AGENT_REPO_ROOT` define el limite de rutas que puede analizar el agente.
- No commitees `env.local`.

## Uso rapido

Ejecuta el agente con:

```bash
npm run dev -- "tu consulta sobre el codigo"
```

Si no envias consulta, el CLI muestra el uso esperado y termina con error.

## Prompts de ejemplo por caso de uso

1) Analisis de archivo/directorio:

```text
Analiza el archivo src/agent/runAgent.ts y resume sus responsabilidades.
```

2) Diagrama de arquitectura:

```text
Genera un diagrama de arquitectura para src/agent y entregalo en JSON Excalidraw.
```

3) Flujo de funcion:

```text
Explica el flujo de la funcion runAgent del archivo src/agent/runAgent.ts.
```

## Formato esperado de salida

El agente responde en espanol y sigue esta estructura minima:

- `Resumen`
- `Alcance`
- `Flujo`
- `Diagrama`
- `Como llegue a esta conclusion`

## Limites del MVP

- Solo lectura del repositorio analizado (no escribe archivos del repo objetivo).
- Solo analiza rutas dentro de `AGENT_REPO_ROOT`.
- Extensiones soportadas para analisis: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.py`, `.go`, `.java`, `.rb`, `.php`.
- Limites por defecto:
  - maximo `50` archivos por analisis,
  - maximo `500000` bytes por archivo,
  - profundidad maxima de directorio `5`.
- Si la consulta es muy amplia, el agente acota alcance.
- Fuera de alcance en este MVP:
  - review automatico de PRs,
  - deteccion/correccion automatica de bugs,
  - generacion de nuevas funcionalidades.

## Desarrollo y pruebas

```bash
npm run test
npm run lint
npm run typecheck
```

Tambien puedes seguir escenarios manuales en:

- `docs/manual-test-scenarios.md`
- `CHANGELOG.md` para el historial de cambios del agente
