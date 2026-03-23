import React from "react";

export default function AdminPage({ pendingUsers, onApproveUser, onRejectUser }) {
  return (
    <section className="panel">
      <h2>Administración</h2>
      <p className="state-text">Gestiona los alumnos pendientes antes de permitir su acceso.</p>

      <div className="admin-grid">
        {pendingUsers.length === 0 ? (
          <div className="empty-card">No hay alumnos pendientes.</div>
        ) : (
          pendingUsers.map((student) => (
            <article key={student.id} className="admin-card">
              <h3>{student.name || student.Name || "Alumno pendiente"}</h3>
              <p><strong>Email:</strong> {student.email || student.Email || "-"}</p>
              <p><strong>Teléfono:</strong> {student.phone || student.Phone || "-"}</p>
              <p><strong>Curso:</strong> {student.curso || student.Curso || "-"}</p>
              <p><strong>Estado:</strong> Alumno pendiente</p>
              <div className="admin-card-actions">
                <button className="primary-btn" onClick={() => onApproveUser(student.id)}>Aceptar</button>
                <button className="small-btn danger-btn" onClick={() => onRejectUser(student.id)}>Rechazar</button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
