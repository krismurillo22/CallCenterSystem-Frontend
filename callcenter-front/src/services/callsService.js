// ─────────────────────────────────────────────────────────────────────────
// Service de llamadas. Esta es la ÚNICA capa que sabe de dónde vienen los
// datos (mock hoy, backend real después). Páginas y componentes nunca
// deberían importar mockData.js directamente: siempre pasan por aquí.
//
// Para conectar al backend real: descomenta las líneas con `apiClient` y
// borra/comenta la línea que devuelve el mock. La forma (shape) de los
// datos que espera el resto de la app no debería cambiar.
// ─────────────────────────────────────────────────────────────────────────

import { apiClient } from "./apiClient";

export async function getCalls() {
  return apiClient.get("/calls");
}

export async function createCall(data) {
  return apiClient.post("/calls", data);
}

export async function escalateCall(callId) {
  return apiClient.post(`/calls/${callId}/escalate`);
}

export async function finishCall(callId) {
  return apiClient.post(`/calls/${callId}/finish`);
}

export async function assignAgent(callId, employeeId) {
  return apiClient.post(`/calls/${callId}/assign`, { employee_id: employeeId });
}

export async function dispatchCall(callId, employeeId) {
  return apiClient.post(`/calls/${callId}/dispatch`, { employee_id: employeeId });
}