import { API_BASE } from "../config";

export async function loginRequest(
  email: string,
  password: string
): Promise<{ access_token: string }> {
  const r = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(text || r.statusText);
  }
  return r.json() as Promise<{ access_token: string }>;
}

export async function fetchMe(token: string): Promise<{ id: string; email: string | null }> {
  const r = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ id: string; email: string | null }>;
}
