import React from "react";

export default function AuthPage({
  authMode,
  setAuthMode,
  authForm,
  authError,
  authInfo,
  authLoading,
  onFieldChange,
  onSubmit,
  canUseRemoteAccounts
}) {
  return (
    <section className="panel auth-panel">
      <h2>{authMode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
      <p className="auth-helper-text">
        El acceso usa tres perfiles normalizados: <strong>alumnos</strong>, <strong>pendingalumnos</strong> y
        <strong> administradores</strong>.
      </p>

      <div className="auth-tabs" role="tablist" aria-label="Cambiar modo de autenticación">
        <button
          type="button"
          className={authMode === "login" ? "active" : ""}
          onClick={() => setAuthMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={authMode === "register" ? "active" : ""}
          onClick={() => setAuthMode("register")}
        >
          Registro
        </button>
      </div>

      {!canUseRemoteAccounts && (
        <p className="warning-box">
          No se han podido precargar las colecciones remotas. Aun así puedes entrar con cuentas pendientes creadas en
          este navegador.
        </p>
      )}

      {authInfo && <p className="info-box">{authInfo}</p>}
      {authError && <p className="error-box">{authError}</p>}

      <form className="auth-form" onSubmit={onSubmit}>
        {authMode === "register" && (
          <>
            <input
              name="name"
              placeholder="Nombre completo"
              value={authForm.name}
              onChange={onFieldChange}
              autoComplete="name"
            />
            <div className="auth-form-grid">
              <input
                name="phone"
                placeholder="Teléfono"
                value={authForm.phone}
                onChange={onFieldChange}
                autoComplete="tel"
              />
              <input
                name="age"
                type="number"
                min="16"
                placeholder="Edad"
                value={authForm.age}
                onChange={onFieldChange}
              />
            </div>
            <input
              name="curso"
              placeholder="Curso"
              value={authForm.curso}
              onChange={onFieldChange}
              autoComplete="organization-title"
            />
          </>
        )}

        <input
          name="email"
          type="email"
          placeholder="Correo"
          value={authForm.email}
          onChange={onFieldChange}
          autoComplete="email"
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={authForm.password}
          onChange={onFieldChange}
          autoComplete={authMode === "login" ? "current-password" : "new-password"}
        />

        {authMode === "register" && (
          <>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Repite la contraseña"
              value={authForm.confirmPassword}
              onChange={onFieldChange}
              autoComplete="new-password"
            />
            <div className="auth-role-card">
              <strong>Rol al registrarte:</strong>
              <span>pendingalumnos</span>
            </div>
          </>
        )}

        <button type="submit" className="primary-btn" disabled={authLoading}>
          {authLoading ? "Procesando..." : authMode === "login" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>
    </section>
  );
}
