import React, { useState } from "react";

const INITIAL_STUDENT = {
  Name: "",
  Email: "",
  Phone: "",
  Curso: "",
  Status: "Alumno",
  PhotoURL: ""
};

const INITIAL_RESTAURANT = {
  Name: "",
  Address: "",
  Email: "",
  Phone: "",
  PhotoURL: "",
  lat: "",
  lng: ""
};

export default function CreateRecordsPage({ onCreateStudent, onCreateRestaurant, feedback }) {
  const [mode, setMode] = useState("student");
  const [studentForm, setStudentForm] = useState(INITIAL_STUDENT);
  const [restaurantForm, setRestaurantForm] = useState(INITIAL_RESTAURANT);

  async function handleStudentSubmit(event) {
    event.preventDefault();
    await onCreateStudent({
      ...studentForm,
      Phone: studentForm.Phone.trim(),
      Email: studentForm.Email.trim(),
      Name: studentForm.Name.trim(),
      Curso: studentForm.Curso.trim(),
      PhotoURL: studentForm.PhotoURL.trim()
    });
    setStudentForm(INITIAL_STUDENT);
  }

  async function handleRestaurantSubmit(event) {
    event.preventDefault();
    await onCreateRestaurant({
      Name: restaurantForm.Name.trim(),
      Address: restaurantForm.Address.trim(),
      Email: restaurantForm.Email.trim(),
      Phone: restaurantForm.Phone.trim(),
      PhotoURL: restaurantForm.PhotoURL.trim(),
      Location: {
        lat: Number(restaurantForm.lat || 0),
        lng: Number(restaurantForm.lng || 0)
      }
    });
    setRestaurantForm(INITIAL_RESTAURANT);
  }

  return (
    <section className="panel">
      <h2>Crear registros</h2>
      <p className="state-text">Desde aquí puedes añadir alumnos o restaurantes nuevos.</p>

      <div className="auth-tabs create-tabs">
        <button className={mode === "student" ? "active" : ""} onClick={() => setMode("student")}>Nuevo alumno</button>
        <button className={mode === "restaurant" ? "active" : ""} onClick={() => setMode("restaurant")}>Nuevo restaurante</button>
      </div>

      {feedback && <p className="success-box">{feedback}</p>}

      {mode === "student" ? (
        <form className="auth-form create-form" onSubmit={handleStudentSubmit}>
          <input value={studentForm.Name} onChange={(e) => setStudentForm((p) => ({ ...p, Name: e.target.value }))} placeholder="Nombre completo" required />
          <input type="email" value={studentForm.Email} onChange={(e) => setStudentForm((p) => ({ ...p, Email: e.target.value }))} placeholder="Correo" required />
          <input value={studentForm.Phone} onChange={(e) => setStudentForm((p) => ({ ...p, Phone: e.target.value }))} placeholder="Teléfono" required />
          <input value={studentForm.Curso} onChange={(e) => setStudentForm((p) => ({ ...p, Curso: e.target.value }))} placeholder="Curso" required />
          <input value={studentForm.Status} onChange={(e) => setStudentForm((p) => ({ ...p, Status: e.target.value }))} placeholder="Status" required />
          <input value={studentForm.PhotoURL} onChange={(e) => setStudentForm((p) => ({ ...p, PhotoURL: e.target.value }))} placeholder="URL de foto (opcional)" />
          <button type="submit" className="primary-btn">Guardar alumno</button>
        </form>
      ) : (
        <form className="auth-form create-form" onSubmit={handleRestaurantSubmit}>
          <input value={restaurantForm.Name} onChange={(e) => setRestaurantForm((p) => ({ ...p, Name: e.target.value }))} placeholder="Nombre del restaurante" required />
          <input value={restaurantForm.Address} onChange={(e) => setRestaurantForm((p) => ({ ...p, Address: e.target.value }))} placeholder="Dirección" required />
          <input type="email" value={restaurantForm.Email} onChange={(e) => setRestaurantForm((p) => ({ ...p, Email: e.target.value }))} placeholder="Correo" required />
          <input value={restaurantForm.Phone} onChange={(e) => setRestaurantForm((p) => ({ ...p, Phone: e.target.value }))} placeholder="Teléfono" required />
          <input value={restaurantForm.PhotoURL} onChange={(e) => setRestaurantForm((p) => ({ ...p, PhotoURL: e.target.value }))} placeholder="URL de foto (opcional)" />
          <div className="inline-fields">
            <input type="number" step="any" value={restaurantForm.lat} onChange={(e) => setRestaurantForm((p) => ({ ...p, lat: e.target.value }))} placeholder="Latitud" required />
            <input type="number" step="any" value={restaurantForm.lng} onChange={(e) => setRestaurantForm((p) => ({ ...p, lng: e.target.value }))} placeholder="Longitud" required />
          </div>
          <button type="submit" className="primary-btn">Guardar restaurante</button>
        </form>
      )}
    </section>
  );
}
