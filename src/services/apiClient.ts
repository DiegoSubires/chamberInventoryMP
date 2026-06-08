// src/services/apiClient.ts

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiClient = async (endpoint: string, options: any = {}) => {
  const token = localStorage.getItem("tracesync_token");

  const headers = {
    "Content-Type": "application/json",
    "bypass-tunnel-reminder": "true",
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // Quitamos barras duplicadas si el endpoint ya empieza por /
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  /*const baseUrl =
    import.meta.env.VITE_API_URL || "https://tracesync-backend-dev.loca.lt";*/

  //const baseUrl = "https://tracesync-backend.onrender.com";

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}${cleanEndpoint}`,
    {
      ...options,
      headers,
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Error en la petición: ${response.status}`,
    );
  }

  // Retornamos directamente el JSON resuelto para evitar la duplicación de .json()
  return response.json();
};
