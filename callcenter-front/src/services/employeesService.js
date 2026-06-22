// Service de agentes/empleados.
//
// ── Mapeo front ↔ back ───────────────────────────────────────────────────
// El backend maneja: { id (UUID), name, rank, is_available, created_at }
// El frontend además usa `is_active` (para mostrar si el agente está en
// servicio o de baja). El back NO tiene ese campo todavía, así que:
//   • Al leer      → todos los empleados que llegan del back se marcan
//                    is_active: true (el back no guarda baja permanente).
//   • toggleActive → usa PATCH /:id/availability con is_available: false
//                    como proxy de "inactivo" hasta que el back agregue
//                    el campo is_active propio.
//
// Cuando el back agregue is_active, solo ajusta toFrontend y toggleActive.
// ────────────────────────────────────────────────────────────────────────

import { apiClient } from "./apiClient";

// ── Adaptador back → front ───────────────────────────────────────────────
function toFrontend(emp) {
  return {
    id: emp.id,                         // UUID string
    name: emp.name,
    rank: emp.rank,
    is_available: emp.is_available ?? true,
    is_active: true,                    // el back no tiene este campo aún
    created_at: emp.created_at,
  };
}

// ── Endpoints ────────────────────────────────────────────────────────────

/**
 * GET /employees — lista todos los agentes.
 * @returns {Promise<object[]>}
 */
export async function getEmployees() {
  const data = await apiClient.get("/employees");
  return data.map(toFrontend);
}

/**
 * PATCH /employees/:id/availability — invierte is_available.
 * App.jsx llama con (employeeId) y ya actualizó el estado local;
 * aquí solo sincronizamos con el back.
 * @param {string} employeeId
 * @param {boolean} newValue - el nuevo valor que queremos persistir
 */
export async function toggleAvailability(employeeId, newValue) {
  return apiClient.patch(`/employees/${employeeId}/availability`, {
    is_available: newValue,
  });
}

/**
 * PATCH /employees/:id/availability — proxy de "activar/desactivar agente"
 * hasta que el back tenga su propio campo is_active.
 * @param {string} employeeId
 * @param {boolean} newActiveValue - el nuevo valor de is_active que queremos
 */
export async function toggleActive(employeeId, newActiveValue) {
  return apiClient.patch(`/employees/${employeeId}/availability`, {
    is_available: newActiveValue,
  });
}

/**
 * POST /employees — crea un nuevo agente.
 * @param {{ name: string, rank: number }} payload
 * @returns {Promise<object>} empleado creado con UUID del back
 */
export async function createEmployee({ name, rank }) {
  const data = await apiClient.post("/employees", {
    name,
    rank,
    is_available: true,
  });
  return toFrontend(data);
}

/**
 * PUT /employees/:id — actualiza nombre y/o rango.
 * @param {string} employeeId
 * @param {{ name?: string, rank?: number, is_available?: boolean }} updates
 * @returns {Promise<object>}
 */
export async function updateEmployee(employeeId, updates) {
  const data = await apiClient.put(`/employees/${employeeId}`, updates);
  return toFrontend(data);
}
