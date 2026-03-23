import React from "react";

export default function AdminManagementPage({
  currentAdministrator,
  administrators,
  pendingStudents,
  approvedStudents,
  totalStudents,
  totalRestaurants
}) {
  return (
    <section className="panel">
      <h2>Administradores</h2>
      <p className="section-helper-text">
        Resumen rápido de la administración, accesos pendientes y responsables activos.
      </p>

      <div className="card-grid admin-stats-grid">
        <article className="panel admin-stat-card">
          <strong>Administrador actual</strong>
          <p>{currentAdministrator?.Name || currentAdministrator?.Email || "Sin identificar"}</p>
        </article>
        <article className="panel admin-stat-card">
          <strong>Solicitudes pendientes</strong>
          <p>{pendingStudents.length}</p>
        </article>
        <article className="panel admin-stat-card">
          <strong>Altas aprobadas localmente</strong>
          <p>{approvedStudents.length}</p>
        </article>
        <article className="panel admin-stat-card">
          <strong>Alumnos visibles</strong>
          <p>{totalStudents}</p>
        </article>
        <article className="panel admin-stat-card">
          <strong>Restaurantes</strong>
          <p>{totalRestaurants}</p>
        </article>
      </div>

      <div className="spaced-list">
        {administrators.map((administrator) => (
          <article key={administrator.id} className="admin-review-card compact-admin-card">
            <h3>{administrator.Name || administrator.Email || administrator.id}</h3>
            <p><strong>Email:</strong> {administrator.Email || "-"}</p>
            <p><strong>Teléfono:</strong> {administrator.Phone || "-"}</p>
            <p><strong>ID:</strong> {administrator.id}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
