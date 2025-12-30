import api from "./api";

// =======================
// Signup
// =======================
export const signupUser = async (data) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};

// =======================
// Login
// =======================
export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

// =======================
// Logout (Backend + Token Invalidation)
// =======================
export const logoutUser = async () => {
  const token = localStorage.getItem("token");

  if (!token) return;

  const res = await api.post(
    "/auth/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};
