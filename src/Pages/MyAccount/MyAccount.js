import React, { Fragment, useEffect, useState } from "react";
import "./MyAccount.css";
import SidePanel from "../../Components/SidePanel/SidePanel";
import { Button, Form } from "react-bootstrap";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfileManagementService from "../../API/ProfileManagement/ProfileManagementService";
import UserManagementService from "../../API/UserManagement/UserManagementService";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { SketchPicker } from "react-color";
import managerLogo from "../../acs-logo.png";
import logo from "../../ass-logo.png";
import Loading from "../../Common/Loading";

const MyAccount = () => {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [leftPanelThemeColor, setLeftPanelThemeColor] = useState("");
  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
  const [leftPanelChange, setLeftPanelChange] = useState(false);
  const [logoImageShow, setLogoImageShow] = useState("");
  const [userRole, setUserRole] = useState("");
  const [logoImage, setLogoImage] = useState(null);
  const [logoWidth, setLogoWidth] = useState(null);
  const [logoHeight, setLogoHeight] = useState(null);
  const [logoChange, setLogoChange] = useState(false);
  const [userId, setUserId] = useState("");
  const [currentPasswordShow, setCurrentPasswordShow] = useState(false);
  const [newPasswordShow, setNewPasswordShow] = useState(false);
  const [confirmPasswordShow, setConfirmPasswordShow] = useState(false);
  const [showUserList, setShowUserList] = useState([]);
  const [flashMessageProfile, setFlashMessageProfile] = useState({ type: "", message: "" });
  const [flashMessagePassword, setFlashMessagePassword] = useState({ type: "", message: "" });
  const [flashMessageTheme, setFlashMessageTheme] = useState({ type: "", message: "" });
  const [buttonColor, setButtonColor] = useState("");

  useEffect(() => {
    if (flashMessageProfile.message) {
      const timer = setTimeout(() => {
        setFlashMessageProfile({ type: "", message: "" });
      }, 2000);

      return () => clearTimeout(timer);
    }
    if (flashMessagePassword.message) {
      const timer = setTimeout(() => {
        setFlashMessagePassword({ type: "", message: "" });
      }, 2000);

      return () => clearTimeout(timer);
    }
    if (flashMessageTheme.message) {
      const timer = setTimeout(() => {
        setFlashMessageTheme({ type: "", message: "" });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [flashMessageProfile, flashMessagePassword, flashMessageTheme]);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      const user = JSON.parse(localStorage.getItem("user"));
      const userRole = JSON.parse(localStorage.getItem("userRole"));
      const logo_image = JSON.parse(localStorage.getItem("logo_image"));
      const left_panel_color = JSON.parse(localStorage.getItem("left_panel_color"));
      const right_panel_color = JSON.parse(localStorage.getItem("right_panel_color"));
      const button_color = JSON.parse(localStorage.getItem("button_color"));
      
      setUserId(user?.id);
      ShowUser(user?.id);
      setLogoImageShow(logo_image);
      setUserRole(userRole[0]);
      setLeftPanelThemeColor(left_panel_color);
      setRightPanelThemeColor(right_panel_color);
      setButtonColor(button_color);
    }
  }, []);

  const handleFileUpload = (event) => {
    setLogoChange(true);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoImage(e.target.result); // Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if(logoWidth === logoHeight){
      setIsLoading(false);
      setFlashMessageTheme({
        type: "error",
        message: "La largeur et la hauteur ne doivent pas être identiques.",
      });
      return;
    }
    try {
      const themeData = {
        left_panel_color: leftPanelThemeColor,
        right_panel_color: rightPanelThemeColor,
        logo_image: logoImage,
        button_color: buttonColor,
        logo_width: logoWidth,
        logo_height: logoHeight
      };
      const response = await ProfileManagementService.update_theme_setting(themeData);
      if (response.data.status) {
        setIsLoading(false);
        ShowThemeSetting();
        setLeftPanelChange(false);
        setFlashMessageTheme({
          type: "success",
          message: response.data.message || t("somethingWentWrong"),
        });
      } else {
        setIsLoading(false);
        setFlashMessageTheme({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setIsLoading(false)
      console.log(error);
    }
  };

  const ShowThemeSetting = async () => {
    setIsLoading(true);
    try {
      const response = await ProfileManagementService.show_theme_setting();
      if (response.data.status) {
        setIsLoading(false);
        localStorage.setItem("logo_image", JSON.stringify(response.data.data.logo_image));
        localStorage.setItem("left_panel_color", JSON.stringify(response.data.data.left_panel_color));
        localStorage.setItem("right_panel_color", JSON.stringify(response.data.data.right_panel_color));
        localStorage.setItem("button_color", JSON.stringify(response.data.data.button_color));
        localStorage.setItem("logo_width", JSON.stringify(response.data.data.logo_width));
        localStorage.setItem("logo_height", JSON.stringify(response.data.data.logo_height));

        setLogoImageShow(response.data.data.logo_image);
        setLogoWidth(response.data.data.logo_width);
        setLogoHeight(response.data.data.logo_height);
        window.location.reload(true);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const ShowUser = async (id) => {
    setIsLoading(true);
    try {
      const response = await UserManagementService.show_user(id);
      if (response.data.status) {
        setIsLoading(false);
        setShowUserList(response.data.user);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const SaveProfileChanges = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    if (
      e.target.elements.firstName.value == "" ||
      e.target.elements.lastName.value == "" ||
      e.target.elements.email.value == ""
    ) {
      setIsLoading(false);
      setFlashMessageProfile({
        type: "error",
        message: t("requriedErrorMessageLabel"),
      });
      return;
    }
    try {
      var useData = {
        first_name: e.target.elements.firstName.value ?? "",
        last_name: e.target.elements.lastName.value ?? "",
        email: e.target.elements.email.value ?? "",
      };

      const response = await ProfileManagementService.update_profile(useData);
      if (response.data.status) {
        setIsLoading(false);
        setFlashMessageProfile({
          type: "success",
          message: response.data.message || t("somethingWentWrong"),
        });
      } else {
        setIsLoading(false);
        setFlashMessageProfile({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const PasswordChanges = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    if (
      e.target.elements.currentPassword.value == "" ||
      e.target.elements.newPassword.value == "" ||
      e.target.elements.confirmPassword.value == ""
    ) {
      setIsLoading(false);
      setFlashMessagePassword({
        type: "error",
        message: t("requriedErrorMessageLabel"),
      });
      return;
    }
    if (e.target.elements.newPassword.value != e.target.elements.confirmPassword.value) {
      setIsLoading(false);
      setFlashMessagePassword({
        type: "error",
        message: "Le mot de passe et la confirmation du mot de passe doivent être identiques.",
      });
      return;
    }
    try {
      var useData = {
        current_password: e.target.elements.currentPassword.value ?? "",
        new_password: e.target.elements.newPassword.value ?? "",
        new_password_confirmation: e.target.elements.confirmPassword.value ?? "",
      };

      const response = await ProfileManagementService.update_password(useData);
      if (response.data.status) {
        setIsLoading(false);
        setFlashMessagePassword({
          type: "success",
          message: response.data.message || t("somethingWentWrong"),
        });
      } else {
        setIsLoading(false);
        setFlashMessagePassword({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const handleChangeLeftPanel = (color) => {
    setLeftPanelThemeColor(color.hex);
    setLeftPanelChange(true);
  };

  const handleChangeRightPanel = (color) => {
    setRightPanelThemeColor(color.hex);
  };
  const handleChangeButtonColor = (color) => {
    setButtonColor(color.hex);
  };

  return (
    <Fragment>
      <style> {` button.btn.btn-primary  { background-color: ${localStorage.getItem('button_color') ? JSON.parse(localStorage.getItem('button_color')) : "#e84455"} !Important};`} </style>

      <div className={`${userRole === 'Courtier' ? 'broker-side-pannel' : ''}`}>
        <SidePanel
          sidebarLogo={`${process.env.REACT_APP_IMAGE_URL}/${logoImageShow}`}
          backgroundColor={leftPanelThemeColor}
          leftPanelChange={leftPanelChange}
          logoChange={logoChange}
          logoImage={logoImage}
          logoWidth={logoWidth}
          logoHeight={logoHeight}
        />
      </div>
      <div
        className={`my-account dashboard-main-content ${userRole === 'Courtier' ? 'broker-dashboard' : userRole === 'Gestionnaire ACS' ? 'manager-dashboard' : ''}`}
        style={{
          backgroundColor: rightPanelThemeColor
        }}
      >
        <h1>{t("myAccountLabel")}</h1>
        <div className="table-wrapper mt-32">
          <Tabs
            defaultActiveKey="home"
            id="uncontrolled-tab-example"
            className="inner-tab"
          >
            {/* Profile */}
            <Tab eventKey="home" title={t("profileLabel")}>
              {isLoading ? <Loading /> :
                <Form onSubmit={SaveProfileChanges}>
                  {flashMessageProfile.message && (
                    <div
                      className={`mt-3 mx-w-320 alert ${flashMessageProfile.type === "success"
                        ? "alert-success"
                        : "alert-danger"
                        } text-center`}
                      role="alert"
                    >
                      {flashMessageProfile.message}
                    </div>
                  )}
                  <Form.Group className="mb-3 mx-w-320" controlId="firstName">
                    <Form.Label>
                      {t("firstName")} <span>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t("firstName")}
                      name="firstName"
                      defaultValue={showUserList?.firstname}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3 mx-w-320" controlId="lastName">
                    <Form.Label>
                      {t("lastName")} <span>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t("lastName")}
                      name="lastName"
                      defaultValue={showUserList?.lastname}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3 mx-w-320" controlId="emailid">
                    <Form.Label>
                      {t("emailLabel")} <span>*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder={t("ex : jean.dupont@email.com")}
                      name="email"
                      defaultValue={showUserList?.email}
                    />
                  </Form.Group>

                  <Button className="mt-3" variant="primary" type="submit">
                    {t("saveChangesLabel")}
                  </Button>
                </Form>
              }
            </Tab>

            {/* Manage Password */}
            <Tab eventKey="profile" title={t("managePassword")}>
              {isLoading ? <Loading /> :
                <Form onSubmit={PasswordChanges}>
                  {flashMessagePassword.message && (
                    <div
                      className={`mt-3 mx-w-320 alert ${flashMessagePassword.type === "success"
                        ? "alert-success"
                        : "alert-danger"
                        } text-center`}
                      role="alert"
                    >
                      {flashMessagePassword.message}
                    </div>
                  )}
                  <Form.Group
                    className="mb-3 mx-w-320 relative"
                    controlId="currentPassword"
                  >
                    <Form.Label>{t("currentPassword")} <span>*</span></Form.Label>
                    <Form.Control
                      type={currentPasswordShow ? "text" : "password"}
                      placeholder={t("currentPassword")}
                      name="currentPassword"
                    />
                    <Link
                      className={
                        currentPasswordShow ? "eye-icon show" : "eye-icon"
                      }
                      onClick={() => setCurrentPasswordShow(!currentPasswordShow)}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 6.5C15.79 6.5 19.17 8.63 20.82 12C19.17 15.37 15.8 17.5 12 17.5C8.2 17.5 4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5C10.62 14.5 9.5 13.38 9.5 12C9.5 10.62 10.62 9.5 12 9.5ZM12 7.5C9.52 7.5 7.5 9.52 7.5 12C7.5 14.48 9.52 16.5 12 16.5C14.48 16.5 16.5 14.48 16.5 12C16.5 9.52 14.48 7.5 12 7.5Z"
                          fill="#e84455"
                        />
                      </svg>
                    </Link>
                  </Form.Group>

                  <Form.Group
                    className="mb-3 mx-w-320 relative"
                    controlId="newPassword"
                  >
                    <Form.Label>{t("newPassword")} <span>*</span></Form.Label>
                    <Form.Control
                      type={newPasswordShow ? "text" : "password"}
                      placeholder={t("newPassword")}
                      name="newPassword"
                    />
                    <Link
                      className={newPasswordShow ? "eye-icon show" : "eye-icon"}
                      onClick={() => setNewPasswordShow(!newPasswordShow)}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 6.5C15.79 6.5 19.17 8.63 20.82 12C19.17 15.37 15.8 17.5 12 17.5C8.2 17.5 4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5C10.62 14.5 9.5 13.38 9.5 12C9.5 10.62 10.62 9.5 12 9.5ZM12 7.5C9.52 7.5 7.5 9.52 7.5 12C7.5 14.48 9.52 16.5 12 16.5C14.48 16.5 16.5 14.48 16.5 12C16.5 9.52 14.48 7.5 12 7.5Z"
                          fill="#e84455"
                        />
                      </svg>
                    </Link>
                  </Form.Group>

                  <Form.Group
                    className="mb-3 mx-w-320 relative"
                    controlId="confirmPassword"
                  >
                    <Form.Label>{t("confirmPassword")} <span>*</span></Form.Label>
                    <Form.Control
                      type={confirmPasswordShow ? "text" : "password"}
                      placeholder={t("confirmPassword")}
                      name="confirmPassword"
                    />
                    <Link
                      className={
                        confirmPasswordShow ? "eye-icon show" : "eye-icon"
                      }
                      onClick={() => setConfirmPasswordShow(!confirmPasswordShow)}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 6.5C15.79 6.5 19.17 8.63 20.82 12C19.17 15.37 15.8 17.5 12 17.5C8.2 17.5 4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5C10.62 14.5 9.5 13.38 9.5 12C9.5 10.62 10.62 9.5 12 9.5ZM12 7.5C9.52 7.5 7.5 9.52 7.5 12C7.5 14.48 9.52 16.5 12 16.5C14.48 16.5 16.5 14.48 16.5 12C16.5 9.52 14.48 7.5 12 7.5Z"
                          fill="#e84455"
                        />
                      </svg>
                    </Link>
                  </Form.Group>

                  <Button className="mt-3" variant="primary" type="submit">
                    {t("saveChangesLabel")}
                  </Button>
                </Form>
              }
            </Tab>

            {/* Theme Setting */}
            {userRole.includes("Administrateur") &&
              <Tab eventKey="theme" title={t("themesetting")}>
                {isLoading ? <Loading /> :
                  <Container fluid>
                    <Row>
                      <Col xl={5} className="mb-3">
                        <Form.Label className="mb-4">Logo du thème</Form.Label>
                        {flashMessageTheme.message && (
                          <div
                            className={`mt-3 mx-w-320 alert ${flashMessageTheme.type === "success"
                              ? "alert-success"
                              : "alert-danger"
                              } text-center`}
                            role="alert"
                          >
                            {flashMessageTheme.message}
                          </div>
                        )}
                        <Form.Group
                          controlId="formFile"
                          className="file-upload-container"
                        >
                          <div className="custom-upload-box">
                            <svg
                              width="48"
                              height="32"
                              viewBox="0 0 48 32"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M38.7 12.08C37.34 5.18 31.28 0 24 0C18.22 0 13.2 3.28 10.7 8.08C4.68 8.72 0 13.82 0 20C0 26.62 5.38 32 12 32H38C43.52 32 48 27.52 48 22C48 16.72 43.9 12.44 38.7 12.08ZM38 28H12C7.58 28 4 24.42 4 20C4 15.9 7.06 12.48 11.12 12.06L13.26 11.84L14.26 9.94C16.16 6.28 19.88 4 24 4C29.24 4 33.76 7.72 34.78 12.86L35.38 15.86L38.44 16.08C41.56 16.28 44 18.9 44 22C44 25.3 41.3 28 38 28ZM16 18H21.1V24H26.9V18H32L24 10L16 18Z"
                                fill="#00366B"
                              />
                            </svg>
                            <p className="upload-text">
                              {t("DragyourdocumentsLabel")}{" "}
                              <span className="browse-link">
                                {t("browsemyfilesLabel")}
                              </span>
                            </p>
                            <Form.Control type="file" className="file-input" onChange={handleFileUpload} />
                          </div>
                        </Form.Group>
                        {/* <div className="image-preview">
                          {logoImage && <img src={logoImage} className="mt-3" alt="Uploaded Logo" style={{ maxWidth: "100%" }} />}
                        </div> */}
                        <div className="d-flex gap-2 mt-3">
                          <Form.Group controlId="logoWidth">
                            <Form.Label>Width (px)</Form.Label>
                            <Form.Control disabled={!logoChange} type="number" min="1" placeholder="Width" onChange={(e) => setLogoWidth(e.target.value)} />
                          </Form.Group>

                          <Form.Group controlId="logoHeight">
                            <Form.Label>Height (px)</Form.Label>
                            <Form.Control disabled={!logoChange} type="number" min="1" placeholder="Height" onChange={(e) => setLogoHeight(e.target.value)} />
                          </Form.Group>
                        </div>
                      </Col>
                      <Col xl={7} className="mb-3">
                        <Row>
                          <Col xl={4} className="mb-3">
                            <Form.Label className="mb-4">Couleur du panneau latéral</Form.Label>
                            <SketchPicker
                              width="auto"
                              color={leftPanelThemeColor}
                              onChangeComplete={handleChangeLeftPanel}
                            />
                            <div
                              style={{
                                marginTop: "20px",
                                width: "50px",
                                height: "50px",
                                backgroundColor: leftPanelThemeColor,
                                border: "1px solid #ccc",
                              }}
                            ></div>
                          </Col>
                          <Col xl={4} className="mb-3">
                            <Form.Label className="mb-4">Couleur du panneau principal</Form.Label>
                            <SketchPicker
                              width="auto"
                              color={rightPanelThemeColor}
                              onChangeComplete={handleChangeRightPanel}
                            />
                            <div
                              style={{
                                marginTop: "20px",
                                width: "50px",
                                height: "50px",
                                backgroundColor: rightPanelThemeColor,
                                border: "1px solid #ccc",
                              }}
                            ></div>
                          </Col>
                          <Col xl={4} className="mb-3">
                            <Form.Label className="mb-2 role-label">Couleur du bouton</Form.Label>
                            <SketchPicker
                              width="auto"
                              color={buttonColor}
                              onChangeComplete={handleChangeButtonColor}
                            />
                            <div
                              style={{
                                marginTop: "20px",
                                width: "50px",
                                height: "50px",
                                backgroundColor: buttonColor,
                                border: "1px solid #ccc",
                              }}
                            ></div>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Button className="mt-4 d-inline" variant="primary" onClick={handleSubmit}>
                      {t("saveChangesLabel")}
                    </Button>
                  </Container>
                }
              </Tab>
            }
          </Tabs>
        </div>
      </div>
    </Fragment>
  );
};

export default MyAccount;