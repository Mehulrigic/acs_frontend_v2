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

const AddFolderPanelService = {
  broker_list: () => apiClient.get(`/user/user_document/broker-list`),
  document_type_list: (slug) => {
    const endpoint = slug ? `/user/user_document/doc-types/${slug}` : `/user/user_document/doc-types`;
    return apiClient.get(endpoint);
  },
  add_broker: (userData) => apiClient.post("/user/user_document/create-broker", userData),
  store_document: (userData) => apiClient.post("/user/user_document/store-documents", userData),
};

export default AddFolderPanelService;
