import { useEffect, useMemo, useState } from "react";
import "./App.css";
import LayoutNav from "./components/LayoutNav";
import InicioPage from "./pages/InicioPage";
import AlumnosPage from "./pages/AlumnosPage";
import RestaurantesPage from "./pages/RestaurantesPage";
import AuthPage from "./pages/AuthPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import { useIsMobile } from "./hooks/useIsMobile";
import { loadFirestoreData } from "./utils/firestore";
import { buildViewModel } from "./utils/models";

// ============================================================================
// App principal: orquesta navegación, carga de datos y render de páginas.
// ============================================================================
function App() {
  const isMobile = useIsMobile(900);

  // Estado de navegación y UI
  const [section, setSection] = useState("inicio");
  const [searchStudents, setSearchStudents] = useState("");
  const [searchRestaurants, setSearchRestaurants] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  // Estado de datos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataState, setDataState] = useState({ students: [], restaurants: [], relations: [] });

  // Carga inicial
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

  // ViewModel derivado para no recalcular en cada render
  const vm = useMemo(() => buildViewModel(dataState), [dataState]);

  const filteredStudents = dataState.students.filter((student) =>
    student.Name?.toLowerCase().includes(searchStudents.toLowerCase())
  );
  const filteredRestaurants = dataState.restaurants.filter((restaurant) =>
    restaurant.Name?.toLowerCase().includes(searchRestaurants.toLowerCase())
  );

  const selectedStudent = selectedStudentId ? vm.studentById[selectedStudentId] : null;
  const selectedRestaurant = selectedRestaurantId ? vm.restaurantById[selectedRestaurantId] : null;

  return (
    <div className={`layout ${isMobile ? "layout-mobile" : ""}`}>
      <LayoutNav isMobile={isMobile} section={section} onNavigate={handleSectionChange} />

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

        {!loading && !error && section === "auth" && <AuthPage authMode={authMode} setAuthMode={setAuthMode} />}
      </main>
    </div>
  );

  // --------------------------------------------------------------------------
  // Funciones locales de navegación (al final para lectura más clara).
  // --------------------------------------------------------------------------
  function handleSectionChange(nextSection) {
    setSection(nextSection);
    setSelectedStudentId(null);
    setSelectedRestaurantId(null);
  }
}

export default App;
