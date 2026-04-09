from supabase import Client, ClientOptions, create_client

from backend.config import settings


def get_auth_client() -> Client:
    """Anon client for GoTrue (login, get_user with JWT). Default PostgREST schema is unused for auth."""
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_db_client(access_token: str) -> Client:
    """PostgREST client with user JWT and imageLINK schema (RLS applies)."""
    opts = ClientOptions(
        schema="imageLINK",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    return create_client(settings.supabase_url, settings.supabase_anon_key, opts)
