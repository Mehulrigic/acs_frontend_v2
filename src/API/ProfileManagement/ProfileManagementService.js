import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized request. Redirecting to login...");
      localStorage.clear(); // Clear localStorage on 401
      window.location.href = "/"; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

const ProfileManagementService = {
  update_profile: (userData) => apiClient.post("/profile/update-profile", userData),
  update_password: (userData) => apiClient.post("/profile/change-password", userData),
  update_theme_setting: (userData) => apiClient.post("/profile/update-theme-setting", userData),
  show_theme_setting: (userData) => apiClient.post("/profile/show-theme-setting", userData),
};

export default ProfileManagementService;