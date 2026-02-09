import api from "./api";

export const getDepartments = async () => {
  const res = await api.get("/student/departments");
  return res.data;
};

export const joinQueue = async (departmentId) => {
  const res = await api.post("/student/join-queue", { departmentId });
  return res.data;
};

export const getMyActiveTicket = async () => {
  const res = await api.get("/student/my-ticket");
  return res.data;
};

export const cancelQueue = async (departmentId) => {
  const res = await api.post("/student/cancel", { departmentId });
  return res.data;
};

export const getCrowdStatus = async (departmentId) => {
  const res = await api.get(
    `/queue/crowd-status?departmentId=${departmentId}`
  );
  return res.data;
};

export const getMyTicketHistory = async () => {
  const res = await api.get("/student/ticket-history");
  return res.data;
};

export const submitFeedback = async (payload) => {
  const res = await api.post("/student/feedback", payload);
  return res.data;
};


