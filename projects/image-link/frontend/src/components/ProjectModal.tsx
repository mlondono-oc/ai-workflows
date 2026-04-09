import { useEffect, useState } from "react";

import type { Project } from "../services/projects";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Project | null;
  onClose: () => void;
  onSave: (payload: { name: string; description: string }) => void | Promise<void>;
};

export function ProjectModal({ open, mode, initial, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === "edit" && initial) {
      setName(initial.name);
      setDescription(initial.description ?? "");
    } else {
      setName("");
      setDescription("");
    }
  }, [open, mode, initial]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("El nombre es obligatorio");
      return;
    }
    setError(null);
    await onSave({ name: trimmed, description: description.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-900">
          {mode === "create" ? "Nuevo proyecto" : "Editar proyecto"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="project-desc" className="block text-sm font-medium text-slate-700">
              Descripción
            </label>
            <textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
