import React, { Fragment, useEffect } from 'react';
import Login from '../../Components/Login/Login';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userRole = JSON.parse(localStorage.getItem("userRole"));

    if (userRole?.includes("Administrateur") && token) {
      navigate("/admin-dashboard");
    } else if (userRole?.includes("Assureur") && token) {
      navigate("/insurers-dashboard");
    } else if (userRole?.includes("Courtier") && token) {
      navigate("/courtier-dashboard");
    } else if (userRole?.includes("Gestionnaire ACS") && token) {
      navigate("/manager-dashboard");
    } else {
      navigate("/");
      localStorage.clear();
    }
  }, []);

  return (
    <Fragment>
      <Login />
    </Fragment>
  );
};

export default LoginPage;
