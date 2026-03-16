// Normaliza arrays/referencias para no depender del formato exacto de Firestore.
export function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

// Usa campo Status/status de Alumnos.
export function normalizeStatus(statusValue) {
  const raw = String(statusValue || "").trim();
  if (!raw) return "Sin status";

  const lower = raw.toLowerCase();
  if (["alumne", "alumno", "alumna"].includes(lower)) return "Alumno";
  if (["exalumne", "exalumno", "exalumna"].includes(lower)) return "Exalumno";

  return raw;
}

export function getCurrentJobFlag(relation) {
  return Boolean(relation.current_job ?? relation.currentjob);
}

// Deriva índices y relaciones para consulta rápida por vista.
export function buildViewModel({ students, restaurants, relations }) {
  const studentById = Object.fromEntries(students.map((s) => [s.id, s]));
  const restaurantById = Object.fromEntries(restaurants.map((r) => [r.id, r]));

  const jobsByStudentId = {};
  const jobsByRestaurantId = {};

  relations.forEach((relation) => {
    const alumniIds = ensureArray(relation.id_alumni || relation.id_alumnos);
    const restaurantIds = ensureArray(relation.id_restaurant);

    alumniIds.forEach((alumniId) => {
      if (!jobsByStudentId[alumniId]) jobsByStudentId[alumniId] = [];
      restaurantIds.forEach((restaurantId) => {
        jobsByStudentId[alumniId].push({
          role: relation.rol,
          currentJob: getCurrentJobFlag(relation),
          restaurant: restaurantById[restaurantId] || null
        });
      });
    });

    restaurantIds.forEach((restaurantId) => {
      if (!jobsByRestaurantId[restaurantId]) jobsByRestaurantId[restaurantId] = [];
      alumniIds.forEach((alumniId) => {
        jobsByRestaurantId[restaurantId].push({
          role: relation.rol,
          currentJob: getCurrentJobFlag(relation),
          student: studentById[alumniId] || null
        });
      });
    });
  });

  const studentSummaryById = {};
  students.forEach((student) => {
    const jobs = jobsByStudentId[student.id] || [];
    studentSummaryById[student.id] = {
      alumniType: normalizeStatus(student.Status ?? student.status),
      hasCurrentJob: jobs.some((job) => job.currentJob)
    };
  });

  return {
    studentById,
    restaurantById,
    jobsByStudentId,
    jobsByRestaurantId,
    studentSummaryById
  };
}
