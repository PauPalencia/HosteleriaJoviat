import React from "react";
import { t } from "../utils/translations";

export default function AdminManagementPage({
  currentAdministrator,
  administrators,
  pendingStudents,
  approvedStudents,
  totalStudents,
  totalRestaurants,
  onNavigate,
  lang = "es"
}) {
  return (
    <section className="panel">
      <h2>{t(lang, "mgmt_title")}</h2>
      <p className="section-helper-text">{t(lang, "mgmt_helper")}</p>

      {/* Tarjetas de estadísticas — las clicables navegan a su sección */}
      <div className="card-grid admin-stats-grid">

        {/* Administrador actual (informativo, sin navegación) */}
        <article className="panel admin-stat-card">
          <strong>{t(lang, "mgmt_current_admin")}</strong>
          <p>{currentAdministrator?.Name || currentAdministrator?.Email || t(lang, "mgmt_unknown_admin")}</p>
        </article>

        {/* Solicitudes pendientes → va a la página de pendientes */}
        <button
          type="button"
          className="panel admin-stat-card admin-stat-card-btn"
          onClick={() => onNavigate("admin-pendientes")}
          title={t(lang, "mgmt_pending_card")}
        >
          <strong>{t(lang, "mgmt_pending_card")}</strong>
          <p className="admin-stat-number">{pendingStudents.length}</p>
          <span className="admin-stat-hint">{t(lang, "mgmt_see_requests")}</span>
        </button>

        {/* Altas aprobadas → va a la página de aprobados */}
        <button
          type="button"
          className="panel admin-stat-card admin-stat-card-btn"
          onClick={() => onNavigate("admin-aprobados")}
          title={t(lang, "mgmt_approved_card")}
        >
          <strong>{t(lang, "mgmt_approved_card")}</strong>
          <p className="admin-stat-number">{approvedStudents.length}</p>
          <span className="admin-stat-hint">{t(lang, "mgmt_see_approved")}</span>
        </button>

        {/* Total de alumnos → va al listado de alumnos */}
        <button
          type="button"
          className="panel admin-stat-card admin-stat-card-btn"
          onClick={() => onNavigate("alumnos")}
          title={t(lang, "mgmt_students_card")}
        >
          <strong>{t(lang, "mgmt_students_card")}</strong>
          <p className="admin-stat-number">{totalStudents}</p>
          <span className="admin-stat-hint">{t(lang, "mgmt_see_students")}</span>
        </button>

        {/* Total de restaurantes → va al listado de restaurantes */}
        <button
          type="button"
          className="panel admin-stat-card admin-stat-card-btn"
          onClick={() => onNavigate("restaurantes")}
          title={t(lang, "mgmt_restaurants_card")}
        >
          <strong>{t(lang, "mgmt_restaurants_card")}</strong>
          <p className="admin-stat-number">{totalRestaurants}</p>
          <span className="admin-stat-hint">{t(lang, "mgmt_see_restaurants")}</span>
        </button>

      </div>

      {/* Lista de administradores registrados */}
      <h3>{t(lang, "mgmt_admins_title")}</h3>
      <div className="spaced-list">
        {administrators.map((administrator) => (
          <article key={administrator.id} className="admin-review-card compact-admin-card">
            <h3>{administrator.Name || administrator.Email || administrator.id}</h3>
            <p><strong>{t(lang, "field_email")}:</strong> {administrator.Email || "-"}</p>
            <p><strong>{t(lang, "field_phone")}:</strong> {administrator.Phone || "-"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
