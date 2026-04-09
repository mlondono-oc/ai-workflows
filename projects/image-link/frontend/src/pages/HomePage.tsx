import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProjectCard } from "../components/ProjectCard";
import { ProjectModal } from "../components/ProjectModal";
import { useAuth } from "../context/AuthContext";
import {
  createProject,
  listProjects,
  updateProject,
  type Project,
} from "../services/projects";

export function HomePage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Project | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoadError(null);
    try {
      const list = await listProjects(token);
      setProjects(list);
    } catch {
      setLoadError("No se pudieron cargar los proyectos");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setModalMode("create");
    setModalOpen(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setModalMode("edit");
    setModalOpen(true);
  }

  async function handleSave(payload: { name: string; description: string }) {
    if (!token) return;
    if (modalMode === "create") {
      const created = await createProject(token, {
        name: payload.name,
        description: payload.description || null,
      });
      setProjects((prev) => [...prev, created]);
    } else if (editing) {
      const updated = await updateProject(token, editing.id, {
        name: payload.name,
        description: payload.description || null,
      });
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
    setModalOpen(false);
    setEditing(null);
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">ImageLink</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-800">Mis proyectos</h2>
          <button
            type="button"
            onClick={openCreate}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Nuevo proyecto
          </button>
        </div>
        {loading ? (
          <p className="text-slate-600">Cargando…</p>
        ) : loadError ? (
          <p className="text-red-600">{loadError}</p>
        ) : projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-slate-600">No tienes proyectos</p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Crear proyecto
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} onEdit={openEdit} />
            ))}
          </div>
        )}
      </main>
      <ProjectModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
