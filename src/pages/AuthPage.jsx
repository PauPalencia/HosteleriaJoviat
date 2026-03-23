import React, { useState } from "react";

const INITIAL_FORM = {
  name: "",
  phone: "",
  curso: "",
  email: "",
  password: ""
};

export default function AuthPage({ authMode, setAuthMode, onLogin, onRegister, errorMessage, successMessage }) {
  const [form, setForm] = useState(INITIAL_FORM);

  async function handleSubmit(event) {
    event.preventDefault();
    if (authMode === "login") {
      await onLogin({ email: form.email.trim(), password: form.password });
      return;
    }

    await onRegister({
      name: form.name.trim(),
      phone: form.phone.trim(),
      curso: form.curso.trim(),
      email: form.email.trim(),
      password: form.password
    });
    setForm(INITIAL_FORM);
  }

  return (
    <section className="panel">
      <h2>{authMode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
      <div className="auth-tabs">
        <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>Login</button>
        <button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>Registro</button>
      </div>

      {errorMessage && <p className="error-box">{errorMessage}</p>}
      {successMessage && <p className="success-box">{successMessage}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        {authMode === "register" && (
          <>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nombre completo" required />
            <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Teléfono" required />
            <input value={form.curso} onChange={(e) => setForm((p) => ({ ...p, curso: e.target.value }))} placeholder="Curso" required />
          </>
        )}
        <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Correo" required />
        <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Contraseña" required />
        <button type="submit" className="primary-btn">{authMode === "login" ? "Entrar" : "Enviar registro"}</button>
      </form>
    </section>
  );
}
