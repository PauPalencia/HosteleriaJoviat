import React from "react";

export default function AdminPage({ pendingUsers, onApproveUser, onRejectUser }) {
  return (
    <section className="panel">
      <h2>Administración</h2>
      <p className="state-text">Gestiona los registros pendientes antes de permitir el acceso a los usuarios.</p>

      <div className="admin-grid">
        {pendingUsers.length === 0 ? (
          <div className="empty-card">No hay registros pendientes.</div>
        ) : (
          pendingUsers.map((user) => (
            <article key={user.id} className="admin-card">
              <h3>{user.name || user.Name || "Usuario pendiente"}</h3>
              <p><strong>Email:</strong> {user.email || user.Email || "-"}</p>
              <p><strong>Teléfono:</strong> {user.phone || user.Phone || "-"}</p>
              <p><strong>Curso:</strong> {user.curso || user.Curso || "-"}</p>
              <p><strong>Rol solicitado:</strong> {user.role || "user"}</p>
              <div className="admin-card-actions">
                <button className="primary-btn" onClick={() => onApproveUser(user.id)}>Aceptar</button>
                <button className="small-btn danger-btn" onClick={() => onRejectUser(user.id)}>Rechazar</button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
