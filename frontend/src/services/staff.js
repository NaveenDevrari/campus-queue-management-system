import api from "./api";

/* =========================
   STAFF PROFILE
========================= */
export const getStaffProfile = async () => {
  const res = await api.get("/staff/me");
  return res.data;
};

/* =========================
   CALL NEXT TICKET
========================= */
export const callNextTicket = async () => {
  const res = await api.post("/staff/call-next");
  return res.data;
};

/* =========================
   COMPLETE TICKET
========================= */
export const completeTicket = async () => {
  const res = await api.post("/staff/complete");
  return res.data;
};


/* =========================
   TOGGLE QUEUE OPEN/CLOSE
========================= */
export const toggleQueue = async () => {
  const res = await api.post("/staff/toggle-queue");
  return res.data;
};

/* =========================
   SET QUEUE LIMIT
========================= */
export const setQueueLimit = async (maxTickets) => {
  const res = await api.post("/staff/set-limit", {
    maxTickets,
  });
  return res.data;
};

export const increaseQueueLimit = async (increaseBy) => {
  const res = await api.post("/staff/increase-limit", {
    increaseBy,
  });
  return res.data;
};

export const getQueueStats = async () => {
  const res = await api.get("/staff/queue-stats");
  return res.data;
};

export const getPendingEmergencies = async () => {
  const res = await api.get("/staff/emergencies");
  return res.data;
};
