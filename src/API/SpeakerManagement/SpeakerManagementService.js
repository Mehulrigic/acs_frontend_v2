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

const SpeakerManagementService = {
  speaker_list: (userData) => apiClient.post("/admin/speaker/index", userData),
  create_speaker_type: (userData) => apiClient.post("/admin/speaker/create", userData),
  show_speaker_type: (id) => apiClient.get(`/admin/speaker/show/${id}`),
  edit_speaker_type: (id, userData) => apiClient.post(`/admin/speaker/update/${id}`, userData),
  delete_speaker_type: (id) => apiClient.get(`/admin/speaker/destroy/${id}`),
  speaker_type_status_update: (id, userData) => apiClient.post(`/admin/speaker/update-status/${id}`, userData),
};

export default SpeakerManagementService;