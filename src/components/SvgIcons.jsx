import React from "react";

// Componente base para todos los iconos SVG (estilo línea blanca, sin relleno)
function Icon({ size = 20, className = "", strokeWidth = 1.5, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// 🏠 Inicio
export function HomeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </Icon>
  );
}

// 🎓 Alumnos (birrete de graduación)
export function StudentsIcon(props) {
  return (
    <Icon {...props}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </Icon>
  );
}

// 🍽️ Restaurantes (tenedor y cuchillo)
export function RestaurantsIcon(props) {
  return (
    <Icon {...props}>
      <line x1="18" y1="8" x2="18" y2="21" />
      <path d="M18 8a3 3 0 000-6M6 8C6 5.5 7 4 9 4s3 1.5 3 4M6 8v13M9 8v13" />
    </Icon>
  );
}

// 📋 Solicitudes pendientes (portapapeles)
export function ClipboardIcon(props) {
  return (
    <Icon {...props}>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </Icon>
  );
}

// ✅ Solicitudes aprobadas (círculo con check)
export function CheckCircleIcon(props) {
  return (
    <Icon {...props}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </Icon>
  );
}

// ➕ Crear alumno (persona con más)
export function UserPlusIcon(props) {
  return (
    <Icon {...props}>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </Icon>
  );
}

// 🏪 Crear restaurante (edificio/tienda)
export function StoreIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
      <line x1="3" y1="9" x2="21" y2="9" />
    </Icon>
  );
}

// ⚙️ Panel de administración (controles deslizantes)
export function SlidersIcon(props) {
  return (
    <Icon {...props}>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </Icon>
  );
}

// 🔑 Login (puerta con flecha hacia dentro)
export function LogInIcon(props) {
  return (
    <Icon {...props}>
      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
      <polyline points="10,17 15,12 10,7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </Icon>
  );
}

// 🚪 Logout (puerta con flecha hacia fuera)
export function LogOutIcon(props) {
  return (
    <Icon {...props}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </Icon>
  );
}

// 👤 Perfil de usuario
export function UserCircleIcon(props) {
  return (
    <Icon {...props}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Icon>
  );
}

// 🌐 Selector de idioma (globo)
export function GlobeIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </Icon>
  );
}

// 🔒 Candado (info restringida)
export function LockIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </Icon>
  );
}

// ← Flecha atrás
export function ArrowLeftIcon(props) {
  return (
    <Icon {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12,19 5,12 12,5" />
    </Icon>
  );
}

// 🗺️ Mapa (para botón de popup)
export function MapPinIcon(props) {
  return (
    <Icon {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </Icon>
  );
}
