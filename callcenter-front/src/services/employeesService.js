import { apiClient } from "./apiClient";

// Adapta el empleado del back al shape del front
function toFrontend(emp) {
  return {
    id: emp.id,
    name: emp.name,
    rank: emp.rank,
    is_available: emp.is_available ?? true,
    is_active: emp.is_active ?? true,   // ahora viene real del back
    created_at: emp.created_at,
  };
}

/** GET /employees */
export async function getEmployees() {
  const data = await apiClient.get("/employees");
  return data.map(toFrontend);
}

/** PATCH /employees/:id/availability */
export async function toggleAvailability(employeeId, newValue) {
  return apiClient.patch(`/employees/${employeeId}/availability`, {
    is_available: newValue,
  });
}

/** PATCH /employees/:id/active */
export async function toggleActive(employeeId, newActiveValue) {
  return apiClient.patch(`/employees/${employeeId}/active`, {
    is_active: newActiveValue,
  });
}

/** POST /employees */
export async function createEmployee({ name, rank }) {
  const data = await apiClient.post("/employees", {
    name,
    rank,
    is_available: true,
    is_active: true,
  });
  return toFrontend(data);
}

/** PUT /employees/:id */
export async function updateEmployee(employeeId, updates) {
  const data = await apiClient.put(`/employees/${employeeId}`, updates);
  return toFrontend(data);
}