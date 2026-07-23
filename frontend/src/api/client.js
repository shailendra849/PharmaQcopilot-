import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const client = axios.create({ baseURL: BASE_URL });

export const api = {
  createSession: () => client.post("/api/sessions").then((r) => r.data),

  getSession: (sessionId) =>
    client.get(`/api/sessions/${sessionId}`).then((r) => r.data),

  sendMessage: (sessionId, text) =>
    client
      .post(`/api/sessions/${sessionId}/message`, { text })
      .then((r) => r.data),

  uploadDocument: (sessionId, file) => {
    const form = new FormData();
    form.append("file", file);
    return client
      .post(`/api/sessions/${sessionId}/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  commitSession: (sessionId, overrides) =>
    client
      .post(`/api/sessions/${sessionId}/commit`, overrides || {})
      .then((r) => r.data),

  listComplaints: () => client.get("/api/complaints").then((r) => r.data),
};

export default api;
