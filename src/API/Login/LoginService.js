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

const LoginService = {
  login: (userData) => apiClient.post("/session/login", userData),
  signup: (userData) => apiClient.post("/session/signup", userData),
  send_otp: (email) => apiClient.post("/password/email", email),
  reSend_otp: (email) => apiClient.post("/password/otp/resend", email),
  verify_otp: (otpData) => apiClient.post("/password/otp/verify", otpData),
  reset_password: (otpData) => apiClient.post("/password/reset", otpData),
  role_list: () => apiClient.get("/session/role-list"),
  logout: () => {
    const token = localStorage.getItem("authToken");
    return apiClient.post("/session/logout", {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default LoginService;
