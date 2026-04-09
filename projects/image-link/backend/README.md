# Backend - ImageLink

API en FastAPI para ImageLink.

## Setup

```bash
uv sync
```

Si `uv` no esta disponible en tu sistema:

```bash
python -m venv .venv
. .venv/bin/activate
pip install -e ".[dev]"
```

## Ejecutar API

```bash
uv run uvicorn backend.main:app --reload
```

## Tests unitarios

```bash
uv run pytest
```

Los tests estan en `tests/` y usan `pytest` + `fastapi.testclient`.
