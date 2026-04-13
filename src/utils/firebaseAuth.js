const FIREBASE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;

// Crea un usuario en Firebase Auth usando el endpoint público de Identity Toolkit.
export async function createFirebaseAuthUser({ email, password }) {
  if (!FIREBASE_API_KEY) {
    throw new Error("Falta REACT_APP_FIREBASE_API_KEY para crear usuarios en Firebase Auth.");
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: false
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const firebaseMessage = data?.error?.message || "UNKNOWN_ERROR";
    throw new Error(getFirebaseSignupError(firebaseMessage));
  }

  return {
    uid: data.localId,
    email: data.email
  };
}

function getFirebaseSignupError(firebaseMessage) {
  if (firebaseMessage === "EMAIL_EXISTS") {
    return "Ya existe un usuario en Firebase Auth con ese correo.";
  }

  if (firebaseMessage === "OPERATION_NOT_ALLOWED") {
    return "El registro por email/contraseña no está habilitado en Firebase Auth.";
  }

  if (firebaseMessage.includes("WEAK_PASSWORD")) {
    return "Firebase Auth rechaza la contraseña por ser demasiado débil.";
  }

  return `No se pudo crear el usuario en Firebase Auth: ${firebaseMessage}.`;
}
