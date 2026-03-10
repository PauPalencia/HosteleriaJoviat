import { useEffect, useMemo, useState } from "react";
import "./App.css";

const FIRESTORE_PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID;
const FIRESTORE_DATABASE_ID = process.env.REACT_APP_FIREBASE_DATABASE_ID || "(default)";
const FIRESTORE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;

function App() {
  const [activeTab, setActiveTab] = useState("alumnos");
  const [searchStudents, setSearchStudents] = useState("");
  const [searchRestaurants, setSearchRestaurants] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [students, setStudents] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [studentsData, restaurantsData, relationsData] = await Promise.all([
          fetchCollection("Alumnos"),
          fetchCollection("Restaurante"),
          fetchCollection("Res-Alum")
        ]);

        setStudents(studentsData);
        setRestaurants(restaurantsData);
        setRelations(relationsData);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const restaurantById = useMemo(() => {
    return restaurants.reduce((acc, restaurant) => {
      acc[restaurant.id] = restaurant;
      return acc;
    }, {});
  }, [restaurants]);

  const jobsByStudentId = useMemo(() => {
    return relations.reduce((acc, relation) => {
      if (!relation.id_alumni) {
        return acc;
      }

      if (!acc[relation.id_alumni]) {
        acc[relation.id_alumni] = [];
      }

      acc[relation.id_alumni].push({
        role: relation.rol,
        currentJob: Boolean(relation.currentjob),
        restaurant: restaurantById[relation.id_restaurant]
      });

      return acc;
    }, {});
  }, [relations, restaurantById]);

  const filteredStudents = students.filter((student) =>
    student.Name?.toLowerCase().includes(searchStudents.toLowerCase())
  );

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.Name?.toLowerCase().includes(searchRestaurants.toLowerCase())
  );

  const selectedStudent = students.find((student) => student.id === selectedStudentId);

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Hostelería Joviat</h1>
        <button className="reload-button" onClick={() => window.location.reload()}>
          Recargar
        </button>
      </header>

      <main className="main-content">
        {loading && <p>Cargando datos desde Firestore…</p>}
        {error && <p className="error-box">Error: {error}</p>}

        {!loading && !error && (
          <>
            {!selectedStudent && (
              <div className="tabs">
                <button
                  className={activeTab === "alumnos" ? "active" : ""}
                  onClick={() => setActiveTab("alumnos")}
                >
                  Alumnos
                </button>
                <button
                  className={activeTab === "restaurantes" ? "active" : ""}
                  onClick={() => setActiveTab("restaurantes")}
                >
                  Restaurantes
                </button>
              </div>
            )}

            {!selectedStudent && activeTab === "alumnos" && (
              <section>
                <input
                  className="search-input"
                  placeholder="Buscar alumno por nombre"
                  value={searchStudents}
                  onChange={(event) => setSearchStudents(event.target.value)}
                />

                <div className="card-grid">
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      className="student-card"
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <img src={student.PhotoURL || "/logo192.png"} alt={student.Name} />
                      <h3>{student.Name}</h3>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {!selectedStudent && activeTab === "restaurantes" && (
              <section>
                <input
                  className="search-input"
                  placeholder="Buscar restaurante por nombre"
                  value={searchRestaurants}
                  onChange={(event) => setSearchRestaurants(event.target.value)}
                />

                <div className="restaurant-layout">
                  <ul className="restaurant-list">
                    {filteredRestaurants.map((restaurant) => (
                      <li key={restaurant.id}>
                        <h3>{restaurant.Name}</h3>
                        <p>
                          Lat: {restaurant.Location?.lat ?? "-"} | Lng: {restaurant.Location?.lng ?? "-"}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <RestaurantMap restaurants={filteredRestaurants} />
                </div>
              </section>
            )}

            {selectedStudent && (
              <section className="student-detail">
                <button className="back-button" onClick={() => setSelectedStudentId(null)}>
                  ← Volver al listado
                </button>
                <div className="detail-header">
                  <img src={selectedStudent.PhotoURL || "/logo192.png"} alt={selectedStudent.Name} />
                  <div>
                    <h2>{selectedStudent.Name}</h2>
                    <p>ID: {selectedStudent.id}</p>
                  </div>
                </div>

                <h3>Experiencia en restaurantes</h3>
                <ul>
                  {(jobsByStudentId[selectedStudent.id] || []).map((job, index) => (
                    <li key={`${selectedStudent.id}-${index}`}>
                      {job.restaurant?.Name || "Restaurante no encontrado"} · {job.role || "Sin rol"} ·
                      {job.currentJob ? " En activo" : " Histórico"}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function RestaurantMap({ restaurants }) {
  const points = restaurants
    .filter((restaurant) => restaurant.Location && Number.isFinite(restaurant.Location.lat) && Number.isFinite(restaurant.Location.lng))
    .map((restaurant) => ({ id: restaurant.id, name: restaurant.Name, ...restaurant.Location }));

  if (points.length === 0) {
    return <div className="map-box">No hay coordenadas para mostrar en el mapa.</div>;
  }

  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return (
    <div className="map-box" aria-label="Mapa de restaurantes">
      {points.map((point) => {
        const top = normalize(point.lat, minLat, maxLat);
        const left = normalize(point.lng, minLng, maxLng);

        return (
          <div
            key={point.id}
            className="map-pin"
            style={{ top: `${100 - top}%`, left: `${left}%` }}
            title={`${point.name} (${point.lat}, ${point.lng})`}
          >
            📍
          </div>
        );
      })}
    </div>
  );
}

function normalize(value, min, max) {
  if (min === max) {
    return 50;
  }
  return ((value - min) / (max - min)) * 100;
}

function buildFirestoreUrl(collectionName) {
  if (!FIRESTORE_PROJECT_ID) {
    throw new Error("Falta REACT_APP_FIREBASE_PROJECT_ID en el .env");
  }

  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/${collectionName}`
  );

  if (FIRESTORE_API_KEY) {
    url.searchParams.set("key", FIRESTORE_API_KEY);
  }

  return url.toString();
}

async function fetchCollection(collectionName) {
  const response = await fetch(buildFirestoreUrl(collectionName));

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${collectionName} (${response.status})`);
  }

  const data = await response.json();
  return (data.documents || []).map(parseDocument);
}

function parseDocument(document) {
  const id = document.name.split("/").pop();
  const parsedFields = Object.entries(document.fields || {}).reduce((acc, [fieldName, fieldValue]) => {
    acc[fieldName] = parseFirestoreField(fieldValue);
    return acc;
  }, {});

  return { id, ...parsedFields };
}

function parseFirestoreField(fieldValue) {
  if (fieldValue.stringValue !== undefined) {
    return fieldValue.stringValue;
  }

  if (fieldValue.booleanValue !== undefined) {
    return fieldValue.booleanValue;
  }

  if (fieldValue.doubleValue !== undefined || fieldValue.integerValue !== undefined) {
    return Number(fieldValue.doubleValue ?? fieldValue.integerValue);
  }

  if (fieldValue.geoPointValue) {
    return {
      lat: Number(fieldValue.geoPointValue.latitude),
      lng: Number(fieldValue.geoPointValue.longitude)
    };
  }

  if (fieldValue.referenceValue) {
    return fieldValue.referenceValue.split("/").pop();
  }

  return null;
}

export default App;
