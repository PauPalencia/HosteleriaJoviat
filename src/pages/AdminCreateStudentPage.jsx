import React, { useMemo, useState } from "react";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  curso: "",
  linkedIn: "",
  password: "",
  restaurantId: "",
  workRole: "",
  currentJob: true
};

export default function AdminCreateStudentPage({ restaurants, onCreateStudent, isSubmitting }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const sortedRestaurants = useMemo(
    () => [...restaurants].sort((left, right) => String(left.Name || "").localeCompare(String(right.Name || ""))),
    [restaurants]
  );

  return (
    <section className="panel">
      <h2>Crear alumnos validados</h2>
      <p className="section-helper-text">
        Crea un alumno ya validado y, si quieres, asígnale desde el inicio su relación con un restaurante.
      </p>
      <p className="section-helper-text">
        <strong>*</strong> obligatorio · <span className="optional-label">opcional</span>
      </p>

      <form
        className="auth-form clean-auth-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setFormError("");

          // Reglas mínimas pedidas: para crear validado solo exigimos email + contraseña.
          if (!form.email.trim() || !form.password.trim()) {
            setFormError("Debes indicar al menos correo y contraseña para crear el alumno validado.");
            return;
          }

          await onCreateStudent({
            Name: form.name.trim() || "Alumno validado",
            Email: form.email.trim().toLowerCase(),
            Phone: form.phone.trim(),
            Curso: form.curso.trim(),
            LinkedIn: form.linkedIn.trim(),
            Password: form.password.trim(),
            restaurantId: form.restaurantId,
            workRole: form.workRole.trim(),
            currentJob: form.currentJob
          });
          setForm(EMPTY_FORM);
        }}
      >
        {formError && <p className="error-box">{formError}</p>}

        <label className="auth-field">
          <span>Nombre completo <small className="optional-label">(opcional)</small></span>
          <input value={form.name} onChange={(event) => updateField(setForm, "name", event.target.value)} />
        </label>

        <div className="auth-form-grid compact-grid">
          <label className="auth-field">
            <span>Correo <strong>*</strong></span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField(setForm, "email", event.target.value)}
              required
            />
          </label>
          <label className="auth-field">
            <span>Teléfono <small className="optional-label">(opcional)</small></span>
            <input value={form.phone} onChange={(event) => updateField(setForm, "phone", event.target.value)} />
          </label>
        </div>

        <div className="auth-form-grid compact-grid">
          <label className="auth-field">
            <span>Curso <small className="optional-label">(opcional)</small></span>
            <input value={form.curso} onChange={(event) => updateField(setForm, "curso", event.target.value)} />
          </label>
          <label className="auth-field">
            <span>Contraseña inicial <strong>*</strong></span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField(setForm, "password", event.target.value)}
              required
            />
          </label>
        </div>

        <label className="auth-field">
          <span>LinkedIn <small className="optional-label">(opcional)</small></span>
          <input value={form.linkedIn} onChange={(event) => updateField(setForm, "linkedIn", event.target.value)} />
        </label>

        <h3 className="admin-subtitle">Asignación opcional a restaurante</h3>

        <label className="auth-field">
          <span>Restaurante <small className="optional-label">(opcional)</small></span>
          <select value={form.restaurantId} onChange={(event) => updateField(setForm, "restaurantId", event.target.value)}>
            <option value="">Sin asignar todavía</option>
            {sortedRestaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>{restaurant.Name}</option>
            ))}
          </select>
        </label>

        <div className="auth-form-grid compact-grid">
          <label className="auth-field">
            <span>Cargo <small className="optional-label">(opcional)</small></span>
            <input value={form.workRole} onChange={(event) => updateField(setForm, "workRole", event.target.value)} placeholder="Chef, sala, prácticas..." />
          </label>
          <label className="admin-checkbox-field">
            <input
              type="checkbox"
              checked={form.currentJob}
              onChange={(event) => updateField(setForm, "currentJob", event.target.checked)}
            />
            <span>Está trabajando actualmente ahí</span>
          </label>
        </div>

        <button type="submit" className="primary-btn auth-submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear alumno validado"}
        </button>
      </form>
    </section>
  );
}

function updateField(setForm, key, value) {
  setForm((current) => ({ ...current, [key]: value }));
}
