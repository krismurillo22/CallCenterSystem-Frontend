// Service de agentes/empleados. Mismo patrón que callsService.js: hoy
// devuelve mock, mañana llama al backend real vía apiClient.

import { employees as mockEmployees } from "../data/mockData";
// import { apiClient } from "./apiClient";

const clone = (data) => JSON.parse(JSON.stringify(data));

/** @returns {Promise<import("../data/mockData").Employee[]>} */
export async function getEmployees() {
  // return apiClient.get("/employees");
  return clone(mockEmployees);
}

/** @param {string} employeeId */
export async function toggleAvailability(employeeId) {
  // return apiClient.patch(`/employees/${employeeId}`, { toggle: "is_available" });
  return Promise.resolve();
}

/** @param {string} employeeId */
export async function toggleActive(employeeId) {
  // return apiClient.patch(`/employees/${employeeId}`, { toggle: "is_active" });
  return Promise.resolve();
}

/** @param {{ name: string, rank: import("../data/mockData").Rank }} data */
export async function createEmployee(data) {
  // return apiClient.post("/employees", data);
  return Promise.resolve({ ...data, id: `emp-${Date.now()}`, is_available: true, is_active: true });
}

/**
 * @param {string} employeeId
 * @param {{ name: string, rank: import("../data/mockData").Rank }} data
 */
export async function updateEmployee(employeeId, data) {
  // return apiClient.patch(`/employees/${employeeId}`, data);
  return Promise.resolve();
}
