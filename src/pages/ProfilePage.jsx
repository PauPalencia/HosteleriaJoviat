import React from "react";

export default function ProfilePage({ profile, isAuthenticated, onGoToAuth }) {
  if (!isAuthenticated) {
    return (
      <section className="panel">
        <div className="profile-logo">JOVIAT</div>
        <h2>Perfil</h2>
        <p>Necesitas iniciar sesión para ver datos personales.</p>
        <button type="button" className="primary-btn" onClick={onGoToAuth}>
          Ir a login / registro
        </button>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="profile-logo">JOVIAT</div>
      <h2>Perfil</h2>
      <div className="profile-card">
        <img src={profile.photo} alt={profile.name} />
        <div>
          <p><strong>Nombre:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Estado:</strong> {profile.role}</p>
          <p><strong>Curso:</strong> {profile.curso}</p>
          <p><strong>Teléfono:</strong> {profile.phone}</p>
        </div>
      </div>
    </section>
  );
}
