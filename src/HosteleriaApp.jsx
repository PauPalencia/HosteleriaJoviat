import React, { useState } from "react";

export default function HosteleriaApp() {
  const [isOpen, setIsOpen] = useState(true);
  const [section, setSection] = useState("Inicio");

  const renderContent = () => {
    switch (section) {
      case "Alumnos":
        return (
          <div style={gridStyle}>
            <div style={cardStyle}>
              <h2>Listado de Alumnos</h2>
              <ul>
                <li>Juan Pérez - 2º Cocina</li>
                <li>Marta López - 1º Sala</li>
                <li>David Ruiz - 2º Pastelería</li>
              </ul>
            </div>

            <div style={cardStyle}>
              <h2>Añadir Alumno</h2>
              <input style={inputStyle} placeholder="Nombre completo" />
              <input style={inputStyle} placeholder="Curso" />
              <button style={buttonStyle}>Guardar</button>
            </div>
          </div>
        );

      case "Hostelerías":
        return (
          <div style={gridStyle}>
            <div style={cardStyle}>
              <h2>Empresas Registradas</h2>
              <ul>
                <li>Restaurante La Plaza</li>
                <li>Hotel Costa Azul</li>
                <li>Pastelería Dulce Vida</li>
              </ul>
            </div>

            <div style={cardStyle}>
              <h2>Añadir Empresa</h2>
              <input style={inputStyle} placeholder="Nombre empresa" />
              <input style={inputStyle} placeholder="Tipo" />
              <button style={buttonStyle}>Guardar</button>
            </div>
          </div>
        );

      case "Prácticas":
        return (
          <div style={cardStyle}>
            <h2>Asignación de Prácticas</h2>
            <table style={{ width: "100%", marginTop: "10px" }}>
              <thead>
                <tr>
                  <th align="left">Alumno</th>
                  <th align="left">Empresa</th>
                  <th align="left">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Juan Pérez</td>
                  <td>Hotel Costa Azul</td>
                  <td>En curso</td>
                </tr>
                <tr>
                  <td>Marta López</td>
                  <td>Restaurante La Plaza</td>
                  <td>Finalizado</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div>
            <h1>Panel de Gestión</h1>
            <p>
              Administra alumnos, empresas de hostelería y asignaciones de prácticas desde un único lugar.
            </p>
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial" }}>
      {/* Sidebar */}
      <div
        style={{
          width: isOpen ? "220px" : "60px",
          backgroundColor: "black",
          color: "white",
          transition: "0.3s",
          paddingTop: "20px"
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            marginLeft: "10px",
            marginBottom: "20px"
          }}
        >
          ☰
        </button>

        {["Inicio", "Alumnos", "Hostelerías", "Prácticas"].map((item) => (
          <div
            key={item}
            onClick={() => setSection(item)}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              backgroundColor: section === item ? "#333" : "transparent"
            }}
          >
            {isOpen ? item : item.charAt(0)}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1 }}>
        <header
          style={{
            backgroundColor: "black",
            color: "white",
            padding: "15px"
          }}
        >
          <h2>Sistema de Gestión de Hostelería</h2>
        </header>

        <main style={{ padding: "30px" }}>{renderContent()}</main>
      </div>
    </div>
  );
}

// Estilos simples
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px"
};

const cardStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)"
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "8px",
  marginBottom: "10px"
};

const buttonStyle = {
  padding: "10px",
  width: "100%",
  cursor: "pointer"
};