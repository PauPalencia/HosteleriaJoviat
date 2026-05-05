import React from "react";
import { t } from "../utils/translations";

export default function AuthPage({
  authMode,
  setAuthMode,
  authForm,
  authError,
  authInfo,
  authLoading,
  onFieldChange,
  onSubmit,
  canUseRemoteAccounts,
  lang = "es"
}) {
  return (
    <section className="panel auth-panel">
      <div className="auth-header-block">
        <h2>{authMode === "login" ? t(lang, "auth_login_title") : t(lang, "auth_register_title")}</h2>
        <p className="auth-helper-text">
          {authMode === "login" ? t(lang, "auth_login_helper") : t(lang, "auth_register_helper")}
        </p>
      </div>

      <div className="auth-tabs" role="tablist" aria-label="Cambiar modo de autenticación">
        <button
          type="button"
          className={authMode === "login" ? "active" : ""}
          onClick={() => setAuthMode("login")}
        >
          {t(lang, "auth_tab_login")}
        </button>
        <button
          type="button"
          className={authMode === "register" ? "active" : ""}
          onClick={() => setAuthMode("register")}
        >
          {t(lang, "auth_tab_register")}
        </button>
      </div>

      {!canUseRemoteAccounts && (
        <p className="warning-box">{t(lang, "auth_offline_warning")}</p>
      )}

      {authInfo && <p className="info-box">{authInfo}</p>}
      {authError && <p className="error-box">{authError}</p>}

      <form className="auth-form clean-auth-form" onSubmit={onSubmit}>
        {authMode === "register" && (
          <>
            <label className="auth-field">
              <span>{t(lang, "auth_name")}</span>
              <input
                name="name"
                placeholder={t(lang, "auth_name_placeholder")}
                value={authForm.name}
                onChange={onFieldChange}
                autoComplete="name"
              />
            </label>

            <div className="auth-form-grid compact-grid">
              <label className="auth-field">
                <span>{t(lang, "auth_phone")}</span>
                <input
                  name="phone"
                  placeholder={t(lang, "auth_phone_placeholder")}
                  value={authForm.phone}
                  onChange={onFieldChange}
                  autoComplete="tel"
                />
              </label>
              <label className="auth-field">
                <span>{t(lang, "auth_curso")}</span>
                <input
                  name="curso"
                  placeholder={t(lang, "auth_curso_placeholder")}
                  value={authForm.curso}
                  onChange={onFieldChange}
                  autoComplete="organization-title"
                />
              </label>
            </div>
          </>
        )}

        <label className="auth-field">
          <span>{t(lang, "auth_email")}</span>
          <input
            name="email"
            type="email"
            placeholder={t(lang, "auth_email_placeholder")}
            value={authForm.email}
            onChange={onFieldChange}
            autoComplete="email"
          />
        </label>

        <label className="auth-field">
          <span>{t(lang, "auth_password")}</span>
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
            <span>{t(lang, "auth_confirm_password")}</span>
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
          {authLoading
            ? t(lang, "auth_loading")
            : authMode === "login"
              ? t(lang, "auth_submit_login")
              : t(lang, "auth_submit_register")}
        </button>
      </form>
    </section>
  );
}
