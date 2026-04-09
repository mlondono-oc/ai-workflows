import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../context/AuthContext";
import { HomePage } from "./HomePage";

function renderHome() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("HomePage", () => {
  beforeEach(() => {
    localStorage.setItem("imagelink_access_token", "fake-token");
    vi.restoreAllMocks();
  });

  it("renders project cards when projects exist", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "",
      json: async () => [
        {
          id: "a",
          owner_id: "o",
          name: "Proyecto A",
          description: "Desc A",
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ],
    } as Response);

    renderHome();

    await waitFor(() => {
      expect(screen.getByText("Proyecto A")).toBeInTheDocument();
    });
    expect(screen.getByText("Desc A")).toBeInTheDocument();
  });

  it("shows empty state when no projects", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "",
      json: async () => [],
    } as Response);

    renderHome();

    await waitFor(() => {
      expect(screen.getByText(/no tienes proyectos/i)).toBeInTheDocument();
    });
  });
});
