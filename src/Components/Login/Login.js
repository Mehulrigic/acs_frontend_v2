import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Button, Form, Offcanvas } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import i18n from "i18next";
import LoginService from "../../API/Login/LoginService";

const Login = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [passwordShow, setPasswordShow] = useState(false);
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState("fr");
  const [role, setRole] = useState("");
  const [roleList, setRoleList] = useState([]);
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });


  useEffect(() => {
    if (flashMessage.message) {
      const timer = setTimeout(() => {
        setFlashMessage({ type: "", message: "" });
      }, 3000); // Adjust time as needed


      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  useEffect(() => {
    if (show) {
      RoleList();
    }
  }, [show]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Function to handle language change
  const handleLanguageChange = (event) => {
    const selectedLang = event.target.value;
    setSelectedLanguage(selectedLang);
    i18n.changeLanguage(selectedLang);
    localStorage.setItem("language", selectedLang);
  };

  const Login = async (e) => {
    e.preventDefault();
    if(e.target.elements.email.value == "" || e.target.elements.password.value == ""){
      setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
      return;
    }
    try {
      var useData = {
        email: e.target.elements.email.value ?? "",
        password: e.target.elements.password.value ?? "",
      };

      const response = await LoginService.login(useData);
      if (response.data.status) {
        const { token, user, type, can_delete_folder, user_theme_setting } = response.data;

        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", JSON.stringify(type));
        localStorage.setItem("can_delete_folder", can_delete_folder);
        localStorage.setItem("logo_image", JSON.stringify(user_theme_setting?.logo_image));
        localStorage.setItem("button_color", JSON.stringify(user_theme_setting?.button_color));
        localStorage.setItem("logo_width", JSON.stringify(user_theme_setting?.logo_width));
        localStorage.setItem("logo_height", JSON.stringify(user_theme_setting?.logo_height));
        localStorage.setItem("left_panel_color", JSON.stringify(user_theme_setting?.left_panel_color));
        localStorage.setItem("right_panel_color", JSON.stringify(user_theme_setting?.right_panel_color));

        if (type.includes("Administrateur")) {
          navigate("/admin-dashboard");
        } else if (type.includes("Assureur")) {
          navigate("/insurers-dashboard");
        } else if (type.includes("Courtier")) {
          navigate("/courtier-dashboard");
        } else if (type.includes("Gestionnaire ACS")) {
          navigate("/manager-dashboard");
        }

        else {
          console.error("Unknown user role");
        }
      } else {
        setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
      }
    } catch (error) {
      setFlashMessage({ type: "error", message: t("somethingWentWrong") });
    }
  };

  const RoleList = async () => {
    try {
      const response = await LoginService.role_list();
      if (response.data.status) {
        setRoleList(response.data.roles);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const SignUp = async (e) => {
    e.preventDefault();

    try {
      var useData = {
        first_name: e.target.elements.firstName.value ?? "",
        last_name: e.target.elements.lastName.value ?? "",
        email: e.target.elements.email.value ?? "",
        password: e.target.elements.password.value ?? "",
        role: role ?? "",
      };

      const response = await LoginService.signup(useData);
      if (response.data.status) {
        setShow(false);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setRole(e.target.value);
  };

  return (
    <Fragment>
      <Container className="p-0 login-container" fluid>
        <div className="login-header">
        <img className="login-logo" src={"images/login-logo-new.png"} />
        </div>
        <Row className="m-0">
          {/* <Col className="p-0" lg={6}>
            <div className="left-column"></div>
          </Col> */}
          <Col className="p-0" lg={12}>
            <div className="right-column">
                <div className="login-top-logo">
                  <img className="login-logo" src={"images/panel-logo.png"} />
                </div>
              <h2 className="text-center">{t("loginTitle")}</h2>
              <div className="login-wrapper">
                <Form onSubmit={Login}>
                  {flashMessage.message && (
                    <div
                      className={`alert ${flashMessage.type === "success" ? "alert-success" : "alert-danger"
                        } text-center`}
                      role="alert"
                    >
                      {flashMessage.message}
                    </div>
                  )}
                  <Form.Group controlId="formBasicEmail" required>
                    <Form.Label>{t("emailLabel")} <span>*</span></Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="ex : jean.dupont@email.com"
                      name="email"
                    />
                  </Form.Group>

                  <Form.Group className="relative" controlId="formBasicPassword">
                    <Form.Label>{t("passwordLabel")} <span>*</span></Form.Label>
                    <Form.Control
                      type={passwordShow ? "text" : "password"}
                      placeholder={t("passwordLabel")}
                      name="password"
                    />
                    <Link className={passwordShow ? "eye-icon show" : "eye-icon"} onClick={() => setPasswordShow(!passwordShow)}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 6.5C15.79 6.5 19.17 8.63 20.82 12C19.17 15.37 15.8 17.5 12 17.5C8.2 17.5 4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5C10.62 14.5 9.5 13.38 9.5 12C9.5 10.62 10.62 9.5 12 9.5ZM12 7.5C9.52 7.5 7.5 9.52 7.5 12C7.5 14.48 9.52 16.5 12 16.5C14.48 16.5 16.5 14.48 16.5 12C16.5 9.52 14.48 7.5 12 7.5Z"
                          fill="#103553"
                        />
                      </svg>
                    </Link>
                  </Form.Group>

                  <Button className="w-100" variant="primary" type="submit">
                    {t("loginButton")}
                  </Button>
                  <div className="text-center mt-4">
                    <Link
                      to="/forgot-password"
                      className="forgot-password common-link text-center"
                    >
                      {t("forgotPassword")}
                    </Link>
                  </div>
                </Form>
              </div>

              <div className="text-center mt-4 make-account-inner">
                <Link
                  onClick={handleShow}
                  to="/"
                  className="make-account common-link text-center"
                >
                  {t("requestAccount")}
                </Link>
                <Offcanvas
                  className="account-request-pannel"
                  placement="end"
                  show={show}
                  onHide={handleClose}
                >
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title>
                      {t("accountRequestTitle")}
                    </Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body>
                    <h2>Votre demande de compte</h2>
                    <Form onSubmit={SignUp}>
                      <Form.Group controlId="firstName">
                        <Form.Label>{t("firstName")} <span>*</span></Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t("firstName")}
                          name="firstName"
                        />
                      </Form.Group>

                      <Form.Group controlId="lastName">
                        <Form.Label>{t("lastName")} <span>*</span></Form.Label>
                        <Form.Control
                          type="text"
                          placeholder={t("lastName")}
                          name="lastName"
                        />
                      </Form.Group>

                      <Form.Group controlId="emailid">
                        <Form.Label>{t("emailLabel")} <span>*</span></Form.Label>
                        <Form.Control
                          type="email"
                          placeholder={t("ex : jean.dupont@email.com")}
                          name="email"
                        />
                      </Form.Group>

                      <Form.Group controlId="password">
                        <Form.Label>{t("passwordLabel")} <span>*</span></Form.Label>
                        <Form.Control
                          type="password"
                          placeholder={t("passwordLabel")}
                          name="password"
                        />
                      </Form.Group>

                      <Form.Group controlId="registeras">
                        <Form.Label>{t("registerAs")} <span>*</span></Form.Label>
                        <Form.Select
                          aria-label={t("statusSelectAria")}
                          value={role}
                          onChange={handleChange}
                        >
                          <option value="" disabled>
                            {t("selectRoleLabel")}
                          </option>
                          {roleList?.length > 0 ?
                            roleList?.map((role) => (
                              <option value={role}>{role}</option>
                            )) : (
                              <option value="">{t("NorecordsfoundLabel")}</option>
                            )
                          }
                        </Form.Select>
                      </Form.Group>

                      <div className="canvas-footer text-end">
                        <Button variant="primary" type="submit">
                          {t("submitButton")}
                        </Button>
                      </div>
                    </Form>
                  </Offcanvas.Body>
                </Offcanvas>
              </div>
            </div>
          </Col>
        </Row>

        {/* Language Selector Dropdown */}
        <select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          style={{ display: "none" }}
          hidden
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </Container>
    </Fragment>
  );
};

export default Login;
