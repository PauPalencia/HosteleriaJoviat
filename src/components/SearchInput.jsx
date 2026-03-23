import React from "react";

export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="search-wrap">
      <input className="search-input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      {value && (
        <button className="search-clear-btn" onClick={() => onChange("")} aria-label="Limpiar búsqueda">
          ×
        </button>
      )}
    </div>
  );
}
