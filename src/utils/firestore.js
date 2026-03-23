const FIRESTORE_PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID;
const FIRESTORE_DATABASE_ID = process.env.REACT_APP_FIREBASE_DATABASE_ID || "(default)";
const FIRESTORE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;

// Carga de colecciones base de Firestore. Los administradores viven en su propia colección.
export async function loadFirestoreData() {
  const [students, restaurants, relations, administrators] = await Promise.all([
    fetchCollection("Alumnos"),
    fetchCollection("Restaurante"),
    fetchCollection("Res-Alum"),
    fetchCollection("Administrator")
  ]);

  return { students, restaurants, relations, administrators };
}

async function fetchCollection(collectionName) {
  const response = await fetch(buildFirestoreUrl(collectionName));
  if (!response.ok) throw new Error(`No se pudo cargar ${collectionName} (${response.status})`);
  const data = await response.json();
  return (data.documents || []).map(parseDocument);
}

function buildFirestoreUrl(collectionName) {
  if (!FIRESTORE_PROJECT_ID) throw new Error("Falta REACT_APP_FIREBASE_PROJECT_ID en el .env");

  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/${collectionName}`
  );

  if (FIRESTORE_API_KEY) url.searchParams.set("key", FIRESTORE_API_KEY);
  return url.toString();
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
  if (fieldValue.arrayValue) return (fieldValue.arrayValue.values || []).map(parseFirestoreField);
  return null;
}
