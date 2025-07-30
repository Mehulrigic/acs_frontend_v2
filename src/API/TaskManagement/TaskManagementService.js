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
            localStorage.clear();
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

const TaskManagementService = {
    task_index: (userData) => apiClient.post("/user/task/index", userData),
    task_create: (userData) => apiClient.post("/user/task/create", userData),
    task_show: (id) => apiClient.get(`/user/task/show/${id}`),
    task_update: (id, userData) => apiClient.post(`/user/task/update/${id}`, userData),
    task_delete: (id) => apiClient.get(`/user/task/delete/${id}`),
    task_assignable_users: () => apiClient.get("/user/task/assignable-users"),
    user_document_list: (id) => apiClient.get(`/user/task/documents/${id}`),
    user_document_file_list: (id) => apiClient.get(`/user/task/documents/files/${id}`),
};

export default TaskManagementService;