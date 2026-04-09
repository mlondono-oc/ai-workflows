import { render, screen } from "@testing-library/react";

import App from "./App";

describe("App", () => {
  it("muestra el titulo de ImageLink", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /imagelink/i })).toBeInTheDocument();
  });

  it("muestra un texto de estado inicial", () => {
    render(<App />);
    expect(screen.getByText(/frontend inicial listo/i)).toBeInTheDocument();
  });
});
