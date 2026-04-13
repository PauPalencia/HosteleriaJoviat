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
      <div className="auth-header-block">
        <h2>{authMode === "login" ? "Iniciar sesión" : "Solicitar acceso"}</h2>
        <p className="auth-helper-text">
          {authMode === "login"
            ? "Accede con tu correo y contraseña."
            : "Déjanos tus datos y revisaremos tu solicitud lo antes posible."}
        </p>
      </div>

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
          No se han podido cargar las colecciones remotas. Puedes seguir entrando con cuentas guardadas en este navegador.
        </p>
      )}

      {authInfo && <p className="info-box">{authInfo}</p>}
      {authError && <p className="error-box">{authError}</p>}

      <form className="auth-form clean-auth-form" onSubmit={onSubmit}>
        {authMode === "register" && (
          <>
            <label className="auth-field">
              <span>Nombre completo</span>
              <input
                name="name"
                placeholder="Tu nombre y apellidos"
                value={authForm.name}
                onChange={onFieldChange}
                autoComplete="name"
              />
            </label>

            <div className="auth-form-grid compact-grid">
              <label className="auth-field">
                <span>Teléfono</span>
                <input
                  name="phone"
                  placeholder="600 000 000"
                  value={authForm.phone}
                  onChange={onFieldChange}
                  autoComplete="tel"
                />
              </label>
              <label className="auth-field">
                <span>Curso</span>
                <input
                  name="curso"
                  placeholder="Ej. Cocina 2"
                  value={authForm.curso}
                  onChange={onFieldChange}
                  autoComplete="organization-title"
                />
              </label>
            </div>
          </>
        )}

        <label className="auth-field">
          <span>Correo</span>
          <input
            name="email"
            type="email"
            placeholder="tuemail@joviat.cat"
            value={authForm.email}
            onChange={onFieldChange}
            autoComplete="email"
          />
        </label>

        <label className="auth-field">
          <span>Contraseña</span>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={authForm.password}
            onChange={onFieldChange}
            autoComplete={authMode === "login" ? "current-password" : "new-password"}
          />
        </label>

        {authMode === "register" && (
          <label className="auth-field">
            <span>Repite la contraseña</span>
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={authForm.confirmPassword}
              onChange={onFieldChange}
              autoComplete="new-password"
            />
          </label>
        )}

        <button type="submit" className="primary-btn auth-submit-btn" disabled={authLoading}>
          {authLoading ? "Procesando..." : authMode === "login" ? "Entrar" : "Enviar solicitud"}
        </button>
      </form>
    </section>
  );
}
