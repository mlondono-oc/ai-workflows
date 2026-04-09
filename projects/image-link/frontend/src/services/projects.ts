import { API_BASE } from "../config";

export type Project = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export async function listProjects(token: string): Promise<Project[]> {
  const r = await fetch(`${API_BASE}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<Project[]>;
}

export async function createProject(
  token: string,
  body: { name: string; description?: string | null }
): Promise<Project> {
  const r = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<Project>;
}

export async function updateProject(
  token: string,
  id: string,
  body: { name?: string; description?: string | null }
): Promise<Project> {
  const r = await fetch(`${API_BASE}/projects/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<Project>;
}
