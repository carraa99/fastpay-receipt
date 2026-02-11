import axios from "axios";

// Create a new Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});


// Add a request interceptor
axiosInstance.interceptors.request.use(
  function (config) {
    // Get the token from your storage, e.g., localStorage
    const token = localStorage.getItem("accessToken");

    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default axiosInstance;
