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
import { buildViewModel } from "./utils/models";
import { getStudentPhoto } from "./utils/ui";

function App() {
  const isMobile = useIsMobile(900);

  const [section, setSection] = useState("inicio");
  const [searchStudents, setSearchStudents] = useState("");
  const [searchRestaurants, setSearchRestaurants] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataState, setDataState] = useState({ students: [], restaurants: [], relations: [] });

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

  const filteredStudents = dataState.students.filter((student) =>
    student.Name?.toLowerCase().includes(searchStudents.toLowerCase())
  );
  const filteredRestaurants = dataState.restaurants.filter((restaurant) =>
    restaurant.Name?.toLowerCase().includes(searchRestaurants.toLowerCase())
  );

  const selectedStudent = selectedStudentId ? vm.studentById[selectedStudentId] : null;
  const selectedRestaurant = selectedRestaurantId ? vm.restaurantById[selectedRestaurantId] : null;

  const mainProfile = buildProfile(dataState.students[0]);

  return (
    <div className={`layout ${isMobile ? "layout-mobile" : ""}`}>
      <LayoutNav
        isMobile={isMobile}
        section={section}
        onNavigate={handleSectionChange}
        onProfile={() => handleSectionChange("perfil")}
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

        {!loading && !error && section === "auth" && <AuthPage authMode={authMode} setAuthMode={setAuthMode} />}
        {!loading && !error && section === "perfil" && <ProfilePage profile={mainProfile} />}
      </main>
    </div>
  );

  function handleSectionChange(nextSection) {
    setSection(nextSection);
    setSelectedStudentId(null);
    setSelectedRestaurantId(null);
  }
}

function buildProfile(student) {
  if (!student) {
    return {
      name: "Usuario JOVIAT",
      email: "usuario@joviat.cat",
      role: "Administrador",
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

export default App;
