import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

afterEach(() => {
  jest.restoreAllMocks();
  window.localStorage.clear();
});

test("renders sidebar title", async () => {
  process.env.REACT_APP_FIREBASE_PROJECT_ID = "demo-project";

  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ documents: [] })
  });

  render(<App />);
  expect(await screen.findByText(/JOVIAT/i)).toBeInTheDocument();
});

test("keeps auth page reachable when Firestore preload fails", async () => {
  process.env.REACT_APP_FIREBASE_PROJECT_ID = "demo-project";

  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 403,
    json: async () => ({})
  });

  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: /login \/ registro/i }));

  expect(await screen.findByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
  expect(screen.getByText(/no se han podido precargar las colecciones remotas/i)).toBeInTheDocument();
});

test("profile does not expose the first student before login", async () => {
  process.env.REACT_APP_FIREBASE_PROJECT_ID = "demo-project";

  const responses = [
    {
      documents: [
        {
          name: "projects/demo/databases/(default)/documents/Alumnos/student-1",
          fields: {
            Name: { stringValue: "Alumno Visible" },
            Email: { stringValue: "alumno@example.com" },
            Phone: { stringValue: "123456789" }
          }
        }
      ]
    },
    { documents: [] },
    { documents: [] },
    { documents: [] }
  ];

  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: async () => responses.shift() || { documents: [] }
    })
  );

  render(<App />);
  fireEvent.click(await screen.findByRole("button", { name: /perfil/i }));

  expect(screen.getByText(/necesitas iniciar sesión para ver datos personales/i)).toBeInTheDocument();
  expect(screen.queryByText(/Alumno Visible/i)).not.toBeInTheDocument();
});
