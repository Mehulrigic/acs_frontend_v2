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

const AddManagerFileService = {
  tobeproceed: (userData) => apiClient.post(`/acsmanager/tobeprocessed/index`, userData),
  filelist: (userData) => apiClient.post(`/acsmanager/files/index`, userData),
  paperList: (id, userData) => apiClient.post(`/acsmanager/files/papers/index/${id}`, userData),
  speakerList: (id, userData) => apiClient.post(`/acsmanager/files/speakers/index/${id}`, userData),
  speaker_DropDown_List: (userData) => apiClient.post(`/acsmanager/files/speakers-list`, userData),
  folderDetails: (id) => apiClient.post(`/acsmanager/files/fileinformation/index/${id}`),
  missingdoclist: (id) => apiClient.post(`/acsmanager/files/fileinformation/index/${id}`),
  fileDetail: (id) => apiClient.get(`/acsmanager/files/filedetail/index/${id}`),
  deleteDocument: (id) => apiClient.get(`/acsmanager/files/filedetail/index/${id}`),
  delete_speaker: (userDocumentId, id) => apiClient.get(`/acsmanager/files/speakers/delete/${userDocumentId}/${id}`),
  speakerdetail: (id) => apiClient.get(`/acsmanager/files/speakers/show/${id}`),
  create_speaker_type: (id, userData) => apiClient.post(`/user/user_document/add-speaker/${id}`, userData),
  delete_speaker_from_file: (id) => apiClient.get(`/acsmanager/files/speakers/document-delete/${id}`),
  update_speaker: (id, userData) => apiClient.post(`/acsmanager/files/speakers/upadte/${id}`, userData),
  document_type: (userData) => apiClient.post(`/acsmanager/files/document-type`, userData),
  update_document_type: (userData) => apiClient.post(`/acsmanager/files/update/document-type`, userData),
};

export default AddManagerFileService;
