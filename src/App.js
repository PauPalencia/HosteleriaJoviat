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

const SESSION_STORAGE_KEY = "joviat-session-user-id";

function App() {
  const isMobile = useIsMobile(900);

  const [section, setSection] = useState("inicio");
  const [searchStudents, setSearchStudents] = useState("");
  const [searchRestaurants, setSearchRestaurants] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(() => loadStoredSession());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [createFeedback, setCreateFeedback] = useState("");
  const [dataState, setDataState] = useState({
    students: [],
    restaurants: [],
    relations: [],
    users: [],
    pendingUsers: []
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
    const rawUser = dataState.users.find((user) => user.id === currentUserId);
    return rawUser ? normalizeUserRecord(rawUser) : null;
  }, [dataState.users, currentUserId]);

  const isAdmin = currentUser?.roleKey === "admin";

  useEffect(() => {
    if (currentUserId && !currentUser) {
      clearStoredSession();
      setCurrentUserId(null);
    }
  }, [currentUser, currentUserId]);

  const filteredStudents = dataState.students.filter((student) =>
    student.Name?.toLowerCase().includes(searchStudents.toLowerCase())
  );
  const filteredRestaurants = dataState.restaurants.filter((restaurant) =>
    restaurant.Name?.toLowerCase().includes(searchRestaurants.toLowerCase())
  );

  const selectedStudent = selectedStudentId ? vm.studentById[selectedStudentId] : null;
  const selectedRestaurant = selectedRestaurantId ? vm.restaurantById[selectedRestaurantId] : null;
  const mainProfile = currentUser ? buildProfileFromUser(currentUser) : buildFallbackProfile(dataState.students[0]);

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

        {!loading && !error && section === "crear" && currentUser && (
          <CreateRecordsPage
            feedback={createFeedback}
            onCreateStudent={handleCreateStudent}
            onCreateRestaurant={handleCreateRestaurant}
          />
        )}

        {!loading && !error && section === "admin" && isAdmin && (
          <AdminPage
            pendingUsers={dataState.pendingUsers.map(normalizeUserRecord)}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
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
    if (["crear", "perfil"].includes(nextSection) && !currentUser) {
      setSection("auth");
      return;
    }

    if (nextSection === "admin" && !isAdmin) {
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

    const user = dataState.users.find(
      (candidate) =>
        normalizeText(candidate.email || candidate.Email) === normalizeText(email) &&
        String(candidate.password || candidate.Password || "") === password
    );

    if (!user) {
      setAuthError("No existe un usuario aprobado con ese correo o contraseña.");
      return;
    }

    persistSession(user.id);
    setCurrentUserId(user.id);
    setSection("inicio");
  }

  async function handleRegister(form) {
    setAuthError("");
    setAuthSuccess("");

    const repeatedEmail = [...dataState.users, ...dataState.pendingUsers].some(
      (candidate) => normalizeText(candidate.email || candidate.Email) === normalizeText(form.email)
    );

    if (repeatedEmail) {
      setAuthError("Ya existe un usuario o solicitud con ese correo.");
      return;
    }

    const created = await createDocument("PendingUsers", {
      name: form.name,
      email: form.email,
      phone: form.phone,
      curso: form.curso,
      password: form.password,
      role: "user",
      approved: false,
      createdAt: new Date().toISOString()
    });

    setDataState((current) => ({
      ...current,
      pendingUsers: [...current.pendingUsers, created]
    }));
    setAuthSuccess("Registro enviado. Un administrador debe aceptarlo antes de que puedas entrar.");
    setAuthMode("login");
  }

  async function handleCreateStudent(studentInput) {
    setCreateFeedback("");
    const createdStudent = await createDocument("Alumnos", studentInput);
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

  async function handleApproveUser(userId) {
    const pendingUser = dataState.pendingUsers.find((user) => user.id === userId);
    if (!pendingUser) return;

    const approvedUser = await createDocument(
      "Usuarios",
      {
        name: pendingUser.name || pendingUser.Name,
        email: pendingUser.email || pendingUser.Email,
        phone: pendingUser.phone || pendingUser.Phone,
        curso: pendingUser.curso || pendingUser.Curso,
        password: pendingUser.password || pendingUser.Password,
        role: pendingUser.role || "user",
        approved: true,
        photo: pendingUser.photo || pendingUser.PhotoURL || ""
      },
      userId
    );

    await deleteDocument("PendingUsers", userId);

    setDataState((current) => ({
      ...current,
      users: [...current.users, approvedUser],
      pendingUsers: current.pendingUsers.filter((user) => user.id !== userId)
    }));
  }

  async function handleRejectUser(userId) {
    await deleteDocument("PendingUsers", userId);
    setDataState((current) => ({
      ...current,
      pendingUsers: current.pendingUsers.filter((user) => user.id !== userId)
    }));
  }

  function handleLogout() {
    clearStoredSession();
    setCurrentUserId(null);
    setSection("inicio");
    setSelectedStudentId(null);
    setSelectedRestaurantId(null);
  }
}

function buildProfileFromUser(user) {
  return {
    name: user.name,
    email: user.email,
    role: user.roleLabel,
    curso: user.curso || "No definido",
    phone: user.phone || "No definido",
    photo: user.photo || getStudentPhoto(null)
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

function normalizeUserRecord(user) {
  const roleKey = String(user.role || user.Role || "user").toLowerCase() === "admin" ? "admin" : "user";
  return {
    id: user.id,
    name: user.name || user.Name || "Usuario JOVIAT",
    email: user.email || user.Email || "",
    phone: user.phone || user.Phone || "",
    curso: user.curso || user.Curso || "",
    password: user.password || user.Password || "",
    photo: user.photo || user.PhotoURL || "",
    roleKey,
    roleLabel: roleKey === "admin" ? "Administrador" : "Usuario"
  };
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function loadStoredSession() {
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistSession(userId) {
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, userId);
  } catch {}
}

function clearStoredSession() {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {}
}

export default App;
