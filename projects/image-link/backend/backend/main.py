from fastapi import FastAPI

app = FastAPI(title="ImageLink API", version="0.1.0")


@app.get("/")
def root() -> dict[str, str]:
    return {"name": "ImageLink API", "version": "0.1.0"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
