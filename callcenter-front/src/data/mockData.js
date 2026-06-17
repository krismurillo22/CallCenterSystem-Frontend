// ─────────────────────────────────────────────────────────────────────────
// Datos mock para desarrollar el frontend sin depender todavía del backend.
// Cuando el backend esté listo, estos datos dejan de usarse directamente:
// los services (ver src/services/) son los que deciden si devuelven esto
// o hacen un fetch real. No deberías importar este archivo desde páginas
// o componentes — solo desde los services.
// ─────────────────────────────────────────────────────────────────────────

/**
 * @typedef {1 | 2 | 3} Rank
 *
 * @typedef {"active" | "queue" | "escalated" | "finished"} CallStatus
 *
 * @typedef {Object} Employee
 * @property {string} id
 * @property {string} name
 * @property {Rank} rank
 * @property {boolean} is_available
 * @property {boolean} is_active
 * @property {string} created_at
 * @property {number} [active_call_id]
 *
 * @typedef {Object} Call
 * @property {number} id
 * @property {string} caller_name
 * @property {string} caller_phone
 * @property {Rank} rank_required
 * @property {CallStatus} status
 * @property {string} started_at
 * @property {string} [finished_at]
 * @property {string} [employee_id]
 * @property {number} escalations
 *
 * @typedef {Object} QueueEntry
 * @property {string} id
 * @property {number} call_id
 * @property {number} priority
 * @property {string} joined_at
 */

export const RANK_LABELS = {
  1: "Operador",
  2: "Supervisor",
  3: "Gerente",
};

export const RANK_SHORT = {
  1: "OP",
  2: "SUP",
  3: "GER",
};

// Todas las horas son relativas a "ahora" para que los timers nunca queden en negativo.
const ago = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

/** @type {Employee[]} */
export const employees = [
  { is_active: true, id: "e1",  name: "Carlos Mendoza",    rank: 1, is_available: false, created_at: ago(500), active_call_id: 101 },
  { is_active: true, id: "e2",  name: "Laura Jiménez",     rank: 1, is_available: true,  created_at: ago(480) },
  { is_active: true, id: "e3",  name: "Pedro Salinas",     rank: 1, is_available: false, created_at: ago(460), active_call_id: 103 },
  { is_active: true, id: "e4",  name: "Ana Torres",        rank: 1, is_available: true,  created_at: ago(440) },
  { is_active: true, id: "e5",  name: "Miguel Ríos",       rank: 1, is_available: false, created_at: ago(420), active_call_id: 105 },
  { is_active: true, id: "e6",  name: "Sofía Vargas",      rank: 1, is_available: true,  created_at: ago(400) },
  { is_active: true, id: "e7",  name: "Roberto Díaz",      rank: 2, is_available: false, created_at: ago(380), active_call_id: 102 },
  { is_active: true, id: "e8",  name: "Patricia Ruiz",     rank: 2, is_available: true,  created_at: ago(360) },
  { is_active: true, id: "e9",  name: "Fernando Castro",   rank: 2, is_available: false, created_at: ago(340), active_call_id: 104 },
  { is_active: true, id: "e10", name: "Claudia Mora",      rank: 3, is_available: true,  created_at: ago(320) },
  { is_active: true, id: "e11", name: "Héctor Palacios",   rank: 3, is_available: false, created_at: ago(300), active_call_id: 106 },
];

/** @type {Call[]} */
export const calls = [
  { id: 101, caller_name: "Juan Pérez",       caller_phone: "+52 55 1234 5678", rank_required: 1, status: "active",    started_at: ago(18), employee_id: "e1",  escalations: 0 },
  { id: 102, caller_name: "María González",   caller_phone: "+52 55 9876 5432", rank_required: 2, status: "active",    started_at: ago(31), employee_id: "e7",  escalations: 1 },
  { id: 103, caller_name: "Ernesto López",    caller_phone: "+52 33 4567 8901", rank_required: 1, status: "active",    started_at: ago(9),  employee_id: "e3",  escalations: 0 },
  { id: 104, caller_name: "Rosa Hernández",   caller_phone: "+52 81 3210 9876", rank_required: 2, status: "escalated", started_at: ago(47), employee_id: "e9",  escalations: 1 },
  { id: 105, caller_name: "Andrés Martínez",  caller_phone: "+52 55 2345 6789", rank_required: 1, status: "active",    started_at: ago(5),  employee_id: "e5",  escalations: 0 },
  { id: 106, caller_name: "Isabel Flores",    caller_phone: "+52 55 8765 4321", rank_required: 3, status: "escalated", started_at: ago(62), employee_id: "e11", escalations: 2 },
  { id: 107, caller_name: "Ricardo Santos",   caller_phone: "+52 33 6789 0123", rank_required: 1, status: "queue",     started_at: ago(3),  escalations: 0 },
  { id: 108, caller_name: "Carmen Vega",      caller_phone: "+52 81 7654 3210", rank_required: 2, status: "queue",     started_at: ago(2),  escalations: 1 },
  { id: 109, caller_name: "Luis Navarro",     caller_phone: "+52 55 3456 7890", rank_required: 1, status: "queue",     started_at: ago(1),  escalations: 0 },
  { id: 110, caller_name: "Elena Romero",     caller_phone: "+52 33 5678 9012", rank_required: 1, status: "finished",  started_at: ago(90), finished_at: ago(72), escalations: 0 },
  { id: 111, caller_name: "Oscar Mendez",     caller_phone: "+52 55 4321 8765", rank_required: 2, status: "finished",  started_at: ago(85), finished_at: ago(58), escalations: 1 },
  { id: 112, caller_name: "Patricia Leal",    caller_phone: "+52 81 9012 3456", rank_required: 1, status: "finished",  started_at: ago(75), finished_at: ago(60), escalations: 0 },
];

/** @type {QueueEntry[]} */
export const callQueue = [
  { id: "q1", call_id: 107, priority: 1, joined_at: ago(3) },
  { id: "q2", call_id: 108, priority: 2, joined_at: ago(2) },
  { id: "q3", call_id: 109, priority: 3, joined_at: ago(1) },
];

/**
 * Formatea el tiempo transcurrido entre dos fechas ISO como mm:ss.
 * @param {string} startedAt
 * @param {string} [endedAt]
 * @returns {string}
 */
export function getElapsed(startedAt, endedAt) {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const diff = Math.max(0, Math.floor((end - start) / 1000));
  const m = Math.floor(diff / 60).toString().padStart(2, "0");
  const s = (diff % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
