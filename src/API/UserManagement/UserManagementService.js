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

const UserManagementService = {
  user_list: (userData) => apiClient.post("/admin/user/index", userData),
  create_user: (userData) => apiClient.post("/admin/user/create", userData),
  show_user: (id) => apiClient.get(`/admin/user/show/${id}`),
  edit_user: (id, userData) => apiClient.post(`/admin/user/update/${id}`, userData),
  delete_user: (id) => apiClient.get(`/admin/user/destroy/${id}`),
  user_status_update: (id, userData) => apiClient.post(`/admin/user/update-status/${id}`, userData),
  insurer_list: () => apiClient.get(`/admin/user/insurer-list`),
  user_role_list: () => apiClient.get(`/admin/user/user-role-list`)
};

export default UserManagementService;