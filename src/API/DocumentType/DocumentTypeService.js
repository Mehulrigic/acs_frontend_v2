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

const DocumentTypeService = {
  document_type_list: (userData) => apiClient.post("/admin/document_type/index", userData),
  create_document_type: (userData) => apiClient.post("/admin/document_type/create", userData),
  show_document_type: (id) => apiClient.get(`/admin/document_type/show/${id}`),
  edit_document_type: (id, userData) => apiClient.post(`/admin/document_type/update/${id}`, userData),
  delete_document_type: (id) => apiClient.get(`/admin/document_type/destroy/${id}`),
  document_type_status_update: (id, userData) => apiClient.post(`/admin/document_type/update-status/${id}`, userData),
};

export default DocumentTypeService;