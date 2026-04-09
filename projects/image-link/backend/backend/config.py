import os
from pathlib import Path

from dotenv import load_dotenv

_backend_root = Path(__file__).resolve().parent.parent
load_dotenv(_backend_root / ".env")

# Default anon key for local Supabase CLI (`supabase start`).
_LOCAL_SUPABASE_ANON = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9."
    "CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
)


class Settings:
    supabase_url: str
    supabase_anon_key: str

    def __init__(self) -> None:
        self.supabase_url = os.getenv("SUPABASE_URL", "http://127.0.0.1:54321")
        self.supabase_anon_key = os.getenv("SUPABASE_ANON_KEY", _LOCAL_SUPABASE_ANON)


settings = Settings()
