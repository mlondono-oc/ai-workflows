# ImageLink - Setup Inicial

Este proyecto tiene dos aplicaciones:

- `backend`: API en FastAPI (Python + `uv`)
- `frontend`: cliente web en React + Vite (TypeScript + `npm`)

## Estructura

```text
image-link/
  backend/
  frontend/
  docs/
```

## Requisitos

- Python 3.10+
- Node.js 20+
- `uv` instalado globalmente

## Backend

Instalacion:

```bash
cd backend
uv sync
```

Ejecutar API:

```bash
uv run uvicorn backend.main:app --reload
```

Ejecutar tests unitarios:

```bash
uv run pytest
```

## Frontend

Instalacion:

```bash
cd frontend
npm install
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Ejecutar tests unitarios:

```bash
npm test
```

## Convencion de tests unitarios

- Backend: `pytest` en `backend/tests/`.
- Frontend: `vitest` + `@testing-library/react` en `frontend/src/*.test.tsx`.
- Cada nuevo comportamiento debe agregar primero un test en estado RED.
- Luego se implementa el minimo codigo para pasar a GREEN.
