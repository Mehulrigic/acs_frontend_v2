import "./App.css";
import { BrowserRouter, Route, Routes, } from 'react-router-dom';
import InsurersDashboard from "./Pages/InsurersDashboard/InsurersDashboard";
import LoginPage from "./Pages/LoginPage/LoginPage";
// import { AuthProvider } from "./Common/AuthContext";
import ProtectedRoute from "./Common/ProtectedRoute";
import ForgotPassword from "./Components/ForgotPassword/ForgotPassword";
import ResetPassword from "./Components/ResetPassword/ResetPassword";
import AdminDashboard from "./Pages/AdminDashboard/AdminDashboard"
import UserManagement from "./Pages/UserManagement/UserManagement";
import FilePage from "./Pages/FilePage/FilePage";
import FileDetails from "./Pages/FileDetails/FileDetails";
import MyAccount from "./Pages/MyAccount/MyAccount";
import BrokerDashboard from "./Pages/BrokerDashboard/BrokerDashboard";
import BrokerFile from "./Pages/BrokerFile/BrokerFile";
import BrokerFileDetail from "./Pages/BrokerFileDetail/BrokerFileDetail";
import ManagerDashboard from "./Pages/ManagerDashboard/ManagerDashboard";
import ManagerFile from "./Pages/ManagerFile/ManagerFile";
import ManagerFileDetail from "./Pages/ManagerFileDetail/ManagerFileDetail";
import DocumentType from "./Pages/DocumentType/DocumentType";
import PreferredDocument from "./Pages/PreferredDocument/PreferredDocument";
import SpeakerManagementList from "./Pages/SpeakerManagement/SpeakerManagementList";
import SettingList from "./Pages/SettingsManagement/SettingsList";
import RoleManagementList from "./Pages/RoleManagement/RoleManagementList";
import AdminFileDetail from "./Pages/AdminDashboard/AdminFileDetail";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const App = () => { 
  return (
    <div className="App">
      {/* <AuthProvider> */}
        <BrowserRouter>
        {/* <AuthRedirect /> Handle navigation here */}
          <Routes>
            {/* Comman URL */}
            <Route
              path="/"
              element={<LoginPage />}
            />
            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />
            <Route
              path="/reset-password"
              element={<ProtectedRoute element={<ResetPassword />} />}
            />
            <Route
              path="my-account"
              element={<ProtectedRoute element={<MyAccount />} />}
            />

            {/* Admin */}
            <Route
              path="admin-dashboard"
              element={<ProtectedRoute element={<AdminDashboard />} />}
            />
            <Route
              path="user-management"
              element={<ProtectedRoute element={<UserManagement />} />}
            />
            <Route
              path="document-type"
              element={<ProtectedRoute element={<DocumentType />} />}
            />
            <Route
              path="preferred-document"
              element={<ProtectedRoute element={<PreferredDocument />} />}
            />
            <Route
              path="speaker-management"
              element={<ProtectedRoute element={<SpeakerManagementList />} />}
            />
            <Route
              path="role-management"
              element={<ProtectedRoute element={<RoleManagementList />} />}
            />
            <Route
              path="settings"
              element={<ProtectedRoute element={<SettingList />} />}
            />
            <Route
              path="admin-file-detail/:id"
              element={<ProtectedRoute element={<AdminFileDetail />} />}
            />

            {/* Assureur ( Insurers ) */}
            <Route
              path="insurers-dashboard"
              element={<ProtectedRoute element={<InsurersDashboard />} />}
            />
            <Route
              path="insurers-file"
              element={<ProtectedRoute element={<FilePage />} />}
            />
            <Route
              path="file-details/:id"
              element={<ProtectedRoute element={<FileDetails />} />}
            />

            {/* Courtier ( Broker ) */}
            <Route
              path="courtier-dashboard"
              element={<ProtectedRoute element={<BrokerDashboard />} />}
            />
            <Route
              path="courtier-files"
              element={<ProtectedRoute element={<BrokerFile />} />}
            />
            <Route
              path="courtier-file-detail/:id"
              element={<ProtectedRoute element={<BrokerFileDetail />} />}
            />

            {/* Gestionnaire ACS ( ACS Manager ) */}
            <Route
              path="manager-dashboard"
              element={<ProtectedRoute element={<ManagerDashboard />} />}
            />
            <Route
              path="manager-files"
              element={<ProtectedRoute element={<ManagerFile />} />}
            />
            <Route
              path="manager-file-detail/:id"
              element={<ProtectedRoute element={<ManagerFileDetail />} />}
            />
          </Routes>
        </BrowserRouter>
      {/* </AuthProvider> */}
    </div>
  );
};

// Separate component for handling redirects
const AuthRedirect = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const type = localStorage.getItem("userRole");
  const currentPath = window.location.pathname; // Get current URL path

  useEffect(() => {
    // Only redirect if user is on the login page ("/")
    if (token && type && currentPath === "/") {
      if (type.includes("Administrateur")) {
        navigate("/admin-dashboard");
      } else if (type.includes("Assureur")) {
        navigate("/insurers-dashboard");
      } else if (type.includes("Courtier")) {
        navigate("/courtier-dashboard");
      } else if (type.includes("Gestionnaire ACS")) {
        navigate("/manager-dashboard");
      }
    }
  }, [token, type, navigate, currentPath]);

  return null;
};

export default App;