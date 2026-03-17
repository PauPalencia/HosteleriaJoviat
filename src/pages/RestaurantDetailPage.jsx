import React from "react";
import LeafletRestaurantMap from "../components/LeafletRestaurantMap";
import { getRestaurantPhoto } from "../utils/ui";

export default function RestaurantDetailPage({ restaurant, jobs, studentSummaryById, onBack, onOpenStudent }) {
  return (
    <section className="panel">
      <button className="small-btn" onClick={onBack}>← Volver a restaurantes</button>
      <div className="restaurant-detail-head">
        <img className="restaurant-cover" src={getRestaurantPhoto(restaurant)} alt={restaurant.Name} />
        <div>
          <h2>{restaurant.Name}</h2>
          <p>ID: {restaurant.id}</p>
        </div>
      </div>

      <div className="detail-map-wrap">
        <LeafletRestaurantMap restaurants={[restaurant]} forceCenter />
      </div>

      <h3>Alumnos que trabajan o han trabajado aquí</h3>
      <div className="spaced-list">
        {jobs.map((job, index) => {
          const summary = studentSummaryById[job.student?.id] || { alumniType: "Alumno" };
          return (
            <button
              key={`${restaurant.id}-${index}`}
              className="ref-card relation-ref-card"
              onClick={() => onOpenStudent(job.student?.id || null)}
              disabled={!job.student?.id}
            >
              <strong>{job.student?.Name || "Alumno no encontrado"}</strong>
              <div className="badge-row">
                <span className="badge badge-dark">{summary.alumniType}</span>
                <span className="badge badge-dark">Cargo: {job.role || "Sin rol"}</span>
                <span className={`badge ${job.currentJob ? "badge-green" : "badge-gray"}`}>
                  {job.currentJob ? "Trabajando actualmente" : "Trabajó antes"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
