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
import AdminApprovedStudentsPage from "./pages/AdminApprovedStudentsPage";
import { useIsMobile } from "./hooks/useIsMobile";
import { addFirestoreDocument, loadFirestoreData } from "./utils/firestore";
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
// Clave para guardar el override de perfil del administrador (nombre y foto personalizados)
const ADMIN_PROFILE_STORAGE_KEY = "hosteleria-joviat-admin-profile";
// Clave para guardar las solicitudes de alta de restaurante enviadas por alumnos
const RESTAURANT_REQUESTS_STORAGE_KEY = "hosteleria-joviat-restaurant-requests";

function App() {
  const isMobile = useIsMobile(900);

  // Sección activa de la navegación
  const [section, setSection] = useState("inicio");
  // Búsquedas
  const [searchStudents, setSearchStudents] = useState("");
  const [searchRestaurants, setSearchRestaurants] = useState("");
  // Autenticación
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(EMPTY_AUTH_FORM);
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  // Feedback de administración
  const [adminFeedback, setAdminFeedback] = useState({ type: "", text: "" });
  const [pendingActionId, setPendingActionId] = useState("");
  // Detalle seleccionado
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  // Pila de navegación: se apila cada estado cuando navegamos de un detalle a otro
  // Permite volver atrás nivel a nivel (restaurante → alumno → restaurante → ...)
  const [navStack, setNavStack] = useState([]);

  // Idioma de la interfaz: "es" | "ca" | "en"
  const [lang, setLang] = useState("es");

  // Controla si el popup de confirmación de cierre de sesión está abierto
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Datos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataState, setDataState] = useState({ students: [], restaurants: [], relations: [], administrators: [] });
  const [pendingStudents, setPendingStudents] = useState(() => readJsonStorage(PENDING_USERS_STORAGE_KEY, []));
  const [approvedStudents, setApprovedStudents] = useState(() => readJsonStorage(APPROVED_USERS_STORAGE_KEY, []));
  const [localRestaurants, setLocalRestaurants] = useState(() => readJsonStorage(LOCAL_RESTAURANTS_STORAGE_KEY, []));
  const [localRelations, setLocalRelations] = useState(() => readJsonStorage(LOCAL_RELATIONS_STORAGE_KEY, []));
  const [session, setSession] = useState(() => readJsonStorage(SESSION_STORAGE_KEY, null));
  // Personalización del perfil del administrador (nombre y foto) guardada en localStorage
  const [adminProfileOverride, setAdminProfileOverride] = useState(() => readJsonStorage(ADMIN_PROFILE_STORAGE_KEY, null));
  // Solicitudes de alta de restaurante enviadas por alumnos.
  // Cada solicitud: { id, studentId, studentName, studentEmail, description, createdAt, approved }
  const [restaurantRequests, setRestaurantRequests] = useState(() => readJsonStorage(RESTAURANT_REQUESTS_STORAGE_KEY, []));

  // Carga inicial de datos desde Firestore
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
    return () => { mounted = false; };
  }, []);

  // Sincronización con localStorage
  useEffect(() => { writeJsonStorage(PENDING_USERS_STORAGE_KEY, pendingStudents); }, [pendingStudents]);
  useEffect(() => { writeJsonStorage(APPROVED_USERS_STORAGE_KEY, approvedStudents); }, [approvedStudents]);
  useEffect(() => { writeJsonStorage(LOCAL_RESTAURANTS_STORAGE_KEY, localRestaurants); }, [localRestaurants]);
  useEffect(() => { writeJsonStorage(LOCAL_RELATIONS_STORAGE_KEY, localRelations); }, [localRelations]);
  useEffect(() => { writeJsonStorage(SESSION_STORAGE_KEY, session); }, [session]);
  useEffect(() => { writeJsonStorage(ADMIN_PROFILE_STORAGE_KEY, adminProfileOverride); }, [adminProfileOverride]);
  useEffect(() => { writeJsonStorage(RESTAURANT_REQUESTS_STORAGE_KEY, restaurantRequests); }, [restaurantRequests]);

  // Datos combinados (Firestore + local)
  const allStudents = useMemo(() => mergeById(dataState.students, approvedStudents), [dataState.students, approvedStudents]);
  const allRestaurants = useMemo(() => mergeById(dataState.restaurants, localRestaurants), [dataState.restaurants, localRestaurants]);
  const allRelations = useMemo(() => [...dataState.relations, ...localRelations], [dataState.relations, localRelations]);

  // ViewModel con relaciones cruzadas alumno-restaurante
  const vm = useMemo(
    () => buildViewModel({ students: allStudents, restaurants: allRestaurants, relations: allRelations }),
    [allStudents, allRestaurants, allRelations]
  );

  // Listas filtradas por búsqueda
  const filteredStudents = allStudents.filter((student) =>
    student.Name?.toLowerCase().includes(searchStudents.toLowerCase())
  );
  const filteredRestaurants = allRestaurants.filter((restaurant) =>
    restaurant.Name?.toLowerCase().includes(searchRestaurants.toLowerCase())
  );

  // Elementos seleccionados actualmente
  const selectedStudent = selectedStudentId ? vm.studentById[selectedStudentId] : null;
  const selectedRestaurant = selectedRestaurantId ? vm.restaurantById[selectedRestaurantId] : null;
  const currentAdministrator = useMemo(
    () => findSessionUser(session, [], dataState.administrators, []),
    [session, dataState.administrators]
  );

  // Perfil del usuario actual en sesión.
  // Para administradores, mezcla el override local (nombre y foto personalizados)
  // por encima de los datos base de Firestore.
  const mainProfile = useMemo(() => {
    const base = buildProfileFromSession(session, allStudents, dataState.administrators, pendingStudents);
    const isAdminSession = session?.roleKey === ROLE_KEYS.ADMINISTRATOR;
    if (isAdminSession && adminProfileOverride) {
      return {
        ...base,
        name: adminProfileOverride.Name || base.name,
        photo: adminProfileOverride.PhotoURL || base.photo
      };
    }
    return base;
  }, [session, allStudents, dataState.administrators, pendingStudents, adminProfileOverride]);

  // Catálogo de cuentas para autenticación
  const authCatalog = useMemo(
    () => buildAuthCatalog(allStudents, dataState.administrators, pendingStudents),
    [allStudents, dataState.administrators, pendingStudents]
  );

  // Alumno en sesión (para edición de perfil propio)
  // La comparación de email es case-insensitive para evitar que diferencias de
  // mayúsculas en Firestore impidan encontrar al alumno correctamente
  const sessionStudent = useMemo(() => {
    if (!session || session.source !== "student") return null;
    const emailLower = (session.email || "").toLowerCase();
    return allStudents.find(
      (s) => s.id === session.id || (s.Email || "").toLowerCase() === emailLower
    ) || null;
  }, [session, allStudents]);

  // True cuando la sesión activa es de un alumno (independientemente de si
  // se encontraron sus datos completos en allStudents)
  const sessionIsStudent = session?.source === "student";

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
        onLogout={() => setLogoutConfirmOpen(true)}
        isAuthenticated={Boolean(session)}
        isAdmin={isAdmin}
        lang={lang}
        onLangChange={setLang}
        userEmail={session?.email || mainProfile?.email || ""}
        userPhoto={mainProfile?.photo || ""}
      />

      <main className="content">
        {loading && !isAuthSection && <p className="state-text">Cargando datos desde Firestore…</p>}
        {error && !isAuthSection && <p className="error-box">Error: {error}</p>}
        {!isAuthSection && adminFeedback.text && (
          <p className={adminFeedback.type === "error" ? "error-box" : "info-box"}>{adminFeedback.text}</p>
        )}

        {section === "inicio" && canRenderDataSection && (
          <InicioPage lang={lang} onNavigate={handleSectionChange} />
        )}

        {/* ── Sección: Alumnos ─────────────────────────────────────────────────── */}

        {/* Lista de alumnos (pública: sin sesión se puede ver, pero info de contacto oculta) */}
        {section === "alumnos" && canRenderDataSection && !selectedStudent && (
          <AlumnosPage
            search={searchStudents}
            onSearch={setSearchStudents}
            students={filteredStudents}
            studentSummaryById={vm.studentSummaryById}
            onOpenStudent={setSelectedStudentId}
          />
        )}

        {/* Detalle de un alumno (info de contacto oculta si no hay sesión) */}
        {section === "alumnos" && canRenderDataSection && selectedStudent && (
          <StudentDetailPage
            student={selectedStudent}
            jobs={vm.jobsByStudentId[selectedStudent.id] || []}
            onBack={handleBackFromStudentDetail}
            backLabel={
              navStack.at(-1)?.section === "restaurantes"
                ? "← Volver al restaurante"
                : "← Volver a alumnos"
            }
            onOpenRestaurant={handleOpenRestaurantFromStudent}
            isAdmin={isAdmin}
            isAuthenticated={Boolean(session)}
            sessionStudentId={session?.id}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onGoToAuth={() => handleSectionChange("auth")}
          />
        )}

        {/* ── Sección: Restaurantes ─────────────────────────────────────────── */}

        {/* Lista de restaurantes (pública) */}
        {section === "restaurantes" && canRenderDataSection && !selectedRestaurant && (
          <RestaurantesPage
            search={searchRestaurants}
            onSearch={setSearchRestaurants}
            restaurants={filteredRestaurants}
            associatesByRestaurantId={vm.restaurantAssociatesById}
            jobsByRestaurantId={vm.jobsByRestaurantId}
            isMobile={isMobile}
            onOpenRestaurant={setSelectedRestaurantId}
          />
        )}

        {/* Detalle de un restaurante (público) */}
        {section === "restaurantes" && canRenderDataSection && selectedRestaurant && (
          <RestaurantDetailPage
            restaurant={selectedRestaurant}
            jobs={vm.jobsByRestaurantId[selectedRestaurant.id] || []}
            studentSummaryById={vm.studentSummaryById}
            onBack={handleBackFromRestaurantDetail}
            backLabel={
              navStack.at(-1)?.section === "alumnos"
                ? "← Volver al alumno"
                : "← Volver a restaurantes"
            }
            onOpenStudent={handleOpenStudentFromRestaurant}
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

        {/* Perfil del usuario (editable para alumnos y admins) */}
        {section === "perfil" && (
          <ProfilePage
            profile={mainProfile}
            isAuthenticated={Boolean(session)}
            isAdmin={isAdmin}
            sessionIsStudent={sessionIsStudent}
            onGoToAuth={() => handleSectionChange("auth")}
            sessionStudent={sessionStudent}
            onUpdateProfile={handleUpdateProfile}
            allRestaurants={allRestaurants}
            studentJobs={sessionStudent ? (vm.jobsByStudentId[sessionStudent.id] || []) : []}
            onAddRelation={handleAddStudentRelation}
            onRequestRestaurant={handleAddRestaurantRequest}
          />
        )}

        {/* Panel admin: solicitudes pendientes */}
        {section === "admin-pendientes" && isAdmin && (
          <AdminPendingPage
            pendingStudents={pendingStudents}
            restaurantRequests={restaurantRequests.filter((r) => !r.approved)}
            onApprove={handleApprovePendingStudent}
            onRemove={handleRemovePendingStudent}
            onApproveRestaurantRequest={handleApproveRestaurantRequest}
            onRemoveRestaurantRequest={handleRemoveRestaurantRequest}
            pendingActionId={pendingActionId}
          />
        )}

        {/* Panel admin: solicitudes aprobadas */}
        {section === "admin-aprobados" && isAdmin && (
          <AdminApprovedStudentsPage
            approvedStudents={approvedStudents}
            approvedRestaurantRequests={restaurantRequests.filter((r) => r.approved)}
          />
        )}

        {/* Panel admin: crear alumnos validados */}
        {section === "admin-crear-alumnos" && isAdmin && (
          <AdminCreateStudentPage
            restaurants={allRestaurants}
            onCreateStudent={handleCreateValidatedStudent}
            isSubmitting={pendingActionId === "create-student"}
          />
        )}

        {/* Panel admin: crear restaurantes */}
        {section === "admin-crear-restaurantes" && isAdmin && (
          <AdminCreateRestaurantPage
            onCreateRestaurant={handleCreateRestaurant}
            isSubmitting={pendingActionId === "create-restaurant"}
          />
        )}

        {/* Panel admin: herramientas y estadísticas */}
        {section === "admin-herramientas" && isAdmin && (
          <AdminManagementPage
            currentAdministrator={currentAdministrator}
            administrators={dataState.administrators}
            pendingStudents={pendingStudents}
            approvedStudents={approvedStudents}
            totalStudents={allStudents.length}
            totalRestaurants={allRestaurants.length}
            onNavigate={handleSectionChange}
          />
        )}

        {/* Acceso denegado: zona admin sin sesión de admin */}
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

      {/* Popup de confirmación de cierre de sesión */}
      {logoutConfirmOpen && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 className="modal-title">Cerrar sesión</h3>
            <p className="modal-text">¿Seguro que quieres cerrar sesión?</p>
            <div className="modal-actions">
              <button className="primary-btn" onClick={handleConfirmLogout}>
                Sí, cerrar sesión
              </button>
              <button className="small-btn" onClick={() => setLogoutConfirmOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── NAVEGACIÓN ───────────────────────────────────────────────────────────

  // Cambia de sección desde el menú, limpiando siempre la pila y las selecciones
  function handleSectionChange(nextSection) {
    setSection(nextSection);
    setSelectedStudentId(null);
    setSelectedRestaurantId(null);
    setNavStack([]);
    setAuthError("");
    setAuthInfo("");
    setAdminFeedback({ type: "", text: "" });
  }

  // Abre el detalle de un restaurante desde la ficha de un alumno
  // Empuja el estado actual a la pila para poder volver nivel a nivel
  function handleOpenRestaurantFromStudent(restaurantId) {
    setNavStack((stack) => [...stack, { section: "alumnos", selectedStudentId, selectedRestaurantId: null }]);
    setSection("restaurantes");
    setSelectedRestaurantId(restaurantId);
  }

  // Abre el detalle de un alumno desde la ficha de un restaurante
  // Empuja el estado actual a la pila para poder volver nivel a nivel
  function handleOpenStudentFromRestaurant(studentId) {
    setNavStack((stack) => [...stack, { section: "restaurantes", selectedStudentId: null, selectedRestaurantId }]);
    setSection("alumnos");
    setSelectedStudentId(studentId);
  }

  // Volver atrás desde el detalle de un alumno:
  // saca el último estado de la pila y lo restaura, o va al listado si la pila está vacía
  function handleBackFromStudentDetail() {
    if (navStack.length > 0) {
      const prev = navStack[navStack.length - 1];
      setNavStack((stack) => stack.slice(0, -1));
      setSection(prev.section);
      setSelectedStudentId(prev.selectedStudentId);
      setSelectedRestaurantId(prev.selectedRestaurantId);
    } else {
      setSelectedStudentId(null);
    }
  }

  // Volver atrás desde el detalle de un restaurante:
  // saca el último estado de la pila y lo restaura, o va al listado si la pila está vacía
  function handleBackFromRestaurantDetail() {
    if (navStack.length > 0) {
      const prev = navStack[navStack.length - 1];
      setNavStack((stack) => stack.slice(0, -1));
      setSection(prev.section);
      setSelectedStudentId(prev.selectedStudentId);
      setSelectedRestaurantId(prev.selectedRestaurantId);
    } else {
      setSelectedRestaurantId(null);
    }
  }

  // ─── SESIÓN ───────────────────────────────────────────────────────────────

  // Confirma y ejecuta el cierre de sesión tras el popup de confirmación
  function handleConfirmLogout() {
    setLogoutConfirmOpen(false);
    setSession(null);
    setAuthForm(EMPTY_AUTH_FORM);
    setAuthError("");
    setAuthInfo("Has salido de la sesión.");
    setSection("auth");
  }

  // ─── AUTENTICACIÓN ────────────────────────────────────────────────────────

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
        setSession(null);
        setSection("inicio");
        setAdminFeedback({
          type: "info",
          text: "Solicitud enviada correctamente. Cuando un administrador te valide, podrás iniciar sesión."
        });
      }
      setAuthForm(EMPTY_AUTH_FORM);
    } catch (submitError) {
      setAuthError(submitError.message);
    } finally {
      setAuthLoading(false);
    }
  }

  // ─── ADMIN: SOLICITUDES PENDIENTES ────────────────────────────────────────

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

  // ─── ADMIN: CREAR ALUMNO VALIDADO ─────────────────────────────────────────

  async function handleCreateValidatedStudent(studentPayload) {
    setPendingActionId("create-student");
    setAdminFeedback({ type: "", text: "" });

    try {
      if (!studentPayload.Email || !studentPayload.Password) {
        throw new Error("Para crear un alumno validado debes indicar correo y contraseña.");
      }

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

      try {
        await addFirestoreDocument("Alumnos", buildStudentFirestorePayload(newStudent), studentId);
      } catch (saveError) {
        setAdminFeedback({
          type: "error",
          text: `Alumno creado en Auth pero no se pudo guardar en Firestore. Se mantiene localmente. ${saveError.message}`
        });
      }

      setApprovedStudents((currentApproved) => mergeById(currentApproved, [newStudent]));

      if (studentPayload.restaurantId) {
        const relationId = `relation-${Date.now()}`;
        const relation = {
          id: relationId,
          id_alumni: studentId,
          id_restaurant: studentPayload.restaurantId,
          rol: studentPayload.workRole,
          current_job: Boolean(studentPayload.currentJob)
        };

        try {
          await addFirestoreDocument("Res-Alum", buildRelationFirestorePayload(relation), relationId);
          setDataState((current) => ({ ...current, relations: [...current.relations, relation] }));
        } catch (saveError) {
          setLocalRelations((currentRelations) => [...currentRelations, relation]);
          setAdminFeedback({
            type: "error",
            text: `Relación laboral guardada solo en local. ${saveError.message}`
          });
        }
      }

      setAdminFeedback({ type: "info", text: `Alumno validado ${newStudent.Name} creado correctamente.` });
      setSection("alumnos");
    } catch (createError) {
      setAdminFeedback({ type: "error", text: createError.message });
    } finally {
      setPendingActionId("");
    }
  }

  // ─── ADMIN: EDITAR FICHA DE ALUMNO ────────────────────────────────────────

  // Actualiza los datos de un alumno existente en el estado local
  function handleEditStudent(studentId, updatedData) {
    setApprovedStudents((current) => {
      const existingInApproved = current.find((s) => s.id === studentId);
      if (existingInApproved) {
        // Ya está en approvedStudents: actualizar directamente
        return current.map((s) => (s.id === studentId ? { ...s, ...updatedData } : s));
      }
      // Viene de Firestore (dataState): añadir a approvedStudents con los datos actualizados
      const original = allStudents.find((s) => s.id === studentId) || {};
      return mergeById(current, [{ ...original, ...updatedData, id: studentId }]);
    });
    setAdminFeedback({ type: "info", text: "Ficha del alumno actualizada correctamente." });
  }

  // ─── ADMIN: ELIMINAR FICHA DE ALUMNO ─────────────────────────────────────

  // Elimina un alumno del estado local (tanto de approvedStudents como de dataState)
  function handleDeleteStudent(studentId) {
    setApprovedStudents((current) => current.filter((s) => s.id !== studentId));
    setDataState((current) => ({
      ...current,
      students: current.students.filter((s) => s.id !== studentId)
    }));
    // Volver al listado tras borrar la ficha y limpiar la pila
    setSelectedStudentId(null);
    setNavStack([]);
    setAdminFeedback({ type: "info", text: "Ficha de alumno eliminada." });
  }

  // ─── PERFIL: EDITAR DATOS PROPIOS ─────────────────────────────────────────

  // Actualiza el perfil del usuario en sesión:
  //  - Si es administrador: guarda un override local con nombre y foto
  //  - Si es alumno: actualiza su ficha en el estado de alumnos
  function handleUpdateProfile(updatedData) {
    if (isAdmin) {
      setAdminProfileOverride({ Name: updatedData.Name, PhotoURL: updatedData.PhotoURL });
    } else if (sessionStudent) {
      handleEditStudent(sessionStudent.id, updatedData);
    }
  }

  // ─── ALUMNO: AÑADIR RELACIÓN LABORAL ─────────────────────────────────────

  // Crea una nueva relación alumno-restaurante desde el perfil del alumno en sesión
  function handleAddStudentRelation(restaurantId, role, currentJob) {
    if (!sessionStudent) return;
    const relationId = `relation-${Date.now()}`;
    const relation = {
      id: relationId,
      id_alumni: sessionStudent.id,
      id_restaurant: restaurantId,
      rol: role,
      current_job: Boolean(currentJob)
    };
    setLocalRelations((current) => [...current, relation]);
    setAdminFeedback({ type: "info", text: "Restaurante añadido a tu perfil correctamente." });
  }

  // ─── ALUMNO: SOLICITAR ALTA DE RESTAURANTE ────────────────────────────────

  // Guarda una solicitud de alta de restaurante enviada por el alumno en sesión
  function handleAddRestaurantRequest(description) {
    if (!session) return;
    const requestId = `req-${Date.now()}`;
    const request = {
      id: requestId,
      studentId: session.id,
      studentName: mainProfile.name,
      studentEmail: session.email || mainProfile.email,
      description: String(description).trim(),
      createdAt: new Date().toISOString(),
      approved: false
    };
    setRestaurantRequests((current) => [...current, request]);
  }

  // ─── ADMIN: GESTIONAR SOLICITUDES DE RESTAURANTE ─────────────────────────

  // Marca una solicitud de restaurante como aprobada (pasa al panel de aprobadas)
  function handleApproveRestaurantRequest(requestId) {
    setRestaurantRequests((current) =>
      current.map((r) => (r.id === requestId ? { ...r, approved: true } : r))
    );
    setAdminFeedback({ type: "info", text: "Solicitud de restaurante marcada como aprobada." });
  }

  // Elimina permanentemente una solicitud de restaurante
  function handleRemoveRestaurantRequest(requestId) {
    setRestaurantRequests((current) => current.filter((r) => r.id !== requestId));
    setAdminFeedback({ type: "info", text: "Solicitud de restaurante eliminada." });
  }

  // ─── ADMIN: CREAR RESTAURANTE ─────────────────────────────────────────────

  async function handleCreateRestaurant(restaurantPayload) {
    setPendingActionId("create-restaurant");
    setAdminFeedback({ type: "", text: "" });

    try {
      const restaurantId = `restaurant-${Date.now()}`;
      const newRestaurant = {
        id: restaurantId,
        Name: restaurantPayload.name,
        Address: restaurantPayload.address,
        Email: restaurantPayload.email,
        Phone: restaurantPayload.phone,
        PhotoURL: restaurantPayload.photoUrl || "",
        Location: restaurantPayload.lat && restaurantPayload.lng
          ? { lat: Number(restaurantPayload.lat), lng: Number(restaurantPayload.lng) }
          : null
      };

      const savedRestaurant = await addFirestoreDocument(
        "Restaurante",
        buildRestaurantFirestorePayload(newRestaurant),
        restaurantId
      );

      setDataState((current) => ({
        ...current,
        restaurants: mergeById(current.restaurants, [savedRestaurant])
      }));
      setLocalRestaurants((currentRestaurants) => currentRestaurants.filter((item) => item.id !== restaurantId));
      setAdminFeedback({ type: "info", text: `Restaurante ${savedRestaurant.Name} creado en Firestore correctamente.` });
      setSection("restaurantes");
    } catch (saveError) {
      const fallbackRestaurant = {
        id: `restaurant-${Date.now()}`,
        Name: restaurantPayload.name,
        Address: restaurantPayload.address,
        Email: restaurantPayload.email,
        Phone: restaurantPayload.phone,
        PhotoURL: restaurantPayload.photoUrl || "",
        Location: restaurantPayload.lat && restaurantPayload.lng
          ? { lat: Number(restaurantPayload.lat), lng: Number(restaurantPayload.lng) }
          : null
      };

      setLocalRestaurants((currentRestaurants) => mergeById(currentRestaurants, [fallbackRestaurant]));
      setAdminFeedback({
        type: "error",
        text: `No se pudo guardar en Firestore, el restaurante se guardó en local. ${saveError.message}`
      });
      setSection("restaurantes");
    } finally {
      setPendingActionId("");
    }
  }
}

// ─── HELPERS DE PAYLOAD PARA FIRESTORE ────────────────────────────────────────

function buildRestaurantFirestorePayload(restaurant) {
  return {
    Name: restaurant.Name || "",
    Address: restaurant.Address || "",
    Email: restaurant.Email || "",
    Phone: restaurant.Phone || "",
    PhotoURL: restaurant.PhotoURL || "",
    Location: restaurant.Location || null
  };
}

function buildStudentFirestorePayload(student) {
  return {
    Name: student.Name || "",
    Email: student.Email || "",
    Phone: student.Phone || "",
    Curso: student.Curso || "",
    LinkedIn: student.LinkedIn || "",
    Password: student.Password || "",
    PhotoURL: student.PhotoURL || "",
    Status: student.Status || ROLE_KEYS.STUDENT,
    FirebaseAuthUid: student.FirebaseAuthUid || ""
  };
}

function buildRelationFirestorePayload(relation) {
  return {
    id_alumni: relation.id_alumni,
    id_restaurant: relation.id_restaurant,
    rol: relation.rol || "",
    current_job: Boolean(relation.current_job)
  };
}

// ─── HELPERS DE PERFIL ────────────────────────────────────────────────────────

// Construye el objeto de perfil a mostrar a partir de la sesión activa
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
    linkedIn: currentUser?.LinkedIn || "",
    photo: session.roleKey === ROLE_KEYS.ADMINISTRATOR
      ? "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=60"
      : getStudentPhoto(currentUser)
  };
}

// Encuentra el usuario correspondiente a la sesión en las colecciones disponibles
function findSessionUser(session, students, administrators, pendingStudents) {
  const collectionsBySource = {
    student: students,
    administrator: administrators,
    "local-pending": pendingStudents
  };

  const currentCollection = collectionsBySource[session?.source] || [];
  return currentCollection.find((item) => item.id === session?.id || item.Email === session?.email) || null;
}

// ─── HELPERS DE AUTENTICACIÓN ─────────────────────────────────────────────────

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

// ─── HELPERS GENERALES ────────────────────────────────────────────────────────

// Combina dos arrays por id, dando prioridad a los elementos de extraItems
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
    // Si el almacenamiento falla, la app sigue funcionando con el estado en memoria
  }
}

export default App;
