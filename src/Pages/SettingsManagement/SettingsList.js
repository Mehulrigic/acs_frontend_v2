import React, { Fragment, useEffect, useState } from "react";
import SidePanel from "../../Components/SidePanel/SidePanel";

import { Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import logo from "../../acs-logo.png";
import SettingService from "../../API/SettingManagement/SettingService";
import { useNavigate } from "react-router-dom";

const SettingList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [settingData, setSettingData] = useState([]);
  const [settingShow, setSettingShow] = useState(true);
  const [logoImageShow, setLogoImageShow] = useState("");
  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });

  useEffect(() => {
      if (flashMessage.message) {
        const timer = setTimeout(() => {
          setFlashMessage({ type: "", message: "" });
        }, 2000); // Adjust time as needed
  
        return () => clearTimeout(timer);
      }
    }, [flashMessage]);

  useEffect(() => {
    const userRole = JSON.parse(localStorage.getItem("userRole"));
    const token = localStorage.getItem("authToken");
    if (token && userRole.includes("Administrateur")) {
      const logo_image = JSON.parse(localStorage.getItem("logo_image"));
      const right_panel_color = JSON.parse(localStorage.getItem("right_panel_color"));
      setRightPanelThemeColor(right_panel_color);
      setLogoImageShow(logo_image);
      getSettingList();
    } else {
      navigate("/");
    }
  }, []);

  const getSettingList = async () => {
    try {
      const response = await SettingService.setting_list();
      if (response.data) {
        setSettingData(response.data);
        setSettingShow(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create an empty object to hold the form data
      let useData = {};

      // Use FormData to get form input values
      const formData = new FormData(e.target); // `e.target` is the form element

      // Iterate through settingData and populate the useData object
      settingData.forEach((element) => {
        const value = formData.get(element.key); // Use element.key to fetch the corresponding value
        if (value) {
          useData[element.key] = value;
        }
      });

      console.log("useData before sending:", useData); // Log the data before sending

      // Send the data to the server using your service
      const response = await SettingService.edit_setting_type(useData);
      console.log(response, "console.log(response)");

      if (response.data.status) {
        setFlashMessage({
          type: "success",
          message: "Paramètres mis à jour avec succès !",
        });
      } else {
        setFlashMessage({
          type: "error",
          message: t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setFlashMessage({
        type: "error",
        message: t("somethingWentWrong"),
      });
    }
  };

  return (
    <Fragment>
      <style> {` button.btn.btn-primary  { background-color: ${localStorage.getItem('button_color') ? JSON.parse(localStorage.getItem('button_color')) : "#e84455"} !Important};`} </style>

      <SidePanel sidebarLogo={`${process.env.REACT_APP_IMAGE_URL}/${logoImageShow}`} />
      <div className="dashboard-main-content user-management" style={{backgroundColor: rightPanelThemeColor}}>
        <h1 className="mb-4">{t("Settings")}</h1>
        <div className="table-wrapper mt-16">
          <div className="text-start mb-3">
            {/* loader */}

            {settingShow === true ? (
              <div id="loader">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                  <radialGradient
                    id="a9"
                    cx=".66"
                    fx=".66"
                    cy=".3125"
                    fy=".3125"
                    gradientTransform="scale(1.5)"
                  >
                    <stop offset="0" stop-color="#007aff26"></stop>
                    <stop
                      offset=".3"
                      stop-color="#007aff26"
                      stop-opacity=".9"
                    ></stop>
                    <stop
                      offset=".6"
                      stop-color="#007aff26"
                      stop-opacity=".6"
                    ></stop>
                    <stop
                      offset=".8"
                      stop-color="#007aff26"
                      stop-opacity=".3"
                    ></stop>
                    <stop
                      offset="1"
                      stop-color="#007aff26"
                      stop-opacity="0"
                    ></stop>
                  </radialGradient>
                  <circle
                    transform-origin="center"
                    fill="none"
                    stroke="url(#a9)"
                    stroke-width="15"
                    stroke-linecap="round"
                    stroke-dasharray="200 1000"
                    stroke-dashoffset="0"
                    cx="100"
                    cy="100"
                    r="70"
                  >
                    <animateTransform
                      type="rotate"
                      attributeName="transform"
                      calcMode="spline"
                      dur="2"
                      values="360;0"
                      keyTimes="0;1"
                      keySplines="0 0 1 1"
                      repeatCount="indefinite"
                    ></animateTransform>
                  </circle>
                  <circle
                    transform-origin="center"
                    fill="none"
                    opacity=".2"
                    stroke="#007aff26"
                    stroke-width="15"
                    stroke-linecap="round"
                    cx="100"
                    cy="100"
                    r="70"
                  ></circle>
                </svg>
              </div>
            ) : (
              <Form onSubmit={handleSubmit}>
                {flashMessage.message && (
                  <div
                    className={`mt-3 alert ${flashMessage.type === "success"
                      ? "alert-success"
                      : "alert-danger"
                      } text-center`}
                    role="alert"
                  >
                    {flashMessage.message}
                  </div>
                )}
                <div className="form-row mt-3">
                  {settingData.map((element) => (
                    <Form.Group
                      className="form-col mb-4"
                      controlId={element.key}
                      key={element.key}
                    >
                      <Form.Label>{element.key}</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={element.value}
                        defaultValue={element.value}
                        name={element.key} // Ensure name matches the key in settingData
                      />
                    </Form.Group>
                  ))}
                </div>
                <div className="text-start mt-3">
                  <Button variant="primary" type="submit">
                    {t("submitButton")}
                  </Button>
                </div>
              </Form>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default SettingList;
