import api from "./api";

export const createDepartment = async (data) => {
  const res = await api.post("/admin/departments", data);
  return res.data;
};

export const getDepartments = async () => {
  const res = await api.get("/admin/departments");
  return res.data;
};

export const getStaffUsers = async () => {
  const res = await api.get("/admin/staff");
  return res.data;
};

export const assignStaffToDepartment = async (data) => {
  const res = await api.post("/admin/assign-staff", data);
  return res.data;
};
