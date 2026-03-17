import React from "react";

export default function AuthPage({ authMode, setAuthMode }) {
  return (
    <section className="panel">
      <h2>{authMode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
      <div className="auth-tabs">
        <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>Login</button>
        <button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>Registro</button>
      </div>
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        {authMode === "register" && (
          <>
            <input placeholder="Nombre completo" />
            <input placeholder="Teléfono" />
            <input type="number" placeholder="Edad" />
            <input placeholder="Curso (string básico)" />
          </>
        )}
        <input type="email" placeholder="Correo" />
        <input type="password" placeholder="Contraseña" />
        <button type="submit" className="primary-btn">{authMode === "login" ? "Entrar" : "Crear cuenta"}</button>
      </form>
    </section>
  );
}
