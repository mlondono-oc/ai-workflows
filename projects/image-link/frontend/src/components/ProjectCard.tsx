import type { Project } from "../services/projects";

type Props = {
  project: Project;
  onEdit: (project: Project) => void;
};

export function ProjectCard({ project, onEdit }: Props) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{project.name}</h2>
      {project.description ? (
        <p className="mt-1 text-sm text-slate-600">{project.description}</p>
      ) : null}
      <button
        type="button"
        className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"
        onClick={() => onEdit(project)}
      >
        Editar
      </button>
    </article>
  );
}
