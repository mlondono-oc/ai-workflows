import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("redirige a login cuando no hay sesión", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /imagelink/i })).toBeInTheDocument();
    expect(screen.getByText(/inicia sesión/i)).toBeInTheDocument();
  });
});
