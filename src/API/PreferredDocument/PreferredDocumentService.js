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

const PreferredDocumentService = {
  preferred_document_list: (userData) => apiClient.post("/admin/preferred_document/index", userData),
  create_preferred_document: (userData) => apiClient.post("/admin/preferred_document/create", userData),
  show_preferred_document: (id) => apiClient.get(`/admin/preferred_document/show/${id}`),
  edit_preferred_document: (id, userData) => apiClient.post(`/admin/preferred_document/update/${id}`, userData),
  delete_preferred_document: (id) => apiClient.get(`/admin/preferred_document/destroy/${id}`),
  preferred_document_status_update: (id, userData) => apiClient.post(`/admin/preferred_document/update-status/${id}`, userData),
};

export default PreferredDocumentService;