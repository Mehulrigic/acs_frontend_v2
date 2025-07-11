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

const FilePageService = {
  folder_list: (userData) => apiClient.post("/user/user_document/index", userData),
  show_user_document: (id, userData) => apiClient.post(`/user/user_document/show/${id}`, userData),
  history_list: (id, userData) => apiClient.post(`/user/user_document/history/${id}`, userData),
  invalid_reason_note_list: (id) => apiClient.get(`/user/user_document/history-list/${id}`),
  missing_document_list: (id, userData) => apiClient.post(`/user/user_document/missing-document-list/${id}`, userData),
  mark_history_as_read: (id) => apiClient.get(`/user/user_document/mark-history-as-read/${id}`),
  mark_history_all_as_read: (id) => apiClient.get(`/user/user_document/mark-history-all-as-read/${id}`),
  show_other_document: (id, userData) => apiClient.post(`/user/user_document/other-documents/${id}`, userData),
  speaker_document: (id, userData) => apiClient.post(`/user/user_document/speaker-documents/${id}`, userData),
  folder_info_update: (id, userData) => apiClient.post(`/user/user_document/update-folder-info/${id}`, userData),
  delete_document_file: (id) => apiClient.get(`/user/user_document/delete-document-file/${id}`),
  add_document_files: (id, userData) => apiClient.post(`/user/user_document/add-document-files/${id}`, userData),
  add_missing_document: (id, userData) => apiClient.post(`/user/user_document/add-missing-document/${id}`, userData),
  update_document_files: (id, userData) => apiClient.post(`/user/user_document/update-document-files/${id}`, userData),
  validate_document_files: (id, userData) => apiClient.post(`/user/user_document/validate-document-files/${id}`, userData),
  invalidreson: (id) => apiClient.post(`/user/user_document/show-invalid-message/${id}`),
  sitestatusUpdate: (userDate) => apiClient.post(`/acsmanager/files/sitestatus`, userDate),
  update_document_status: (id, userDate) => apiClient.post(`/user/user_document/update-document-status/${id}`, userDate),
  document_file_notes: (id, userDate) => apiClient.post(`/user/user_document/document-file/notes/${id}`, userDate),
};

export default FilePageService;