// ─────────────────────────────────────────────────────────────────────────
// Service de llamadas. Esta es la ÚNICA capa que sabe de dónde vienen los
// datos (mock hoy, backend real después). Páginas y componentes nunca
// deberían importar mockData.js directamente: siempre pasan por aquí.
//
// Para conectar al backend real: descomenta las líneas con `apiClient` y
// borra/comenta la línea que devuelve el mock. La forma (shape) de los
// datos que espera el resto de la app no debería cambiar.
// ─────────────────────────────────────────────────────────────────────────

import { calls as mockCalls } from "../data/mockData";
// import { apiClient } from "./apiClient";

const clone = (data) => JSON.parse(JSON.stringify(data));

/** @returns {Promise<import("../data/mockData").Call[]>} */
export async function getCalls() {
  // return apiClient.get("/calls");
  return clone(mockCalls);
}

/**
 * @param {{ caller_name: string, caller_phone: string, rank_required: import("../data/mockData").Rank }} data
 */
export async function createCall(data) {
  // return apiClient.post("/calls", data);
  return Promise.resolve({ ...data, id: Date.now(), escalations: 0 });
}

/** @param {number} callId */
export async function escalateCall(callId) {
  // return apiClient.post(`/calls/${callId}/escalate`);
  return Promise.resolve();
}

/** @param {number} callId */
export async function finishCall(callId) {
  // return apiClient.post(`/calls/${callId}/finish`);
  return Promise.resolve();
}

/**
 * @param {number} callId
 * @param {string} employeeId
 */
export async function assignAgent(callId, employeeId) {
  // return apiClient.post(`/calls/${callId}/assign`, { employee_id: employeeId });
  return Promise.resolve();
}

/**
 * @param {number} callId
 * @param {string} employeeId
 */
export async function dispatchCall(callId, employeeId) {
  // return apiClient.post(`/calls/${callId}/dispatch`, { employee_id: employeeId });
  return Promise.resolve();
}
