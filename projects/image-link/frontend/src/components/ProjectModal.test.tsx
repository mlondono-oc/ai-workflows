import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProjectModal } from "./ProjectModal";

describe("ProjectModal", () => {
  it("calls onSave with project name on submit", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <ProjectModal
        open
        mode="create"
        onClose={onClose}
        onSave={onSave}
      />
    );

    await user.type(screen.getByLabelText(/nombre/i), "  Mi proyecto  ");
    await user.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        name: "Mi proyecto",
        description: "",
      });
    });
  });

  it("shows validation error when name is empty", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <ProjectModal
        open
        mode="create"
        onClose={() => {}}
        onSave={onSave}
      />
    );

    await user.click(screen.getByRole("button", { name: /guardar/i }));

    expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("pre-fills form with project data in edit mode", async () => {
    render(
      <ProjectModal
        open
        mode="edit"
        initial={{
          id: "id-1",
          owner_id: "o",
          name: "Original",
          description: "Desc",
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        }}
        onClose={() => {}}
        onSave={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/nombre/i)).toHaveValue("Original");
    expect(screen.getByLabelText(/descripción/i)).toHaveValue("Desc");
  });
});
