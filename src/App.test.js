import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

function mockFirestoreFetch(responses) {
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: async () => responses.shift() || { documents: [] }
    })
  );
}

afterEach(() => {
  jest.restoreAllMocks();
  window.localStorage.clear();
});

test("renders sidebar title", async () => {
  process.env.REACT_APP_FIREBASE_PROJECT_ID = "demo-project";
  mockFirestoreFetch([{ documents: [] }, { documents: [] }, { documents: [] }, { documents: [] }]);

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
  expect(screen.getByText(/no se han podido cargar las colecciones remotas/i)).toBeInTheDocument();
});

test("profile does not expose the first student before login", async () => {
  process.env.REACT_APP_FIREBASE_PROJECT_ID = "demo-project";

  mockFirestoreFetch([
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
  ]);

  render(<App />);
  fireEvent.click(await screen.findByRole("button", { name: /perfil/i }));

  expect(screen.getByText(/necesitas iniciar sesión para ver datos personales/i)).toBeInTheDocument();
  expect(screen.queryByText(/Alumno Visible/i)).not.toBeInTheDocument();
});

test("shows admin-only tabs and logout button for administrators", async () => {
  process.env.REACT_APP_FIREBASE_PROJECT_ID = "demo-project";
  window.localStorage.setItem(
    "hosteleria-joviat-session",
    JSON.stringify({
      id: "admin-1",
      roleKey: "administradores",
      source: "administrator",
      email: "admin@joviat.cat"
    })
  );

  mockFirestoreFetch([
    { documents: [] },
    { documents: [] },
    { documents: [] },
    {
      documents: [
        {
          name: "projects/demo/databases/(default)/documents/Administrator/admin-1",
          fields: {
            Name: { stringValue: "Admin Joviat" },
            Email: { stringValue: "admin@joviat.cat" }
          }
        }
      ]
    }
  ]);

  render(<App />);

  expect(await screen.findByRole("button", { name: /aceptar alumnos/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /administradores/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /salir del usuario/i })).toBeInTheDocument();
});

test("registration screen hides role copy", async () => {
  process.env.REACT_APP_FIREBASE_PROJECT_ID = "demo-project";
  mockFirestoreFetch([{ documents: [] }, { documents: [] }, { documents: [] }, { documents: [] }]);

  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: /login \/ registro/i }));
  fireEvent.click((await screen.findAllByRole("button", { name: /registro/i }))[1]);

  expect(screen.queryByText(/rol al registrarte/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/tres perfiles/i)).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: /enviar solicitud/i })).toBeInTheDocument();
});
