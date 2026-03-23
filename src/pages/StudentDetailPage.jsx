import React from "react";
import { getRestaurantPhoto, getStudentPhoto } from "../utils/ui";

export default function StudentDetailPage({ student, jobs, onBack, onOpenRestaurant }) {
  return (
    <section className="panel">
      <button className="small-btn" onClick={onBack}>← Volver a alumnos</button>

      <div className="detail-header student-detail-header">
        <img src={getStudentPhoto(student)} alt={student.Name} />
        <div className="detail-info-stack">
          <h2>{student.Name}</h2>
          <p><strong>ID:</strong> {student.id}</p>
          <p><strong>Status:</strong> {student.Status || student.status || "Sin status"}</p>
          <p><strong>Email:</strong> {student.Email || "-"}</p>
          <p><strong>Teléfono:</strong> {student.Phone || "-"}</p>
          <p><strong>LinkedIn:</strong> {student.LinkedIn || "-"}</p>
        </div>
      </div>

      <h3>Restaurantes en los que ha trabajado</h3>
      <div className="student-work-list">
        {jobs.map((job, index) => (
          <button
            key={`${student.id}-${index}`}
            className="ref-card restaurant-relation-card"
            onClick={() => onOpenRestaurant(job.restaurant?.id || null)}
            disabled={!job.restaurant?.id}
          >
            <img
              className="restaurant-relation-photo"
              src={getRestaurantPhoto(job.restaurant)}
              alt={job.restaurant?.Name || "Restaurante"}
            />
            <div className="restaurant-relation-body">
              <div className="restaurant-relation-title">
                <strong>{job.restaurant?.Name || "Restaurante no encontrado"}</strong>
                <span>ID: {job.restaurant?.id || "-"}</span>
              </div>
              <p><strong>Dirección:</strong> {job.restaurant?.Address || "-"}</p>
              <p><strong>Email:</strong> {job.restaurant?.Email || "-"}</p>
              <p><strong>Teléfono:</strong> {job.restaurant?.Phone || "-"}</p>
              <div className="badge-row">
                <span className="badge badge-dark">Cargo: {job.role || "Sin rol"}</span>
                <span className={`badge ${job.currentJob ? "badge-green" : "badge-gray"}`}>
                  {job.currentJob ? "Trabajando actualmente" : "Trabajó antes"}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
