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

Variables de entorno (Supabase): copia el ejemplo dentro de `backend/` y edita si usas otro proyecto o URL.

```bash
cd backend
cp .env.example .env
```

Se carga siempre `backend/.env` (ruta fija respecto al paquete). Si el archivo no existe, se usan los valores por defecto del Supabase local del CLI.

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

## Base de datos (Supabase)

- Migraciones SQL en `supabase/migrations/`.
- Aplicar localmente: `supabase migration up` (desde la raiz del proyecto, carpeta con `supabase/`).
- Reset local (migraciones + `supabase/seed.sql`): `supabase db reset`.
- Validacion manual del esquema: ejecutar `supabase/tests/schema_validation.sql` contra Postgres local (por ejemplo con `psql` o `docker exec` al contenedor `supabase_db_image-link`).
