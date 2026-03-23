import { useEffect, useMemo, useState } from "react";
import "./App.css";
import LayoutNav from "./components/LayoutNav";
import InicioPage from "./pages/InicioPage";
import AlumnosPage from "./pages/AlumnosPage";
import RestaurantesPage from "./pages/RestaurantesPage";
import AuthPage from "./pages/AuthPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import ProfilePage from "./pages/ProfilePage";
import CreateRecordsPage from "./pages/CreateRecordsPage";
import AdminPage from "./pages/AdminPage";
import { useIsMobile } from "./hooks/useIsMobile";
import { createDocument, deleteDocument, loadFirestoreData } from "./utils/firestore";
import { buildViewModel } from "./utils/models";
import { getStudentPhoto } from "./utils/ui";

const SESSION_STORAGE_KEY = "joviat-session";

function App() {
  const isMobile = useIsMobile(900);

  const [section, setSection] = useState("inicio");
  const [searchStudents, setSearchStudents] = useState("");
  const [searchRestaurants, setSearchRestaurants] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [session, setSession] = useState(() => loadStoredSession());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [createFeedback, setCreateFeedback] = useState("");
  const [dataState, setDataState] = useState({
    students: [],
    restaurants: [],
    relations: [],
    administrators: [],
    pendingStudents: []
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await loadFirestoreData();
        if (mounted) setDataState(data);
      } catch (loadError) {
        if (mounted) setError(loadError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const vm = useMemo(() => buildViewModel(dataState), [dataState]);

  const currentUser = useMemo(() => {
    if (!session?.id || !session?.type) return null;
    const source = session.type === "admin" ? dataState.administrators : dataState.students;
    const raw = source.find((record) => record.id === session.id);
    return raw ? normalizeAccount(raw, session.type) : null;
  }, [dataState.administrators, dataState.students, session]);

  const isAdmin = currentUser?.type === "admin";

  useEffect(() => {
    if (session && !currentUser) {
      clearStoredSession();
      setSession(null);
    }
  }, [currentUser, session]);

  const filteredStudents = dataState.students.filter((student) =>
    student.Name?.toLowerCase().includes(searchStudents.toLowerCase())
  );
  const filteredRestaurants = dataState.restaurants.filter((restaurant) =>
    restaurant.Name?.toLowerCase().includes(searchRestaurants.toLowerCase())
  );

  const selectedStudent = selectedStudentId ? vm.studentById[selectedStudentId] : null;
  const selectedRestaurant = selectedRestaurantId ? vm.restaurantById[selectedRestaurantId] : null;
  const mainProfile = currentUser ? buildProfileFromAccount(currentUser) : buildFallbackProfile(dataState.students[0]);

  return (
    <div className={`layout ${isMobile ? "layout-mobile" : ""}`}>
      <LayoutNav
        isMobile={isMobile}
        section={section}
        isAuthenticated={Boolean(currentUser)}
        isAdmin={isAdmin}
        onNavigate={handleSectionChange}
        onProfile={() => handleSectionChange(currentUser ? "perfil" : "auth")}
        onLogout={handleLogout}
      />

      <main className="content">
        {loading && <p className="state-text">Cargando datos desde Firestore…</p>}
        {error && <p className="error-box">Error: {error}</p>}

        {!loading && !error && section === "inicio" && <InicioPage />}

        {!loading && !error && section === "alumnos" && !selectedStudent && (
          <AlumnosPage
            search={searchStudents}
            onSearch={setSearchStudents}
            students={filteredStudents}
            studentSummaryById={vm.studentSummaryById}
            onOpenStudent={setSelectedStudentId}
          />
        )}

        {!loading && !error && section === "alumnos" && selectedStudent && (
          <StudentDetailPage
            student={selectedStudent}
            jobs={vm.jobsByStudentId[selectedStudent.id] || []}
            onBack={() => setSelectedStudentId(null)}
            onOpenRestaurant={(restaurantId) => {
              setSection("restaurantes");
              setSelectedRestaurantId(restaurantId);
            }}
          />
        )}

        {!loading && !error && section === "restaurantes" && !selectedRestaurant && (
          <RestaurantesPage
            search={searchRestaurants}
            onSearch={setSearchRestaurants}
            restaurants={filteredRestaurants}
            associatesByRestaurantId={vm.restaurantAssociatesById}
            isMobile={isMobile}
            onOpenRestaurant={setSelectedRestaurantId}
          />
        )}

        {!loading && !error && section === "restaurantes" && selectedRestaurant && (
          <RestaurantDetailPage
            restaurant={selectedRestaurant}
            jobs={vm.jobsByRestaurantId[selectedRestaurant.id] || []}
            studentSummaryById={vm.studentSummaryById}
            onBack={() => setSelectedRestaurantId(null)}
            onOpenStudent={(studentId) => {
              setSection("alumnos");
              setSelectedStudentId(studentId);
            }}
          />
        )}

        {!loading && !error && section === "crear" && isAdmin && (
          <CreateRecordsPage
            feedback={createFeedback}
            onCreateStudent={handleCreateStudent}
            onCreateRestaurant={handleCreateRestaurant}
          />
        )}

        {!loading && !error && section === "admin" && isAdmin && (
          <AdminPage
            pendingUsers={dataState.pendingStudents.map((student) => normalizeAccount(student, "pending"))}
            onApproveUser={handleApproveStudent}
            onRejectUser={handleRejectStudent}
          />
        )}

        {!loading && !error && section === "auth" && !currentUser && (
          <AuthPage
            authMode={authMode}
            setAuthMode={(nextMode) => {
              setAuthMode(nextMode);
              setAuthError("");
              setAuthSuccess("");
            }}
            onLogin={handleLogin}
            onRegister={handleRegister}
            errorMessage={authError}
            successMessage={authSuccess}
          />
        )}

        {!loading && !error && section === "perfil" && <ProfilePage profile={mainProfile} />}
      </main>
    </div>
  );

  function handleSectionChange(nextSection) {
    if (["perfil"].includes(nextSection) && !currentUser) {
      setSection("auth");
      return;
    }

    if (["crear", "admin"].includes(nextSection) && !isAdmin) {
      setSection(currentUser ? "inicio" : "auth");
      return;
    }

    setCreateFeedback("");
    setAuthError("");
    setAuthSuccess("");
    setSection(nextSection);
    setSelectedStudentId(null);
    setSelectedRestaurantId(null);
  }

  async function handleLogin({ email, password }) {
    setAuthError("");
    setAuthSuccess("");

    const admin = dataState.administrators.find(
      (candidate) =>
        normalizeText(candidate.email || candidate.Email) === normalizeText(email) &&
        String(candidate.password || candidate.Password || "") === password
    );

    if (admin) {
      const nextSession = { id: admin.id, type: "admin" };
      persistSession(nextSession);
      setSession(nextSession);
      setSection("inicio");
      return;
    }

    const student = dataState.students.find(
      (candidate) =>
        normalizeText(candidate.Email) === normalizeText(email) &&
        String(candidate.password || candidate.Password || "") === password
    );

    if (!student) {
      setAuthError("No existe un administrador o alumno aprobado con ese correo o contraseña.");
      return;
    }

    const nextSession = { id: student.id, type: "student" };
    persistSession(nextSession);
    setSession(nextSession);
    setSection("inicio");
  }

  async function handleRegister(form) {
    setAuthError("");
    setAuthSuccess("");

    const repeatedEmail = [...dataState.administrators, ...dataState.students, ...dataState.pendingStudents].some(
      (candidate) => normalizeText(candidate.email || candidate.Email) === normalizeText(form.email)
    );

    if (repeatedEmail) {
      setAuthError("Ya existe un administrador, alumno o alumno pendiente con ese correo.");
      return;
    }

    const created = await createDocument("AlumnosPendientes", {
      Name: form.name,
      Email: form.email,
      Phone: form.phone,
      Curso: form.curso,
      Password: form.password,
      Status: "Pendiente",
      requestedAt: new Date().toISOString()
    });

    setDataState((current) => ({
      ...current,
      pendingStudents: [...current.pendingStudents, created]
    }));
    setAuthSuccess("Registro enviado. Un administrador debe aceptar al alumno antes de que pueda entrar.");
    setAuthMode("login");
  }

  async function handleCreateStudent(studentInput) {
    setCreateFeedback("");
    const createdStudent = await createDocument("Alumnos", { ...studentInput, Password: studentInput.Password || "" });
    setDataState((current) => ({
      ...current,
      students: [...current.students, createdStudent]
    }));
    setCreateFeedback(`Alumno ${createdStudent.Name || createdStudent.name} creado correctamente.`);
  }

  async function handleCreateRestaurant(restaurantInput) {
    setCreateFeedback("");
    const createdRestaurant = await createDocument("Restaurante", restaurantInput);
    setDataState((current) => ({
      ...current,
      restaurants: [...current.restaurants, createdRestaurant]
    }));
    setCreateFeedback(`Restaurante ${createdRestaurant.Name || createdRestaurant.name} creado correctamente.`);
  }

  async function handleApproveStudent(studentId) {
    const pendingStudent = dataState.pendingStudents.find((student) => student.id === studentId);
    if (!pendingStudent) return;

    const approvedStudent = await createDocument(
      "Alumnos",
      {
        Name: pendingStudent.Name || pendingStudent.name,
        Email: pendingStudent.Email || pendingStudent.email,
        Phone: pendingStudent.Phone || pendingStudent.phone,
        Curso: pendingStudent.Curso || pendingStudent.curso,
        Password: pendingStudent.Password || pendingStudent.password,
        Status: "Alumno",
        PhotoURL: pendingStudent.PhotoURL || pendingStudent.photo || ""
      },
      studentId
    );

    await deleteDocument("AlumnosPendientes", studentId);

    setDataState((current) => ({
      ...current,
      students: [...current.students, approvedStudent],
      pendingStudents: current.pendingStudents.filter((student) => student.id !== studentId)
    }));
  }

  async function handleRejectStudent(studentId) {
    await deleteDocument("AlumnosPendientes", studentId);
    setDataState((current) => ({
      ...current,
      pendingStudents: current.pendingStudents.filter((student) => student.id !== studentId)
    }));
  }

  function handleLogout() {
    clearStoredSession();
    setSession(null);
    setSection("inicio");
    setSelectedStudentId(null);
    setSelectedRestaurantId(null);
  }
}

function buildProfileFromAccount(account) {
  return {
    name: account.name,
    email: account.email,
    role: account.roleLabel,
    curso: account.curso || "No definido",
    phone: account.phone || "No definido",
    photo: account.photo || getStudentPhoto(null)
  };
}

function buildFallbackProfile(student) {
  if (!student) {
    return {
      name: "Usuario JOVIAT",
      email: "usuario@joviat.cat",
      role: "Invitado",
      curso: "-",
      phone: "-",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=60"
    };
  }

  return {
    name: student.Name || "Usuario",
    email: student.Email || "sin-email@joviat.cat",
    role: student.Status || student.status || "Alumno",
    curso: student.Curso || "No definido",
    phone: student.Phone || "No definido",
    photo: getStudentPhoto(student)
  };
}

function normalizeAccount(record, type) {
  const normalizedType = type === "admin" ? "admin" : type === "pending" ? "pending" : "student";
  return {
    id: record.id,
    name: record.name || record.Name || "Usuario JOVIAT",
    email: record.email || record.Email || "",
    phone: record.phone || record.Phone || "",
    curso: record.curso || record.Curso || "",
    password: record.password || record.Password || "",
    photo: record.photo || record.PhotoURL || "",
    type: normalizedType,
    roleLabel: normalizedType === "admin" ? "Administrador" : normalizedType === "pending" ? "Alumno pendiente" : "Alumno"
  };
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function loadStoredSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(session) {
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {}
}

function clearStoredSession() {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {}
}

export default App;
