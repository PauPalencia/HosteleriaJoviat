import React from "react";
import LeafletRestaurantMap from "../components/LeafletRestaurantMap";
import { getRestaurantPhoto, getStudentPhoto } from "../utils/ui";
import { t } from "../utils/translations";

export default function RestaurantDetailPage({ restaurant, jobs, studentSummaryById, onBack, backLabel, onOpenStudent, lang = "es" }) {
  return (
    <section className="panel">
      {/* El botón de volver muestra un texto dinámico según de dónde venimos */}
      <button className="small-btn" onClick={onBack}>{backLabel || t(lang, "detail_back")}</button>

      <div className="restaurant-detail-top">
        <div className="restaurant-detail-head">
          <img className="restaurant-cover" src={getRestaurantPhoto(restaurant)} alt={restaurant.Name} />
          <div className="detail-info-stack restaurant-detail-info">
            <h2>{restaurant.Name}</h2>
            <p><strong>ID:</strong> {restaurant.id}</p>
            <p><strong>{t(lang, "rest_field_address")}:</strong> {restaurant.Address || "-"}</p>
            <p><strong>{t(lang, "field_email")}:</strong> {restaurant.Email || "-"}</p>
            <p><strong>{t(lang, "field_phone")}:</strong> {restaurant.Phone || "-"}</p>
          </div>
        </div>

        <div className="detail-map-wrap restaurant-top-map">
          <LeafletRestaurantMap restaurants={[restaurant]} forceCenter />
        </div>
      </div>

      <div className="restaurant-detail-body">
        <h3>{t(lang, "rest_workers_title")}</h3>

        {/* Mensaje cuando no hay alumnos asociados */}
        {jobs.length === 0 && (
          <p className="state-text">{t(lang, "rest_no_workers")}</p>
        )}

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
                  <p><strong>{t(lang, "detail_email")}:</strong> {student?.Email || "-"}</p>
                  <p><strong>{t(lang, "detail_phone")}:</strong> {student?.Phone || "-"}</p>
                  <p><strong>LinkedIn:</strong> {student?.LinkedIn || "-"}</p>
                  <div className="badge-row">
                    <span className="badge badge-dark">{summary.alumniType}</span>
                    <span className="badge badge-dark">{t(lang, "role_label")}: {job.role || "-"}</span>
                    <span className={`badge ${job.currentJob ? "badge-green" : "badge-gray"}`}>
                      {job.currentJob ? t(lang, "working_now") : t(lang, "worked_before")}
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
