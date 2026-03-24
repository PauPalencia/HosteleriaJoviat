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
import AdminPendingPage from "./pages/AdminPendingPage";
import AdminManagementPage from "./pages/AdminManagementPage";
import AdminCreateStudentPage from "./pages/AdminCreateStudentPage";
import AdminCreateRestaurantPage from "./pages/AdminCreateRestaurantPage";
import { useIsMobile } from "./hooks/useIsMobile";
import { loadFirestoreData } from "./utils/firestore";
import { buildViewModel, normalizeRole, ROLE_KEYS } from "./utils/models";
import { getStudentPhoto } from "./utils/ui";
import { createFirebaseAuthUser } from "./utils/firebaseAuth";

const EMPTY_AUTH_FORM = {
  name: "",
  phone: "",
  curso: "",
  email: "",
  password: "",
  confirmPassword: ""
};

const SESSION_STORAGE_KEY = "hosteleria-joviat-session";
const PENDING_USERS_STORAGE_KEY = "hosteleria-joviat-pending-users";
const APPROVED_USERS_STORAGE_KEY = "hosteleria-joviat-approved-users";
const LOCAL_RESTAURANTS_STORAGE_KEY = "hosteleria-joviat-local-restaurants";
const LOCAL_RELATIONS_STORAGE_KEY = "hosteleria-joviat-local-relations";

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
  const [adminFeedback, setAdminFeedback] = useState({ type: "", text: "" });
  const [pendingActionId, setPendingActionId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataState, setDataState] = useState({ students: [], restaurants: [], relations: [], administrators: [] });
  const [pendingStudents, setPendingStudents] = useState(() => readJsonStorage(PENDING_USERS_STORAGE_KEY, []));
  const [approvedStudents, setApprovedStudents] = useState(() => readJsonStorage(APPROVED_USERS_STORAGE_KEY, []));
  const [localRestaurants, setLocalRestaurants] = useState(() => readJsonStorage(LOCAL_RESTAURANTS_STORAGE_KEY, []));
  const [localRelations, setLocalRelations] = useState(() => readJsonStorage(LOCAL_RELATIONS_STORAGE_KEY, []));
  const [session, setSession] = useState(() => readJsonStorage(SESSION_STORAGE_KEY, null));

  useEffect(() => {
    let mounted = true;

    // La precarga pública no puede bloquear el acceso al login.
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
    writeJsonStorage(APPROVED_USERS_STORAGE_KEY, approvedStudents);
  }, [approvedStudents]);

  useEffect(() => {
    writeJsonStorage(LOCAL_RESTAURANTS_STORAGE_KEY, localRestaurants);
  }, [localRestaurants]);

  useEffect(() => {
    writeJsonStorage(LOCAL_RELATIONS_STORAGE_KEY, localRelations);
  }, [localRelations]);

  useEffect(() => {
    writeJsonStorage(SESSION_STORAGE_KEY, session);
  }, [session]);

  const allStudents = useMemo(() => mergeById(dataState.students, approvedStudents), [dataState.students, approvedStudents]);
  const allRestaurants = useMemo(() => mergeById(dataState.restaurants, localRestaurants), [dataState.restaurants, localRestaurants]);
  const allRelations = useMemo(() => [...dataState.relations, ...localRelations], [dataState.relations, localRelations]);

  const vm = useMemo(
    () => buildViewModel({ students: allStudents, restaurants: allRestaurants, relations: allRelations }),
    [allStudents, allRestaurants, allRelations]
  );

  const filteredStudents = allStudents.filter((student) =>
    student.Name?.toLowerCase().includes(searchStudents.toLowerCase())
  );
  const filteredRestaurants = allRestaurants.filter((restaurant) =>
    restaurant.Name?.toLowerCase().includes(searchRestaurants.toLowerCase())
  );

  const selectedStudent = selectedStudentId ? vm.studentById[selectedStudentId] : null;
  const selectedRestaurant = selectedRestaurantId ? vm.restaurantById[selectedRestaurantId] : null;
  const currentAdministrator = useMemo(
    () => findSessionUser(session, [], dataState.administrators, []),
    [session, dataState.administrators]
  );

  const mainProfile = useMemo(
    () => buildProfileFromSession(session, allStudents, dataState.administrators, pendingStudents),
    [session, allStudents, dataState.administrators, pendingStudents]
  );

  const authCatalog = useMemo(
    () => buildAuthCatalog(allStudents, dataState.administrators, pendingStudents),
    [allStudents, dataState.administrators, pendingStudents]
  );

  const isAuthSection = section === "auth";
  const isAdmin = session?.roleKey === ROLE_KEYS.ADMINISTRATOR;
  const canRenderDataSection = !loading && !error;

  return (
    <div className={`layout ${isMobile ? "layout-mobile" : ""}`}>
      <LayoutNav
        isMobile={isMobile}
        section={section}
        onNavigate={handleSectionChange}
        onProfile={() => handleSectionChange("perfil")}
        onLogout={handleLogout}
        isAuthenticated={Boolean(session)}
        isAdmin={isAdmin}
      />

      <main className="content">
        {loading && !isAuthSection && <p className="state-text">Cargando datos desde Firestore…</p>}
        {error && !isAuthSection && <p className="error-box">Error: {error}</p>}
        {!isAuthSection && adminFeedback.text && (
          <p className={adminFeedback.type === "error" ? "error-box" : "info-box"}>{adminFeedback.text}</p>
        )}

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
          />
        )}

        {section === "admin-pendientes" && isAdmin && (
          <AdminPendingPage
            pendingStudents={pendingStudents}
            onApprove={handleApprovePendingStudent}
            onRemove={handleRemovePendingStudent}
            pendingActionId={pendingActionId}
          />
        )}

        {section === "admin-crear-alumnos" && isAdmin && (
          <AdminCreateStudentPage
            restaurants={allRestaurants}
            onCreateStudent={handleCreateValidatedStudent}
            isSubmitting={pendingActionId === "create-student"}
          />
        )}

        {section === "admin-crear-restaurantes" && isAdmin && (
          <AdminCreateRestaurantPage
            onCreateRestaurant={handleCreateRestaurant}
            isSubmitting={pendingActionId === "create-restaurant"}
          />
        )}

        {section === "admin-herramientas" && isAdmin && (
          <AdminManagementPage
            currentAdministrator={currentAdministrator}
            administrators={dataState.administrators}
            pendingStudents={pendingStudents}
            approvedStudents={approvedStudents}
            totalStudents={allStudents.length}
            totalRestaurants={allRestaurants.length}
          />
        )}

        {section.startsWith("admin-") && !isAdmin && (
          <section className="panel">
            <h2>Zona de administración</h2>
            <p>Solo los administradores pueden entrar en esta sección.</p>
            <button type="button" className="primary-btn" onClick={() => handleSectionChange("auth")}>
              Ir a login
            </button>
          </section>
        )}

        {!isAuthSection && error && section !== "perfil" && !section.startsWith("admin-") && (
          <section className="panel">
            <h2>Acceso limitado</h2>
            <p>
              La carga remota ha fallado, así que las páginas de alumnos y restaurantes quedan bloqueadas hasta que la
              conexión vuelva a funcionar.
            </p>
            <button type="button" className="primary-btn" onClick={() => handleSectionChange("auth")}>
              Ir a login / sign in
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
    setAdminFeedback({ type: "", text: "" });
  }

  function handleLogout() {
    setSession(null);
    setAuthForm(EMPTY_AUTH_FORM);
    setAuthError("");
    setAuthInfo("Has salido de la sesión.");
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
        setSection(nextSession.roleKey === ROLE_KEYS.ADMINISTRATOR ? "admin-herramientas" : "perfil");
        setAuthInfo("Sesión iniciada correctamente.");
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
        setAuthInfo("Solicitud enviada. Un administrador la revisará antes de activar tu acceso.");
      }

      setAuthForm(EMPTY_AUTH_FORM);
    } catch (submitError) {
      setAuthError(submitError.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleApprovePendingStudent(studentId) {
    const studentToApprove = pendingStudents.find((student) => student.id === studentId);
    if (!studentToApprove) return;

    setPendingActionId(studentId);
    setAdminFeedback({ type: "", text: "" });

    try {
      const firebaseUser = await createFirebaseAuthUser({
        email: studentToApprove.Email,
        password: studentToApprove.Password
      });

      const approvedStudent = {
        ...studentToApprove,
        Status: ROLE_KEYS.STUDENT,
        FirebaseAuthUid: firebaseUser.uid
      };

      setApprovedStudents((currentApproved) => mergeById(currentApproved, [approvedStudent]));
      setPendingStudents((currentPending) => currentPending.filter((student) => student.id !== studentId));
      setAdminFeedback({ type: "info", text: `Alumno ${studentToApprove.Name} aceptado y creado en Firebase Auth.` });

      if (session?.id === studentId) {
        setSession({
          id: approvedStudent.id,
          roleKey: ROLE_KEYS.STUDENT,
          source: "student",
          email: approvedStudent.Email
        });
      }
    } catch (approveError) {
      setAdminFeedback({ type: "error", text: approveError.message });
    } finally {
      setPendingActionId("");
    }
  }

  function handleRemovePendingStudent(studentId) {
    setPendingStudents((currentPending) => currentPending.filter((student) => student.id !== studentId));
    setAdminFeedback({ type: "info", text: "Solicitud eliminada." });
  }

  async function handleCreateValidatedStudent(studentPayload) {
    setPendingActionId("create-student");
    setAdminFeedback({ type: "", text: "" });

    try {
      const firebaseUser = await createFirebaseAuthUser({
        email: studentPayload.Email,
        password: studentPayload.Password
      });

      const studentId = `student-${Date.now()}`;
      const newStudent = {
        id: studentId,
        ...studentPayload,
        Status: ROLE_KEYS.STUDENT,
        FirebaseAuthUid: firebaseUser.uid
      };

      setApprovedStudents((currentApproved) => mergeById(currentApproved, [newStudent]));

      if (studentPayload.restaurantId) {
        setLocalRelations((currentRelations) => [
          ...currentRelations,
          {
            id: `relation-${Date.now()}`,
            id_alumni: studentId,
            id_restaurant: studentPayload.restaurantId,
            rol: studentPayload.workRole,
            current_job: Boolean(studentPayload.currentJob)
          }
        ]);
      }

      setAdminFeedback({ type: "info", text: `Alumno validado ${newStudent.Name} creado correctamente.` });
      setSection("alumnos");
    } catch (createError) {
      setAdminFeedback({ type: "error", text: createError.message });
    } finally {
      setPendingActionId("");
    }
  }

  function handleCreateRestaurant(restaurantPayload) {
    setPendingActionId("create-restaurant");
    setAdminFeedback({ type: "", text: "" });

    const newRestaurant = {
      id: `restaurant-${Date.now()}`,
      Name: restaurantPayload.name,
      Address: restaurantPayload.address,
      Email: restaurantPayload.email,
      Phone: restaurantPayload.phone,
      Location: restaurantPayload.lat && restaurantPayload.lng
        ? { lat: Number(restaurantPayload.lat), lng: Number(restaurantPayload.lng) }
        : null
    };

    setLocalRestaurants((currentRestaurants) => mergeById(currentRestaurants, [newRestaurant]));
    setAdminFeedback({ type: "info", text: `Restaurante ${newRestaurant.Name} creado correctamente.` });
    setPendingActionId("");
    setSection("restaurantes");
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

  const currentUser = findSessionUser(session, students, administrators, pendingStudents);

  return {
    name: currentUser?.Name || currentUser?.name || "Usuario",
    email: currentUser?.Email || session.email || "",
    role: getProfileRoleLabel(session.roleKey),
    curso: currentUser?.Curso || "No definido",
    phone: currentUser?.Phone || "No definido",
    photo: session.roleKey === ROLE_KEYS.ADMINISTRATOR
      ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=60"
      : getStudentPhoto(currentUser)
  };
}

function findSessionUser(session, students, administrators, pendingStudents) {
  const collectionsBySource = {
    student: students,
    administrator: administrators,
    "local-pending": pendingStudents
  };

  const currentCollection = collectionsBySource[session?.source] || [];
  return currentCollection.find((item) => item.id === session?.id || item.Email === session?.email) || null;
}

function buildAuthCatalog(students, administrators, pendingStudents) {
  const remoteStudents = students.map((student) => ({
    id: student.id,
    email: String(student.Email || "").trim().toLowerCase(),
    password: student.Password || student.password || "",
    roleKey: normalizeRole(student.Status ?? student.status, ROLE_KEYS.STUDENT),
    source: "student"
  }));

  const remoteAdministrators = administrators.map((administrator) => ({
    id: administrator.id,
    email: String(administrator.Email || administrator.email || "").trim().toLowerCase(),
    password: administrator.Password || administrator.password || "",
    roleKey: ROLE_KEYS.ADMINISTRATOR,
    source: "administrator"
  }));

  const localPendingStudents = pendingStudents.map((student) => ({
    id: student.id,
    email: String(student.Email || "").trim().toLowerCase(),
    password: student.Password || "",
    roleKey: ROLE_KEYS.PENDING_STUDENT,
    source: "local-pending"
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
    throw new Error("No existe ninguna cuenta con ese correo.");
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
  const curso = String(authForm.curso || "").trim();
  const password = String(authForm.password || "").trim();
  const confirmPassword = String(authForm.confirmPassword || "").trim();

  if (!name || !email || !phone || !curso || !password || !confirmPassword) {
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
    Curso: curso,
    Password: password,
    Status: ROLE_KEYS.PENDING_STUDENT
  };
}

function mergeById(baseItems, extraItems) {
  const mergedById = new Map();
  [...baseItems, ...extraItems].forEach((item) => {
    if (!item?.id) return;
    mergedById.set(item.id, item);
  });
  return Array.from(mergedById.values());
}

function getProfileRoleLabel(roleKey) {
  if (roleKey === ROLE_KEYS.ADMINISTRATOR) return "Administrador";
  if (roleKey === ROLE_KEYS.PENDING_STUDENT) return "Pendiente de validación";
  return "Alumno";
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
    // Si el almacenamiento falla, la app sigue funcionando con el estado en memoria.
  }
}

export default App;
