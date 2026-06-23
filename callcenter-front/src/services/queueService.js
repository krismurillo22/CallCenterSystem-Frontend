import { apiClient } from "./apiClient";

export async function getQueue() {
  return apiClient.get("/queue");
}

export async function dispatchQueue() {
  return apiClient.post("/queue/dispatch", {});
}

export async function enqueueCall({ call_id, priority = 1 }) {
  return apiClient.post("/queue/enqueue", {
    call_id,
    priority,
  });
}

export async function removeFromQueue(id) {
  return apiClient.delete(`/queue/${id}`);
}

export async function escalateQueueEntry(id) {
  return apiClient.post(`/queue/escalate/${id}`, {});
}