import { useEffect, useRef } from "react";

// Clave de la API de Google Maps (se lee del archivo .env)
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Carga el script de Google Maps una sola vez (evita cargas duplicadas)
function loadGoogleMapsScript() {
  // Si ya está cargado, no hacer nada
  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  // Si el script ya existe en el DOM (está cargando), esperar a que termine
  const existingScript = document.getElementById("google-maps-places-script");
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", resolve);
      existingScript.addEventListener("error", reject);
    });
  }

  // Crear e insertar el script de Google Maps con la librería places
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "google-maps-places-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Hook que conecta un input de texto con Google Places Autocomplete.
 *
 * @param {React.RefObject} inputRef - Ref del elemento <input> donde se escribe la búsqueda
 * @param {Function} onPlaceSelected - Callback llamado con { name, address, phone, lat, lng }
 *                                     cuando el usuario selecciona un lugar de la lista
 */
export function usePlacesAutocomplete(inputRef, onPlaceSelected) {
  // Guardamos la referencia del autocomplete para poder limpiarla al desmontar
  const autocompleteRef = useRef(null);

  useEffect(() => {
    // Si no hay API key o el input no está montado, no inicializar
    if (!GOOGLE_MAPS_API_KEY || !inputRef.current) return;

    let cancelled = false;

    loadGoogleMapsScript()
      .then(() => {
        if (cancelled || !inputRef.current) return;

        // Inicializar el autocomplete sobre el input recibido
        // types: "establishment" para que sugiera negocios (restaurantes, hoteles, etc.)
        // fields: solo pedimos los campos que necesitamos para no sobrecargar la API
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ["establishment"],
          fields: ["name", "formatted_address", "formatted_phone_number", "geometry"]
        });

        autocompleteRef.current = autocomplete;

        // Cuando el usuario selecciona un lugar de la lista desplegable
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place || !place.geometry) return;

          // Extraer y pasar los datos del lugar al formulario padre
          onPlaceSelected({
            name: place.name || "",
            address: place.formatted_address || "",
            phone: place.formatted_phone_number || "",
            lat: place.geometry.location.lat().toString(),
            lng: place.geometry.location.lng().toString()
          });
        });
      })
      .catch((err) => {
        console.error("Error al cargar Google Maps:", err);
      });

    return () => {
      cancelled = true;
      // Limpiar el listener al desmontar el componente
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
