import React from "react";

export default function StudentDetailPage({ student, jobs, onBack, onOpenRestaurant }) {
  return (
    <section className="panel">
      <button className="small-btn" onClick={onBack}>← Volver a alumnos</button>
      <div className="detail-header">
        <img src={student.PhotoURL || "/logo192.png"} alt={student.Name} />
        <div>
          <h2>{student.Name}</h2>
          <p>ID: {student.id}</p>
        </div>
      </div>

      <h3>Restaurantes en los que ha trabajado</h3>
      <div className="student-work-list">
        {jobs.map((job, index) => (
          <button
            key={`${student.id}-${index}`}
            className="work-preview ref-card"
            onClick={() => onOpenRestaurant(job.restaurant?.id || null)}
            disabled={!job.restaurant?.id}
          >
            <div className="work-header-inline">
              <strong>{job.restaurant?.Name || "Restaurante no encontrado"}</strong>
              <span>ID: {job.restaurant?.id || "-"}</span>
            </div>
            <div className="work-preview-map readonly-map">
              {job.restaurant?.Location ? (
                <iframe
                  title={`Mapa de ${job.restaurant?.Name || "restaurante"}`}
                  loading="lazy"
                  src={buildEmbedMapUrl(job.restaurant.Location.lat, job.restaurant.Location.lng)}
                />
              ) : (
                <div className="map-fallback">Sin coordenadas</div>
              )}
            </div>
            <div className="work-preview-info">
              <span className="badge badge-dark">Cargo: {job.role || "Sin rol"}</span>
              <span className={`badge ${job.currentJob ? "badge-green" : "badge-gray"}`}>
                {job.currentJob ? "Trabajando actualmente" : "Trabajó antes"}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function buildEmbedMapUrl(lat, lng) {
  const delta = 0.01;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}
