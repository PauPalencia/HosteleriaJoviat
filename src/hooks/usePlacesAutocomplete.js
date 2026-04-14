import { useEffect, useRef, useState, useCallback } from "react";

// Clave de la API de Google Maps leída del archivo .env
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Carga el script de Google Maps una sola vez aunque el hook se monte varias veces
function loadGoogleMapsScript() {
  if (window.google?.maps?.places) return Promise.resolve();

  const existingScript = document.getElementById("google-maps-places-script");
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", resolve);
      existingScript.addEventListener("error", reject);
    });
  }

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
 * Hook para autocompletar lugares usando la API de Google Places.
 *
 * En vez de usar el widget nativo (Autocomplete), usa AutocompleteService
 * para obtener predicciones mientras el usuario escribe, y PlacesService
 * para obtener los detalles del lugar seleccionado. Esto nos da control
 * total sobre el UI (dropdown personalizado, estilos, etc.).
 *
 * @param {Function} onPlaceSelected - Callback con { name, address, phone, lat, lng }
 * @returns {{ query, predictions, loading, ready, handleSearch, selectPrediction, clearPredictions }}
 */
export function usePlacesAutocomplete(onPlaceSelected) {
  // Texto actual del input de búsqueda
  const [query, setQuery] = useState("");
  // Lista de predicciones devueltas por Google
  const [predictions, setPredictions] = useState([]);
  // Indica si hay una petición en vuelo
  const [loading, setLoading] = useState(false);
  // Indica si la API de Google ya está lista para usar
  const [ready, setReady] = useState(false);

  // Referencias a los servicios de Google (no cambian entre renders)
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  // Token de sesión: agrupa búsqueda + selección en una sola sesión para la facturación
  const sessionTokenRef = useRef(null);
  // Referencia al temporizador del debounce
  const debounceRef = useRef(null);

  // Cargar el script de Google Maps al montar el hook
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("REACT_APP_GOOGLE_MAPS_API_KEY no está definida en .env");
      return;
    }

    loadGoogleMapsScript()
      .then(() => {
        // Inicializar AutocompleteService (para las predicciones de texto)
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();

        // PlacesService necesita un elemento DOM (no lo mostramos, es solo un ancla)
        const dummyDiv = document.createElement("div");
        placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDiv);

        // Crear token de sesión inicial
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();

        setReady(true);
      })
      .catch((err) => {
        console.error("Error al cargar Google Maps Places:", err);
      });
  }, []);

  /**
   * Llamar cada vez que el usuario escribe en el input.
   * Hace debounce de 300ms antes de llamar a la API para no sobrecargarla.
   */
  const handleSearch = useCallback((value) => {
    setQuery(value);

    // Cancelar la petición anterior si el usuario sigue escribiendo
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim() || !ready || !autocompleteServiceRef.current) {
      setPredictions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(() => {
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: value,
          types: ["establishment"], // solo negocios
          sessionToken: sessionTokenRef.current
        },
        (results, status) => {
          setLoading(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
          } else {
            setPredictions([]);
          }
        }
      );
    }, 300);
  }, [ready]);

  /**
   * Llamar cuando el usuario hace clic en una predicción del dropdown.
   * Obtiene los detalles completos del lugar y llama a onPlaceSelected.
   */
  const selectPrediction = useCallback((prediction) => {
    if (!placesServiceRef.current) return;

    // Limpiar el dropdown de inmediato (UX responsiva)
    setPredictions([]);
    setQuery(prediction.structured_formatting?.main_text || prediction.description);

    placesServiceRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ["name", "formatted_address", "formatted_phone_number", "geometry"],
        sessionToken: sessionTokenRef.current
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          onPlaceSelected({
            name: place.name || "",
            address: place.formatted_address || "",
            phone: place.formatted_phone_number || "",
            lat: place.geometry?.location.lat().toString() || "",
            lng: place.geometry?.location.lng().toString() || ""
          });
        }

        // Renovar el token de sesión tras cada selección (buena práctica de facturación)
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
      }
    );
  }, [onPlaceSelected]);

  // Limpiar el dropdown (p. ej. al hacer clic fuera)
  const clearPredictions = useCallback(() => {
    setPredictions([]);
  }, []);

  // Limpiar el debounce al desmontar para evitar memory leaks
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { query, predictions, loading, ready, handleSearch, selectPrediction, clearPredictions };
}
