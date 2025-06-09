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

const LogicalBlockService = {
    logical_block_list: (userData) => apiClient.post("/admin/logical_block/index", userData),
    create_logical_block: (userData) => apiClient.post("/admin/logical_block/create", userData),
    show_logical_block: (id) => apiClient.get(`/admin/logical_block/show/${id}`),
    edit_logical_block: (id, userData) => apiClient.post(`/admin/logical_block/update/${id}`, userData),
    delete_logical_block: (id) => apiClient.get(`/admin/logical_block/destroy/${id}`),
    logical_block_status_update: (id, userData) => apiClient.post(`/admin/logical_block/update-status/${id}`, userData),
};

export default LogicalBlockService;