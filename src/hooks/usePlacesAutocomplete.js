import { useEffect, useRef, useState } from "react";

/* Clave de la API de Google Maps leída del archivo .env */
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

/**
 * Carga el script de Google Maps + Places una sola vez en la página.
 * Usa una Promise global para evitar cargar el script dos veces si el
 * hook se monta en varios componentes.
 */
let googleMapsPromise = null;

function loadGoogleMapsScript() {
  /* Si ya existe window.google.maps.places, no hace falta cargar nada más */
  if (window.google?.maps?.places?.Autocomplete) {
    return Promise.resolve();
  }

  /* Reutilizar la Promise pendiente si ya existe */
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    /* Eliminar cualquier script anterior para evitar duplicados */
    const existing = document.getElementById("gmap-places-script");
    if (existing) {
      /* Si el script ya existe pero la librería no está lista,
       * probablemente aún está cargando → escuchar su evento */
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", () => {
        googleMapsPromise = null;
        reject(new Error("Script de Google Maps falló al cargar"));
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "gmap-places-script";
    /*
     * libraries=places → incluye el widget Autocomplete y PlacesService
     * callback=__gmapsReady → Google llamará a esta función cuando esté listo
     *   (más fiable que onload con la API moderna)
     */
    window.__gmapsReady = resolve;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=__gmapsReady`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error("No se pudo cargar Google Maps"));
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

/**
 * Hook para autocompletar restaurantes usando el widget nativo de Google Places.
 *
 * En lugar de usar AutocompleteService (que necesita un backend o JSONP),
 * usa el widget `google.maps.places.Autocomplete` adjunto directamente al
 * elemento <input> a través de un ref.
 *
 * Ventajas frente a AutocompleteService:
 *  - Mucho más fiable en localhost y en producción.
 *  - No hay problemas de CORS ni de callback.
 *  - El dropdown de Google aparece automáticamente (CSS del widget nativo).
 *
 * @param {React.RefObject} inputRef       - Ref del <input> al que adjuntar el widget
 * @param {Function}        onPlaceSelected - Callback con { name, address, phone, lat, lng, website }
 * @returns {{ ready, apiError }}
 */
export function usePlacesAutocomplete(inputRef, onPlaceSelected) {
  /* Indica si el widget ya está inicializado y listo para usar */
  const [ready, setReady] = useState(false);
  /* Mensaje de error si la API no puede cargarse */
  const [apiError, setApiError] = useState("");

  /* Referencia al widget para poder hacer cleanup al desmontar */
  const autocompleteRef = useRef(null);
  /* Referencia al callback para evitar closures obsoletos */
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  useEffect(() => { onPlaceSelectedRef.current = onPlaceSelected; }, [onPlaceSelected]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error("[Places] REACT_APP_GOOGLE_MAPS_API_KEY no definida en .env");
      setApiError("API key no encontrada");
      return;
    }

    if (!inputRef.current) {
      console.warn("[Places] inputRef no está disponible todavía");
      return;
    }

    loadGoogleMapsScript()
      .then(() => {
        /* Esperar a que el widget Autocomplete esté disponible */
        const tryInit = (attempts = 0) => {
          if (window.google?.maps?.places?.Autocomplete && inputRef.current) {
            /* Crear el widget adjunto al input */
            const autocomplete = new window.google.maps.places.Autocomplete(
              inputRef.current,
              {
                /* Campos que queremos recibir del lugar seleccionado */
                fields: [
                  "name",
                  "formatted_address",
                  "formatted_phone_number",
                  "geometry",
                  "website",
                  "rating",
                  "photos"
                ],
                /* Tipos de lugar: solo establecimientos (restaurantes, cafés, etc.) */
                types: ["establishment"]
              }
            );

            /* Escuchar cuando el usuario selecciona un lugar del dropdown */
            autocomplete.addListener("place_changed", () => {
              const place = autocomplete.getPlace();
              if (!place?.geometry) return; /* El usuario escribió algo que no es un lugar */

              onPlaceSelectedRef.current({
                name:    place.name                             || "",
                address: place.formatted_address                || "",
                phone:   place.formatted_phone_number           || "",
                website: place.website                          || "",
                lat:     place.geometry.location.lat().toString(),
                lng:     place.geometry.location.lng().toString()
              });
            });

            autocompleteRef.current = autocomplete;
            setReady(true);
            console.log("[Places] Widget Autocomplete listo ✓");
          } else if (attempts < 30) {
            /* Reintentar hasta 3 segundos esperando que el DOM y la API estén listos */
            setTimeout(() => tryInit(attempts + 1), 100);
          } else {
            console.error("[Places] No se pudo inicializar el widget Autocomplete");
            setApiError("No se pudo inicializar Google Places");
          }
        };
        tryInit();
      })
      .catch((err) => {
        console.error("[Places] Error al cargar el script:", err);
        setApiError("Error al cargar Google Maps");
        googleMapsPromise = null;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputRef]);

  return { ready, apiError };
}
