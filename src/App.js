import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const FIRESTORE_PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID;
const FIRESTORE_DATABASE_ID = process.env.REACT_APP_FIREBASE_DATABASE_ID || "(default)";
const FIRESTORE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;

function App() {
  const [activeTab, setActiveTab] = useState("alumnos");
  const [searchStudents, setSearchStudents] = useState("");
  const [searchRestaurants, setSearchRestaurants] = useState("");
  const [route, setRoute] = useState(readRouteFromUrl());
  const [students, setStudents] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const onPopState = () => setRoute(readRouteFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

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

  const studentById = useMemo(() => Object.fromEntries(students.map((s) => [s.id, s])), [students]);
  const restaurantById = useMemo(
    () => Object.fromEntries(restaurants.map((restaurant) => [restaurant.id, restaurant])),
    [restaurants]
  );

  const jobsByStudentId = useMemo(() => {
    return relations.reduce((acc, relation) => {
      if (!relation.id_alumni) return acc;
      if (!acc[relation.id_alumni]) acc[relation.id_alumni] = [];

      acc[relation.id_alumni].push({
        role: relation.rol,
        currentJob: Boolean(relation.currentjob),
        restaurant: restaurantById[relation.id_restaurant],
        student: studentById[relation.id_alumni]
      });

      return acc;
    }, {});
  }, [relations, restaurantById, studentById]);

  const jobsByRestaurantId = useMemo(() => {
    return relations.reduce((acc, relation) => {
      if (!relation.id_restaurant) return acc;
      if (!acc[relation.id_restaurant]) acc[relation.id_restaurant] = [];

      acc[relation.id_restaurant].push({
        role: relation.rol,
        currentJob: Boolean(relation.currentjob),
        restaurant: restaurantById[relation.id_restaurant],
        student: studentById[relation.id_alumni]
      });

      return acc;
    }, {});
  }, [relations, restaurantById, studentById]);

  const filteredStudents = students.filter((student) =>
    student.Name?.toLowerCase().includes(searchStudents.toLowerCase())
  );

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.Name?.toLowerCase().includes(searchRestaurants.toLowerCase())
  );

  const selectedStudent = route.type === "student" ? studentById[route.id] : null;
  const selectedRestaurant = route.type === "restaurant" ? restaurantById[route.id] : null;

  const goToPath = (path) => {
    window.history.pushState({}, "", path);
    setRoute(readRouteFromUrl());
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Hostelería Joviat</h1>
      </header>

      <main className="main-content">
        {loading && <p>Cargando datos desde Firestore…</p>}
        {error && <p className="error-box">Error: {error}</p>}

        {!loading && !error && route.type === "home" && (
          <>
            <div className="tabs">
              <button className={activeTab === "alumnos" ? "active" : ""} onClick={() => setActiveTab("alumnos")}>
                Alumnos
              </button>
              <button
                className={activeTab === "restaurantes" ? "active" : ""}
                onClick={() => setActiveTab("restaurantes")}
              >
                Restaurantes
              </button>
            </div>

            {activeTab === "alumnos" && (
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
                      onClick={() => goToPath(`/alumno/${student.id}`)}
                    >
                      <img src={student.PhotoURL || "/logo192.png"} alt={student.Name} />
                      <h3>{student.Name}</h3>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "restaurantes" && (
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
                        <button className="link-title" onClick={() => goToPath(`/restaurante/${restaurant.id}`)}>
                          {restaurant.Name}
                        </button>
                        <p>
                          Lat: {restaurant.Location?.lat ?? "-"} | Lng: {restaurant.Location?.lng ?? "-"}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <LeafletRestaurantMap restaurants={filteredRestaurants} active={activeTab === "restaurantes"} />
                </div>
              </section>
            )}
          </>
        )}

        {!loading && !error && route.type === "student" && selectedStudent && (
          <section className="detail-box">
            <button className="back-button" onClick={() => goToPath("/")}>← Volver al listado</button>
            <div className="detail-header">
              <img src={selectedStudent.PhotoURL || "/logo192.png"} alt={selectedStudent.Name} />
              <div>
                <h2>{selectedStudent.Name}</h2>
                <p>ID: {selectedStudent.id}</p>
              </div>
            </div>

            <h3>Restaurantes en los que ha trabajado</h3>
            <ul>
              {(jobsByStudentId[selectedStudent.id] || []).map((job, index) => (
                <li key={`${selectedStudent.id}-${index}`}>
                  <button
                    className="inline-link"
                    onClick={() => goToPath(`/restaurante/${job.restaurant?.id || ""}`)}
                    disabled={!job.restaurant?.id}
                  >
                    {job.restaurant?.Name || "Restaurante no encontrado"}
                  </button>
                  {" · "}
                  {job.role || "Sin rol"}
                  {" · "}
                  {job.currentJob ? "En activo" : "Histórico"}
                </li>
              ))}
            </ul>
          </section>
        )}

        {!loading && !error && route.type === "restaurant" && selectedRestaurant && (
          <section className="detail-box">
            <button className="back-button" onClick={() => goToPath("/")}>← Volver al listado</button>

            <h2>{selectedRestaurant.Name}</h2>
            <p>
              Coordenadas: {selectedRestaurant.Location?.lat ?? "-"}, {selectedRestaurant.Location?.lng ?? "-"}
            </p>

            <h3>Alumnos que han trabajado aquí</h3>
            <ul>
              {(jobsByRestaurantId[selectedRestaurant.id] || []).map((job, index) => (
                <li key={`${selectedRestaurant.id}-${index}`}>
                  <button
                    className="inline-link"
                    onClick={() => goToPath(`/alumno/${job.student?.id || ""}`)}
                    disabled={!job.student?.id}
                  >
                    {job.student?.Name || "Alumno no encontrado"}
                  </button>
                  {" · "}
                  {job.role || "Sin rol"}
                  {" · "}
                  {job.currentJob ? "En activo" : "Histórico"}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function LeafletRestaurantMap({ restaurants, active }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);

  const points = useMemo(
    () =>
      restaurants
        .filter(
          (restaurant) =>
            restaurant.Location &&
            Number.isFinite(restaurant.Location.lat) &&
            Number.isFinite(restaurant.Location.lng)
        )
        .map((restaurant) => ({
          id: restaurant.id,
          name: restaurant.Name,
          lat: restaurant.Location.lat,
          lng: restaurant.Location.lng
        })),
    [restaurants]
  );

  useEffect(() => {
    let cancelled = false;

    async function renderMap() {
      if (!mapContainerRef.current) return;

      const L = await loadLeaflet();
      if (cancelled || !mapContainerRef.current) return;

      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current, { zoomControl: true }).setView([41.3851, 2.1734], 8);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);
        markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
      }

      const map = mapRef.current;
      const markerLayer = markersLayerRef.current;
      markerLayer.clearLayers();

      if (points.length === 0) {
        map.setView([41.3851, 2.1734], 8);
        setTimeout(() => map.invalidateSize(), 0);
        return;
      }

      const bounds = [];
      points.forEach((point) => {
        L.marker([point.lat, point.lng]).addTo(markerLayer).bindPopup(`<strong>${point.name}</strong>`);
        bounds.push([point.lat, point.lng]);
      });

      if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      } else {
        map.fitBounds(bounds, { padding: [30, 30] });
      }

      setTimeout(() => map.invalidateSize(), 0);
    }

    renderMap();

    return () => {
      cancelled = true;
    };
  }, [points, active]);

  return <div ref={mapContainerRef} className="map-box" aria-label="Mapa de restaurantes" />;
}

let leafletPromise;
async function loadLeaflet() {
  if (window.L) return window.L;

  if (!leafletPromise) {
    leafletPromise = new Promise((resolve, reject) => {
      if (!document.querySelector("link[data-leaflet]")) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        link.dataset.leaflet = "true";
        document.head.appendChild(link);
      }

      const existingScript = document.querySelector("script[data-leaflet]");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.L));
        existingScript.addEventListener("error", () => reject(new Error("No se pudo cargar Leaflet")));
        return;
      }

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.dataset.leaflet = "true";
      script.onload = () => resolve(window.L);
      script.onerror = () => reject(new Error("No se pudo cargar Leaflet"));
      document.body.appendChild(script);
    });
  }

  return leafletPromise;
}

function readRouteFromUrl() {
  const studentMatch = window.location.pathname.match(/^\/alumno\/([^/]+)$/);
  if (studentMatch) return { type: "student", id: studentMatch[1] };

  const restaurantMatch = window.location.pathname.match(/^\/restaurante\/([^/]+)$/);
  if (restaurantMatch) return { type: "restaurant", id: restaurantMatch[1] };

  return { type: "home" };
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
  if (!response.ok) throw new Error(`No se pudo cargar ${collectionName} (${response.status})`);
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
  if (fieldValue.stringValue !== undefined) return fieldValue.stringValue;
  if (fieldValue.booleanValue !== undefined) return fieldValue.booleanValue;
  if (fieldValue.doubleValue !== undefined || fieldValue.integerValue !== undefined) {
    return Number(fieldValue.doubleValue ?? fieldValue.integerValue);
  }
  if (fieldValue.geoPointValue) {
    return {
      lat: Number(fieldValue.geoPointValue.latitude),
      lng: Number(fieldValue.geoPointValue.longitude)
    };
  }
  if (fieldValue.referenceValue) return fieldValue.referenceValue.split("/").pop();

  return null;
}

export default App;
