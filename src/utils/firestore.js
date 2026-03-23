const FIRESTORE_PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID;
const FIRESTORE_DATABASE_ID = process.env.REACT_APP_FIREBASE_DATABASE_ID || "(default)";
const FIRESTORE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;

export async function loadFirestoreData() {
  const [students, restaurants, relations, users, pendingUsers] = await Promise.all([
    fetchCollection("Alumnos"),
    fetchCollection("Restaurante"),
    fetchCollection("Res-Alum"),
    fetchCollection("Usuarios", { optional: true }),
    fetchCollection("PendingUsers", { optional: true })
  ]);

  return { students, restaurants, relations, users, pendingUsers };
}

export async function createDocument(collectionName, fields, documentId) {
  const url = buildDocumentUrl(collectionName, documentId);
  const response = await fetch(url, {
    method: documentId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: serializeFirestoreFields(fields) })
  });

  if (!response.ok) {
    const message = await safeReadError(response, `No se pudo crear el documento en ${collectionName}`);
    throw new Error(message);
  }

  const data = await response.json();
  return parseDocument(data);
}

export async function deleteDocument(collectionName, documentId) {
  const response = await fetch(buildDocumentUrl(collectionName, documentId), { method: "DELETE" });
  if (!response.ok) {
    const message = await safeReadError(response, `No se pudo borrar el documento ${documentId} de ${collectionName}`);
    throw new Error(message);
  }
}

export async function fetchCollection(collectionName, options = {}) {
  const response = await fetch(buildFirestoreUrl(collectionName));

  if (!response.ok) {
    if (options.optional && response.status === 404) return [];
    const message = await safeReadError(response, `No se pudo cargar ${collectionName} (${response.status})`);
    throw new Error(message);
  }

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

function buildDocumentUrl(collectionName, documentId) {
  if (!FIRESTORE_PROJECT_ID) throw new Error("Falta REACT_APP_FIREBASE_PROJECT_ID en el .env");

  const path = documentId
    ? `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/${collectionName}/${documentId}`
    : `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/${collectionName}`;

  const url = new URL(path);
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
  if (fieldValue.mapValue) {
    return Object.entries(fieldValue.mapValue.fields || {}).reduce((acc, [key, value]) => {
      acc[key] = parseFirestoreField(value);
      return acc;
    }, {});
  }
  return null;
}

function serializeFirestoreFields(fields) {
  return Object.entries(fields).reduce((acc, [key, value]) => {
    if (value === undefined) return acc;
    acc[key] = serializeFirestoreField(value);
    return acc;
  }, {});
}

function serializeFirestoreField(value) {
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(serializeFirestoreField)
      }
    };
  }

  if (value && typeof value === "object") {
    if (Number.isFinite(value.lat) && Number.isFinite(value.lng)) {
      return {
        geoPointValue: {
          latitude: value.lat,
          longitude: value.lng
        }
      };
    }

    return {
      mapValue: {
        fields: serializeFirestoreFields(value)
      }
    };
  }

  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  return { stringValue: String(value ?? "") };
}

async function safeReadError(response, fallbackMessage) {
  try {
    const data = await response.json();
    return data.error?.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}
