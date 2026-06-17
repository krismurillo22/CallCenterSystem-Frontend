// Service de la cola de espera. Mismo patrón que los demás services.

import { callQueue as mockQueue } from "../data/mockData";
// import { apiClient } from "./apiClient";

const clone = (data) => JSON.parse(JSON.stringify(data));

/** @returns {Promise<import("../data/mockData").QueueEntry[]>} */
export async function getQueue() {
  // return apiClient.get("/queue");
  return clone(mockQueue);
}
