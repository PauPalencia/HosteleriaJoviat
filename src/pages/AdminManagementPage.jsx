import React from "react";

export default function AdminManagementPage({
  currentAdministrator,
  administrators,
  pendingStudents,
  approvedStudents,
  totalStudents,
  totalRestaurants,
  onNavigate
}) {
  return (
    <section className="panel">
      <h2>Administradores</h2>
      <p className="section-helper-text">
        Resumen rápido de la administración. Haz clic en cualquier recuadro para acceder a esa sección.
      </p>

      {/* Tarjetas de estadísticas — las clicables navegan a su sección */}
      <div className="card-grid admin-stats-grid">

        {/* Administrador actual (informativo, sin navegación) */}
        <article className="panel admin-stat-card">
          <strong>Administrador actual</strong>
          <p>{currentAdministrator?.Name || currentAdministrator?.Email || "Sin identificar"}</p>
        </article>

        {/* Solicitudes pendientes → va a la página de pendientes */}
        <button
          type="button"
          className="panel admin-stat-card admin-stat-card-btn"
          onClick={() => onNavigate("admin-pendientes")}
          title="Ver solicitudes pendientes"
        >
          <strong>Solicitudes pendientes</strong>
          <p className="admin-stat-number">{pendingStudents.length}</p>
          <span className="admin-stat-hint">Ver solicitudes →</span>
        </button>

        {/* Altas aprobadas → va a la página de aprobados */}
        <button
          type="button"
          className="panel admin-stat-card admin-stat-card-btn"
          onClick={() => onNavigate("admin-aprobados")}
          title="Ver solicitudes aprobadas"
        >
          <strong>Altas aprobadas</strong>
          <p className="admin-stat-number">{approvedStudents.length}</p>
          <span className="admin-stat-hint">Ver aprobados →</span>
        </button>

        {/* Total de alumnos → va al listado de alumnos */}
        <button
          type="button"
          className="panel admin-stat-card admin-stat-card-btn"
          onClick={() => onNavigate("alumnos")}
          title="Ir a alumnos"
        >
          <strong>Alumnos visibles</strong>
          <p className="admin-stat-number">{totalStudents}</p>
          <span className="admin-stat-hint">Ver alumnos →</span>
        </button>

        {/* Total de restaurantes → va al listado de restaurantes */}
        <button
          type="button"
          className="panel admin-stat-card admin-stat-card-btn"
          onClick={() => onNavigate("restaurantes")}
          title="Ir a restaurantes"
        >
          <strong>Restaurantes</strong>
          <p className="admin-stat-number">{totalRestaurants}</p>
          <span className="admin-stat-hint">Ver restaurantes →</span>
        </button>

      </div>

      {/* Lista de administradores registrados */}
      <h3>Administradores registrados</h3>
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
