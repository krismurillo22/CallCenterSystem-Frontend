// ─────────────────────────────────────────────────────────────────────────
// Cliente HTTP base. Hoy mismo no se usa todavía porque no hay backend
// corriendo, pero los services (callsService.js, employeesService.js, etc.)
// ya están escritos para llamarlo en cuanto el backend exista — solo hay
// que descomentar esas líneas dentro de cada service.
//
// Configuración: crea un archivo `.env` (no se sube a git) en la raíz de
// callcenter-front con:
//   VITE_API_URL=http://localhost:3000/api
// ─────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

/**
 * @param {string} path Ej: "/calls" o "/employees/e1"
 * @param {RequestInit} [options]
 */
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`[apiClient] ${options.method ?? "GET"} ${path} -> ${res.status}: ${message}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export default apiClient;
