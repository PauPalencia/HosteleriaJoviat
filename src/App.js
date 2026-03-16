import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const FIRESTORE_PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID;
const FIRESTORE_DATABASE_ID = process.env.REACT_APP_FIREBASE_DATABASE_ID || "(default)";
const FIRESTORE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;

function App() {
  const [section, setSection] = useState("inicio");
  const [searchStudents, setSearchStudents] = useState("");
  const [searchRestaurants, setSearchRestaurants] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

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

  const studentById = useMemo(() => Object.fromEntries(students.map((student) => [student.id, student])), [students]);
  const restaurantById = useMemo(
    () => Object.fromEntries(restaurants.map((restaurant) => [restaurant.id, restaurant])),
    [restaurants]
  );

  const jobsByStudentId = useMemo(() => {
    const map = {};
    relations.forEach((relation) => {
      const alumniIds = ensureArray(relation.id_alumni || relation.id_alumnos || relation.id_alumni);
      const restaurantIds = ensureArray(relation.id_restaurant);

      alumniIds.forEach((alumniId) => {
        if (!map[alumniId]) map[alumniId] = [];
        restaurantIds.forEach((restaurantId) => {
          map[alumniId].push({
            role: relation.rol,
            currentJob: getCurrentJobFlag(relation),
            restaurant: restaurantById[restaurantId] || null
          });
        });
      });
    });
    return map;
  }, [relations, restaurantById]);

  const jobsByRestaurantId = useMemo(() => {
    const map = {};
    relations.forEach((relation) => {
      const alumniIds = ensureArray(relation.id_alumni || relation.id_alumnos || relation.id_alumni);
      const restaurantIds = ensureArray(relation.id_restaurant);

      restaurantIds.forEach((restaurantId) => {
        if (!map[restaurantId]) map[restaurantId] = [];
        alumniIds.forEach((alumniId) => {
          map[restaurantId].push({
            role: relation.rol,
            currentJob: getCurrentJobFlag(relation),
            student: studentById[alumniId] || null
          });
        });
      });
    });
    return map;
  }, [relations, studentById]);

  const studentSummaryById = useMemo(() => {
    const summary = {};
    students.forEach((student) => {
      const jobs = jobsByStudentId[student.id] || [];
      const hasCurrentJob = jobs.some((job) => job.currentJob);
      const alumniType = student.Alumni || (jobs.length > 0 ? "Exalumno" : "Alumno");
      summary[student.id] = { alumniType, hasCurrentJob };
    });
    return summary;
  }, [students, jobsByStudentId]);

  const filteredStudents = students.filter((student) =>
    student.Name?.toLowerCase().includes(searchStudents.toLowerCase())
  );
  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.Name?.toLowerCase().includes(searchRestaurants.toLowerCase())
  );

  const selectedStudent = selectedStudentId ? studentById[selectedStudentId] : null;
  const selectedRestaurant = selectedRestaurantId ? restaurantById[selectedRestaurantId] : null;

  const goSection = (nextSection) => {
    setSection(nextSection);
    setSelectedStudentId(null);
    setSelectedRestaurantId(null);
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>JOVIAT</h1>
        <nav>
          <button onClick={() => goSection("inicio")} className={section === "inicio" ? "active" : ""}>Inicio</button>
          <button onClick={() => goSection("alumnos")} className={section === "alumnos" ? "active" : ""}>Alumnos</button>
          <button onClick={() => goSection("restaurantes")} className={section === "restaurantes" ? "active" : ""}>Restaurantes</button>
          <button onClick={() => goSection("auth")} className={section === "auth" ? "active" : ""}>Iniciar sesión / Registro</button>
        </nav>
      </aside>

      <main className="content">
        {loading && <p className="state-text">Cargando datos desde Firestore…</p>}
        {error && <p className="error-box">Error: {error}</p>}

        {!loading && !error && section === "inicio" && (
          <section className="panel">
            <h2>Inicio</h2>
            <p className="state-text">Usa el menú para navegar entre alumnos, restaurantes y autenticación.</p>
          </section>
        )}

        {!loading && !error && section === "alumnos" && !selectedStudent && (
          <section className="panel">
            <h2>Alumnos</h2>
            <SearchInput value={searchStudents} onChange={setSearchStudents} placeholder="Buscar alumno por nombre" />
            <div className="card-grid">
              {filteredStudents.map((student) => {
                const summary = studentSummaryById[student.id] || { alumniType: "Alumno", hasCurrentJob: false };
                return (
                  <button key={student.id} className="student-card" onClick={() => setSelectedStudentId(student.id)}>
                    <img src={student.PhotoURL || "/logo192.png"} alt={student.Name} />
                    <h3>{student.Name}</h3>
                    <div className="badge-row">
                      <span className="badge badge-dark">{summary.alumniType}</span>
                      <span className={`badge ${summary.hasCurrentJob ? "badge-green" : "badge-gray"}`}>
                        {summary.hasCurrentJob ? "Trabajando ahora" : "Sin trabajo activo"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {!loading && !error && section === "alumnos" && selectedStudent && (
          <section className="panel">
            <button className="small-btn" onClick={() => setSelectedStudentId(null)}>← Volver a alumnos</button>
            <div className="detail-header">
              <img src={selectedStudent.PhotoURL || "/logo192.png"} alt={selectedStudent.Name} />
              <div>
                <h2>{selectedStudent.Name}</h2>
                <p>ID: {selectedStudent.id}</p>
                <div className="badge-row">
                  <span className="badge badge-dark">{studentSummaryById[selectedStudent.id]?.alumniType || "Alumno"}</span>
                  <span className={`badge ${studentSummaryById[selectedStudent.id]?.hasCurrentJob ? "badge-green" : "badge-gray"}`}>
                    {studentSummaryById[selectedStudent.id]?.hasCurrentJob ? "Trabajando actualmente" : "No está trabajando actualmente"}
                  </span>
                </div>
              </div>
            </div>

            <section className="kv-grid">
              {renderEntityFields(selectedStudent, ["id", "Name", "PhotoURL", "Alumni"]) }
            </section>

            <h3>Restaurantes en los que ha trabajado</h3>
            <ul className="spaced-list">
              {(jobsByStudentId[selectedStudent.id] || []).map((job, index) => (
                <li key={`${selectedStudent.id}-${index}`} className="line-item">
                  <button
                    className="link-btn"
                    onClick={() => {
                      setSection("restaurantes");
                      setSelectedRestaurantId(job.restaurant?.id || null);
                    }}
                    disabled={!job.restaurant?.id}
                  >
                    {job.restaurant?.Name || "Restaurante no encontrado"}
                  </button>
                  <span className={`badge ${job.currentJob ? "badge-green" : "badge-gray"}`}>
                    {job.currentJob ? "Trabajando actualmente" : "Trabajó antes"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!loading && !error && section === "restaurantes" && !selectedRestaurant && (
          <section className="panel">
            <h2>Restaurantes</h2>
            <SearchInput value={searchRestaurants} onChange={setSearchRestaurants} placeholder="Buscar restaurante por nombre" />
            <div className="restaurant-layout">
              <div className="restaurant-list-scroll">
                <ul className="restaurant-list">
                  {filteredRestaurants.map((restaurant) => (
                    <li key={restaurant.id}>
                      <button className="link-btn" onClick={() => setSelectedRestaurantId(restaurant.id)}>{restaurant.Name}</button>
                      <p>ID: {restaurant.id}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="map-sticky-wrap">
                <LeafletRestaurantMap restaurants={filteredRestaurants} />
              </div>
            </div>
          </section>
        )}

        {!loading && !error && section === "restaurantes" && selectedRestaurant && (
          <section className="panel">
            <button className="small-btn" onClick={() => setSelectedRestaurantId(null)}>← Volver a restaurantes</button>
            <h2>{selectedRestaurant.Name}</h2>
            <p>ID: {selectedRestaurant.id}</p>
            <div className="detail-map-wrap">
              <LeafletRestaurantMap restaurants={[selectedRestaurant]} forceCenter />
            </div>

            <section className="kv-grid">
              {renderEntityFields(selectedRestaurant, ["id", "Name", "Location"]) }
            </section>

            <h3>Alumnos que trabajan o han trabajado aquí</h3>
            <ul className="spaced-list">
              {(jobsByRestaurantId[selectedRestaurant.id] || []).map((job, index) => {
                const summary = studentSummaryById[job.student?.id] || { alumniType: "Alumno", hasCurrentJob: false };
                return (
                  <li key={`${selectedRestaurant.id}-${index}`} className="line-item">
                    <button
                      className="link-btn"
                      onClick={() => {
                        setSection("alumnos");
                        setSelectedStudentId(job.student?.id || null);
                      }}
                      disabled={!job.student?.id}
                    >
                      {job.student?.Name || "Alumno no encontrado"}
                    </button>
                    <span className="badge badge-dark">{summary.alumniType}</span>
                    <span className={`badge ${job.currentJob ? "badge-green" : "badge-gray"}`}>
                      {job.currentJob ? "Trabajando actualmente" : "Trabajó antes"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {!loading && !error && section === "auth" && <AuthPanel authMode={authMode} setAuthMode={setAuthMode} />}
      </main>
    </div>
  );
}

function renderEntityFields(entity, excludedKeys) {
  return Object.entries(entity)
    .filter(([key]) => !excludedKeys.includes(key))
    .map(([key, value]) => {
      let printableValue = value;
      if (value && typeof value === "object") {
        printableValue = JSON.stringify(value);
      }
      return (
        <div className="kv-item" key={key}>
          <strong>{key}</strong>
          <span>{String(printableValue)}</span>
        </div>
      );
    });
}

function getCurrentJobFlag(relation) {
  return Boolean(relation.current_job ?? relation.currentjob);
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="search-wrap">
      <input className="search-input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      {value && (
        <button className="search-clear-btn" onClick={() => onChange("")} aria-label="Limpiar búsqueda">
          ×
        </button>
      )}
    </div>
  );
}

function AuthPanel({ authMode, setAuthMode }) {
  return (
    <section className="panel">
      <h2>{authMode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
      <div className="auth-tabs">
        <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>Login</button>
        <button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>Registro</button>
      </div>
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        {authMode === "register" && <input placeholder="Nombre completo" />}
        <input type="email" placeholder="Correo" />
        <input type="password" placeholder="Contraseña" />
        <button type="submit" className="primary-btn">{authMode === "login" ? "Entrar" : "Crear cuenta"}</button>
      </form>
    </section>
  );
}

function LeafletRestaurantMap({ restaurants, forceCenter = false }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);

  const points = useMemo(
    () => restaurants
      .filter((r) => r.Location && Number.isFinite(r.Location.lat) && Number.isFinite(r.Location.lng))
      .map((r) => ({ id: r.id, name: r.Name, lat: r.Location.lat, lng: r.Location.lng })),
    [restaurants]
  );

  useEffect(() => {
    let cancelled = false;
    async function renderMap() {
      const container = mapContainerRef.current;
      if (!container) return;
      const L = await loadLeaflet();
      if (cancelled || !container) return;

      if (!mapRef.current) {
        mapRef.current = L.map(container, { zoomControl: true, preferCanvas: true }).setView([41.3851, 2.1734], 8);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);
        markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
      }

      const map = mapRef.current;
      const markerLayer = markerLayerRef.current;
      markerLayer.clearLayers();

      if (points.length === 0) {
        map.setView([41.3851, 2.1734], 8);
        requestAnimationFrame(() => map.invalidateSize());
        return;
      }

      const bounds = [];
      points.forEach((point) => {
        L.marker([point.lat, point.lng]).addTo(markerLayer).bindPopup(`<strong>${point.name}</strong>`);
        bounds.push([point.lat, point.lng]);
      });

      if (points.length === 1 || forceCenter) {
        map.setView([points[0].lat, points[0].lng], 14);
      } else {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
      requestAnimationFrame(() => map.invalidateSize());
    }

    renderMap();
    return () => { cancelled = true; };
  }, [points, forceCenter]);

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

function buildFirestoreUrl(collectionName) {
  if (!FIRESTORE_PROJECT_ID) throw new Error("Falta REACT_APP_FIREBASE_PROJECT_ID en el .env");

  const url = new URL(`https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/${collectionName}`);
  if (FIRESTORE_API_KEY) url.searchParams.set("key", FIRESTORE_API_KEY);
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
    return { lat: Number(fieldValue.geoPointValue.latitude), lng: Number(fieldValue.geoPointValue.longitude) };
  }
  if (fieldValue.referenceValue) return fieldValue.referenceValue.split("/").pop();
  if (fieldValue.arrayValue) return (fieldValue.arrayValue.values || []).map(parseFirestoreField);
  return null;
}

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

export default App;
