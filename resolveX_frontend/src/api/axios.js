import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/auth/", 
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {

    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refresh = sessionStorage.getItem("refresh");

        const res = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          { refresh }
        );

        const newAccess = res.data.access;

        sessionStorage.setItem("access", newAccess);

        API.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;


        return API(originalRequest);

      } catch (err) {

        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");

        window.location.href = "/login";

      }
    }

    return Promise.reject(error);
  }
);

export default API;