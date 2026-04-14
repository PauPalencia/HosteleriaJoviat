import React from "react";
import LeafletRestaurantMap from "../components/LeafletRestaurantMap";
import { getRestaurantPhoto, getStudentPhoto } from "../utils/ui";

export default function RestaurantDetailPage({ restaurant, jobs, studentSummaryById, onBack, backLabel, onOpenStudent }) {
  return (
    <section className="panel">
      {/* El botón de volver muestra un texto dinámico según de dónde venimos */}
      <button className="small-btn" onClick={onBack}>{backLabel || "← Volver a restaurantes"}</button>

      <div className="restaurant-detail-top">
        <div className="restaurant-detail-head">
          <img className="restaurant-cover" src={getRestaurantPhoto(restaurant)} alt={restaurant.Name} />
          <div className="detail-info-stack restaurant-detail-info">
            <h2>{restaurant.Name}</h2>
            <p><strong>ID:</strong> {restaurant.id}</p>
            <p><strong>Dirección:</strong> {restaurant.Address || "-"}</p>
            <p><strong>Email:</strong> {restaurant.Email || "-"}</p>
            <p><strong>Teléfono:</strong> {restaurant.Phone || "-"}</p>
          </div>
        </div>

        <div className="detail-map-wrap restaurant-top-map">
          <LeafletRestaurantMap restaurants={[restaurant]} forceCenter />
        </div>
      </div>

      <div className="restaurant-detail-body">
        <h3>Alumnos que trabajan o han trabajado aquí</h3>
        <div className="student-relations-grid">
          {jobs.map((job, index) => {
            const student = job.student;
            const summary = studentSummaryById[student?.id] || { alumniType: "Alumno" };
            return (
              <button
                key={`${restaurant.id}-${index}`}
                className="ref-card relation-ref-card student-info-card"
                onClick={() => onOpenStudent(student?.id || null)}
                disabled={!student?.id}
              >
                <img src={getStudentPhoto(student)} alt={student?.Name || "Alumno"} />
                <div>
                  <strong>{student?.Name || "Alumno no encontrado"}</strong>
                  <p><strong>Email:</strong> {student?.Email || "-"}</p>
                  <p><strong>Teléfono:</strong> {student?.Phone || "-"}</p>
                  <p><strong>LinkedIn:</strong> {student?.LinkedIn || "-"}</p>
                  <div className="badge-row">
                    <span className="badge badge-dark">{summary.alumniType}</span>
                    <span className="badge badge-dark">Cargo: {job.role || "Sin rol"}</span>
                    <span className={`badge ${job.currentJob ? "badge-green" : "badge-gray"}`}>
                      {job.currentJob ? "Trabajando actualmente" : "Trabajó antes"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
