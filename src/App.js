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
import { useIsMobile } from "./hooks/useIsMobile";
import { loadFirestoreData } from "./utils/firestore";
import { buildViewModel, getRoleLabel, normalizeRole, ROLE_KEYS } from "./utils/models";
import { getStudentPhoto } from "./utils/ui";

const EMPTY_AUTH_FORM = {
  name: "",
  phone: "",
  age: "",
  curso: "",
  email: "",
  password: "",
  confirmPassword: ""
};

const SESSION_STORAGE_KEY = "hosteleria-joviat-session";
const PENDING_USERS_STORAGE_KEY = "hosteleria-joviat-pending-users";

function App() {
  const isMobile = useIsMobile(900);

  const [section, setSection] = useState("inicio");
  const [searchStudents, setSearchStudents] = useState("");
  const [searchRestaurants, setSearchRestaurants] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(EMPTY_AUTH_FORM);
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataState, setDataState] = useState({ students: [], restaurants: [], relations: [], administrators: [] });
  const [pendingStudents, setPendingStudents] = useState(() => readJsonStorage(PENDING_USERS_STORAGE_KEY, []));
  const [session, setSession] = useState(() => readJsonStorage(SESSION_STORAGE_KEY, null));

  useEffect(() => {
    let mounted = true;

    // La precarga sigue existiendo, pero ya no bloquea la pantalla de autenticación.
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

  useEffect(() => {
    writeJsonStorage(PENDING_USERS_STORAGE_KEY, pendingStudents);
  }, [pendingStudents]);

  useEffect(() => {
    writeJsonStorage(SESSION_STORAGE_KEY, session);
  }, [session]);

  const vm = useMemo(() => buildViewModel(dataState), [dataState]);

  const filteredStudents = dataState.students.filter((student) =>
    student.Name?.toLowerCase().includes(searchStudents.toLowerCase())
  );
  const filteredRestaurants = dataState.restaurants.filter((restaurant) =>
    restaurant.Name?.toLowerCase().includes(searchRestaurants.toLowerCase())
  );

  const selectedStudent = selectedStudentId ? vm.studentById[selectedStudentId] : null;
  const selectedRestaurant = selectedRestaurantId ? vm.restaurantById[selectedRestaurantId] : null;

  // El perfil solo sale de la sesión actual; así evitamos exponer el primer alumno cargado.
  const mainProfile = useMemo(
    () => buildProfileFromSession(session, dataState.students, dataState.administrators, pendingStudents),
    [session, dataState.students, dataState.administrators, pendingStudents]
  );

  const authCatalog = useMemo(
    () => buildAuthCatalog(dataState.students, dataState.administrators, pendingStudents),
    [dataState.students, dataState.administrators, pendingStudents]
  );

  const isAuthSection = section === "auth";
  const canRenderDataSection = !loading && !error;

  return (
    <div className={`layout ${isMobile ? "layout-mobile" : ""}`}>
      <LayoutNav
        isMobile={isMobile}
        section={section}
        onNavigate={handleSectionChange}
        onProfile={() => handleSectionChange("perfil")}
      />

      <main className="content">
        {loading && !isAuthSection && <p className="state-text">Cargando datos desde Firestore…</p>}
        {error && !isAuthSection && <p className="error-box">Error: {error}</p>}

        {section === "inicio" && canRenderDataSection && <InicioPage />}

        {section === "alumnos" && canRenderDataSection && !selectedStudent && (
          <AlumnosPage
            search={searchStudents}
            onSearch={setSearchStudents}
            students={filteredStudents}
            studentSummaryById={vm.studentSummaryById}
            onOpenStudent={setSelectedStudentId}
          />
        )}

        {section === "alumnos" && canRenderDataSection && selectedStudent && (
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

        {section === "restaurantes" && canRenderDataSection && !selectedRestaurant && (
          <RestaurantesPage
            search={searchRestaurants}
            onSearch={setSearchRestaurants}
            restaurants={filteredRestaurants}
            associatesByRestaurantId={vm.restaurantAssociatesById}
            isMobile={isMobile}
            onOpenRestaurant={setSelectedRestaurantId}
          />
        )}

        {section === "restaurantes" && canRenderDataSection && selectedRestaurant && (
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

        {section === "auth" && (
          <AuthPage
            authMode={authMode}
            setAuthMode={handleAuthModeChange}
            authForm={authForm}
            authError={authError}
            authInfo={authInfo}
            authLoading={authLoading}
            onFieldChange={handleAuthFieldChange}
            onSubmit={handleAuthSubmit}
            canUseRemoteAccounts={!error}
          />
        )}

        {section === "perfil" && (
          <ProfilePage
            profile={mainProfile}
            isAuthenticated={Boolean(session)}
            onGoToAuth={() => handleSectionChange("auth")}
            onLogout={handleLogout}
          />
        )}

        {!isAuthSection && error && section !== "perfil" && (
          <section className="panel">
            <h2>Acceso limitado</h2>
            <p>
              La carga remota ha fallado, así que las páginas de alumnos y restaurantes quedan bloqueadas hasta que la
              conexión vuelva a funcionar.
            </p>
            <button type="button" className="primary-btn" onClick={() => handleSectionChange("auth")}>
              Ir a login / registro
            </button>
          </section>
        )}
      </main>
    </div>
  );

  function handleSectionChange(nextSection) {
    setSection(nextSection);
    setSelectedStudentId(null);
    setSelectedRestaurantId(null);
    setAuthError("");
    setAuthInfo("");
  }


  function handleLogout() {
    setSession(null);
    setAuthForm(EMPTY_AUTH_FORM);
    setAuthError("");
    setAuthInfo("Sesión cerrada.");
    setSection("auth");
  }

  function handleAuthModeChange(nextMode) {
    setAuthMode(nextMode);
    setAuthError("");
    setAuthInfo("");
    setAuthForm(EMPTY_AUTH_FORM);
  }

  function handleAuthFieldChange(event) {
    const { name, value } = event.target;
    setAuthForm((current) => ({ ...current, [name]: value }));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError("");
    setAuthInfo("");
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        const nextSession = authenticateUser(authCatalog, authForm);
        setSession(nextSession);
        setSection("perfil");
        setAuthInfo(`Sesión iniciada como ${getRoleLabel(nextSession.roleKey).toLowerCase()}.`);
      } else {
        const nextPendingStudent = registerPendingStudent(authCatalog, authForm);
        setPendingStudents((current) => [...current, nextPendingStudent]);
        setSession({
          id: nextPendingStudent.id,
          roleKey: ROLE_KEYS.PENDING_STUDENT,
          source: "local-pending",
          email: nextPendingStudent.Email
        });
        setSection("perfil");
        setAuthInfo("Cuenta creada como pendingalumnos. Un administrador deberá revisarla.");
      }

      setAuthForm(EMPTY_AUTH_FORM);
    } catch (submitError) {
      setAuthError(submitError.message);
    } finally {
      setAuthLoading(false);
    }
  }
}

function buildProfileFromSession(session, students, administrators, pendingStudents) {
  if (!session) {
    return {
      name: "Usuario JOVIAT",
      email: "",
      role: "Sin sesión",
      curso: "-",
      phone: "-",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=60"
    };
  }

  const collectionsBySource = {
    student: students,
    administrator: administrators,
    "local-pending": pendingStudents
  };

  const currentCollection = collectionsBySource[session.source] || [];
  const currentUser = currentCollection.find((item) => item.id === session.id || item.Email === session.email);

  return {
    name: currentUser?.Name || currentUser?.name || "Usuario",
    email: currentUser?.Email || session.email || "",
    role: getRoleLabel(session.roleKey),
    curso: currentUser?.Curso || "No definido",
    phone: currentUser?.Phone || "No definido",
    photo: session.roleKey === ROLE_KEYS.ADMINISTRATOR
      ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=60"
      : getStudentPhoto(currentUser)
  };
}

function buildAuthCatalog(students, administrators, pendingStudents) {
  const remoteStudents = students.map((student) => ({
    id: student.id,
    email: String(student.Email || "").trim().toLowerCase(),
    password: student.Password || student.password || "",
    roleKey: normalizeRole(student.Status ?? student.status, ROLE_KEYS.STUDENT),
    source: "student",
    data: student
  }));

  const remoteAdministrators = administrators.map((administrator) => ({
    id: administrator.id,
    email: String(administrator.Email || administrator.email || "").trim().toLowerCase(),
    password: administrator.Password || administrator.password || "",
    roleKey: ROLE_KEYS.ADMINISTRATOR,
    source: "administrator",
    data: administrator
  }));

  const localPendingStudents = pendingStudents.map((student) => ({
    id: student.id,
    email: String(student.Email || "").trim().toLowerCase(),
    password: student.Password || "",
    roleKey: ROLE_KEYS.PENDING_STUDENT,
    source: "local-pending",
    data: student
  }));

  return [...remoteStudents, ...remoteAdministrators, ...localPendingStudents].filter((account) => account.email);
}

function authenticateUser(authCatalog, authForm) {
  const email = String(authForm.email || "").trim().toLowerCase();
  const password = String(authForm.password || "").trim();

  if (!email || !password) {
    throw new Error("Introduce correo y contraseña para iniciar sesión.");
  }

  const account = authCatalog.find((candidate) => candidate.email === email);
  if (!account) {
    throw new Error("No existe ninguna cuenta con ese correo en alumnos, pendingalumnos o administradores.");
  }

  if (account.password && account.password !== password) {
    throw new Error("La contraseña no coincide.");
  }

  return {
    id: account.id,
    roleKey: account.roleKey,
    source: account.source,
    email: account.email
  };
}

function registerPendingStudent(authCatalog, authForm) {
  const name = String(authForm.name || "").trim();
  const email = String(authForm.email || "").trim().toLowerCase();
  const phone = String(authForm.phone || "").trim();
  const age = String(authForm.age || "").trim();
  const curso = String(authForm.curso || "").trim();
  const password = String(authForm.password || "").trim();
  const confirmPassword = String(authForm.confirmPassword || "").trim();

  if (!name || !email || !phone || !age || !curso || !password || !confirmPassword) {
    throw new Error("Completa todos los campos del registro.");
  }

  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  if (password !== confirmPassword) {
    throw new Error("Las contraseñas no coinciden.");
  }

  if (authCatalog.some((candidate) => candidate.email === email)) {
    throw new Error("Ya existe una cuenta con ese correo.");
  }

  return {
    id: `pending-${Date.now()}`,
    Name: name,
    Email: email,
    Phone: phone,
    Age: Number(age),
    Curso: curso,
    Password: password,
    Status: ROLE_KEYS.PENDING_STUDENT
  };
}

function readJsonStorage(storageKey, fallbackValue) {
  try {
    const rawValue = window.localStorage.getItem(storageKey);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

function writeJsonStorage(storageKey, value) {
  try {
    if (value === null) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (error) {
    // Ignoramos fallos de almacenamiento para no romper la UI.
  }
}

export default App;
