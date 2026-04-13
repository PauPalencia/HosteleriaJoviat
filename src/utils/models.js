export const ROLE_KEYS = {
  STUDENT: "alumnos",
  PENDING_STUDENT: "pendingalumnos",
  ADMINISTRATOR: "administradores"
};

const ROLE_LABELS = {
  [ROLE_KEYS.STUDENT]: "Alumno",
  [ROLE_KEYS.PENDING_STUDENT]: "PendingAlumno",
  [ROLE_KEYS.ADMINISTRATOR]: "Administrador"
};

export function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

// Normaliza cualquier status legado para dejar solo los tres tipos de rol pedidos.
export function normalizeRole(statusValue, fallbackRole = ROLE_KEYS.STUDENT) {
  const raw = String(statusValue || "").trim();
  if (!raw) return fallbackRole;

  const compact = raw.toLowerCase().replace(/[\s_-]+/g, "");

  if (["admin", "administrator", "administrador", "administradores"].includes(compact)) {
    return ROLE_KEYS.ADMINISTRATOR;
  }

  if (["pendingalumno", "pendingalumnos", "pendentingalumnos", "pendingstudent", "pendingstudents", "pending"].includes(compact)) {
    return ROLE_KEYS.PENDING_STUDENT;
  }

  return ROLE_KEYS.STUDENT;
}

export function getRoleLabel(roleKey) {
  return ROLE_LABELS[roleKey] || ROLE_LABELS[ROLE_KEYS.STUDENT];
}

export function getCurrentJobFlag(relation) {
  return Boolean(relation.current_job ?? relation.currentjob);
}

// Construye las relaciones para las pantallas públicas y mantiene el etiquetado coherente.
export function buildViewModel({ students, restaurants, relations }) {
  const studentById = Object.fromEntries(students.map((student) => [student.id, student]));
  const restaurantById = Object.fromEntries(restaurants.map((restaurant) => [restaurant.id, restaurant]));

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
      alumniType: getRoleLabel(normalizeRole(student.Status ?? student.status, ROLE_KEYS.STUDENT)),
      hasCurrentJob: jobs.some((job) => job.currentJob)
    };
  });

  const restaurantAssociatesById = {};
  Object.entries(jobsByRestaurantId).forEach(([restaurantId, jobs]) => {
    const uniq = [];
    const seen = new Set();
    jobs.forEach((job) => {
      if (job.student?.id && !seen.has(job.student.id)) {
        seen.add(job.student.id);
        uniq.push(job.student);
      }
    });
    restaurantAssociatesById[restaurantId] = uniq;
  });

  return {
    studentById,
    restaurantById,
    jobsByStudentId,
    jobsByRestaurantId,
    studentSummaryById,
    restaurantAssociatesById
  };
}
