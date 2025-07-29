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

const DashboardManagementService = {
  user_document: (userData) => apiClient.post("/user/user_document/index", userData),
  get_statistics: (userData) => apiClient.post("/user/dashboard/get-statistics", userData),
  delete_user_document: (id) => apiClient.get(`/user/user_document/delete-user-document/${id}`),

  // Dashboard Tab
  dashboard_registered_document_file: (id) => apiClient.get(`/user/user_document/registered/document-file/count/${id}`),
  speaker_registered_document_file: (id) => apiClient.get(`/user/user_document/speaker/registered/document-file/count/${id}`),
  dashboard_last_five_event: (id, userData) => apiClient.post(`/user/user_document/dashboard/event/${id}`, userData),
  dashboard_last_three_note: (id, userData) => apiClient.post(`/user/user_document/dashboard/note/${id}`, userData),
  export_folder: (id, format) =>
  apiClient.get(`/user/user_document/export/folder/${id}?format=${format}`, {
    responseType: 'blob',
  }),
};

export default DashboardManagementService;