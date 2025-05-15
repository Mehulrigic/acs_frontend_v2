import React, { Fragment, useEffect, useState } from "react";
import SidePanel from "../../Components/SidePanel/SidePanel";
import Table from "react-bootstrap/Table";
import { useTranslation } from "react-i18next";
import logo from "../../acs-logo.png"
import RoleManagementService from "../../API/RoleManagement/RoleManagementService";
import Loading from "../../Common/Loading";
import { Link, useNavigate } from "react-router-dom";
import { Button, Modal, Form, Offcanvas } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ProfileManagementService from "../../API/ProfileManagement/ProfileManagementService";
import { SketchPicker } from "react-color";

const RoleManagementList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [roleManagementList, setRoleManagementList] = useState([]);
  const [logoImageShow, setLogoImageShow] = useState("");
  const [logoImageShowIn, setLogoImageShowIn] = useState("");
  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
  const [rightPanelThemeColorIn, setRightPanelThemeColorIn] = useState("");
  const [leftPanelThemeColorIn, setLeftPanelThemeColorIn] = useState("");
  const [buttonColorIn, setButtonColorIn] = useState("");
  
  const [logoImage, setLogoImage] = useState(null);
  const [logoWidth, setLogoWidth] = useState(null);
  const [logoHeight, setLogoHeight] = useState(null);
  const [logoChange, setLogoChange] = useState(false);
  const [sort, setSort] = useState({ key: "created_at", value: "desc" });
  const [isRotated, setIsRotated] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [roleDeleteValue, setRoleDeleteValue] = useState("");
  const [showmodal, setShowmodal] = useState(false);
  const handleModalClose = () => setShowmodal(false);
  const handleModalShow = () => setShowmodal(true);
  const [flashMessageTheme, setFlashMessageTheme] = useState({ type: "", message: "" });
  const handleCloseTheme = () => {
    setThemeSetting(false);
    setLogoChange(false);
  };
  const [themeSetting, setThemeSetting] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    if (flashMessageTheme.message) {
      const timer = setTimeout(() => {
        setFlashMessageTheme({ type: "", message: "" });
      }, 2000); // Adjust time as needed
      return () => clearTimeout(timer);
    }
  }, [flashMessageTheme]);

  useEffect(() => {
    const userRole = JSON.parse(localStorage.getItem("userRole"));
    const token = localStorage.getItem("authToken");
    if (token && userRole.includes("Administrateur")) {
      const logo_image = JSON.parse(localStorage.getItem("logo_image"));
      const right_panel_color = JSON.parse(localStorage.getItem("right_panel_color"));

      setLogoImageShow(logo_image);
      setRightPanelThemeColor(right_panel_color);
      RoleManagementList(sort);
    } else {
      navigate("/");
    }
  }, [sort]);

  useEffect(() => {
    if(logoChange){
      if(logoWidth !== "" || logoHeight !== ""){
        setLogoWidth(logoWidth);
        setLogoHeight(logoHeight);
      }
    }
  }, [logoChange, logoWidth, logoHeight]);

  const RoleManagementList = async (sort) => {
    setIsLoading(true);
    try {
      var userData = {
        sort: {
          key: sort.key,
          value: sort.value
        }
      };
      const roleresponse = await RoleManagementService.role_list(userData);
      if (roleresponse.data.status) {
        setIsLoading(false);
        setRoleManagementList(roleresponse.data.role.data);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const handleClickRotate = (column) => {
    const direction = sort.key === column ? (sort.value === "desc" ? "asc" : "desc") : "asc";
    setSort({ key: column, value: direction });
    setIsRotated(!isRotated); // Toggle the class on click
  };

  const HandleChangeDeletePermission = (id, status) => {
    setRoleId(id);
    setRoleDeleteValue(status);
    handleModalShow();
  };

  const HandleDeletePermission = async () => {
    try {
      var useData = {
        can_delete_folder: roleDeleteValue == 1 ? "0" : "1",
      };
      const response = await RoleManagementService.folder_delete_permision(roleId, useData);
      if (response.data.status) {
        localStorage.setItem("can_delete_folder", roleDeleteValue == 1 ? "0" : "1");
        setRoleDeleteValue("");
        handleModalClose();
        RoleManagementList(sort);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleThemeModal = async (role) => {
    setThemeSetting(true);
    setRole(role);
    ShowThemeSetting(role);
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const themeData = {
        left_panel_color: leftPanelThemeColorIn,
        right_panel_color: rightPanelThemeColorIn,
        logo_image: logoImage,
        button_color: buttonColorIn,
        logo_width: logoWidth,
        logo_height: logoHeight,
        role: role
      };

      console.log(themeData)
      const response = await ProfileManagementService.update_theme_setting(themeData);
      if (response.data.status) {
        setIsLoading(false);
        setLogoChange(false);
        ShowThemeSetting(role);
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
        return false;

      }
    } catch (error) {
      setIsLoading(false)
      console.log(error);
    }
  };

  const ShowThemeSetting = async (role) => {
    setIsLoading(true);
    try {
      var userDate = {
        role: role
      }
      const response = await ProfileManagementService.show_theme_setting(userDate);
      if (response.data.status) {
        setIsLoading(false);
        setLogoImageShowIn(response.data.data.logo_image);
        setRightPanelThemeColorIn(response.data.data.right_panel_color);
        setLeftPanelThemeColorIn(response.data.data.left_panel_color);
        setButtonColorIn(response.data.data.button_color);
        setLogoWidth(response.data.data.logo_width);
        setLogoHeight(response.data.data.logo_height);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const handleChangeLeftPanel = (color) => {
    setLeftPanelThemeColorIn(color.hex);
  };

  const handleChangeRightPanel = (color) => {
    setRightPanelThemeColorIn(color.hex);
  };

  const handleChangeButtonColor = (color) => {
    setButtonColorIn(color.hex);
  };

  useEffect(() => {
    const preventDropOutside = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener("dragover", preventDropOutside);
    window.addEventListener("drop", preventDropOutside);

    return () => {
      window.removeEventListener("dragover", preventDropOutside);
      window.removeEventListener("drop", preventDropOutside);
    };
  }, []);

  return (
    <Fragment>
      <style> {` button.btn.btn-primary  { background-color: ${localStorage.getItem('button_color') ? JSON.parse(localStorage.getItem('button_color')) : "#e84455"} !Important};`} </style>

      <SidePanel sidebarLogo={`${process.env.REACT_APP_IMAGE_URL}/${logoImageShow}`} />
      <div className="dashboard-main-content user-management" style={{ backgroundColor: rightPanelThemeColor}}>
        <h1 className="mb-5">{t("RoleManagement")}</h1>
        <div className="table-wrapper mt-16">
          {isLoading ? <Loading /> :
            <div className="table-wrap mt-24">
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>
                      <div className="d-flex align-items-center">
                        <span>{t("nameLabel")}</span>
                        <Link
                          className={`sorting-icon ms-2`}
                          onClick={() => handleClickRotate("name")}
                        >
                          {sort.value === "asc" &&
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                              <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fill-opacity="0.5" />
                            </svg>
                          }

                          {sort.value === "desc" &&
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fill-opacity="0.5" />
                              <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                            </svg>
                          }
                        </Link>
                      </div>
                    </th>
                    <th>Peut supprimer le dossier</th>
                    <th>{t("themesetting")}</th>
                  </tr>
                </thead>
                <tbody>
                  {roleManagementList?.length > 0 ?
                    roleManagementList?.map((data, index) => (
                      <tr>
                        <td>{index + 1}</td>
                        <td className="bold-font">{data.name}</td>
                        <td>
                          {data.can_delete_folder == 1 ?
                            <span className="verified badges" onClick={() => HandleChangeDeletePermission(data.id, data.can_delete_folder)} style={{ cursor: "pointer" }}>Oui</span>
                            :
                            <span className="incomplete badges" onClick={() => HandleChangeDeletePermission(data.id, data.can_delete_folder)} style={{ cursor: "pointer" }}>Non</span>
                          }
                        </td>
                        <td className="bold-font">

                          {data.name == 'Administrateur' ? '' :
                            <Link className="edit"
                              onClick={(e) => handleThemeModal(data.name)}>
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.059 9.02L14.979 9.94L5.91902 19H4.99902V18.08L14.059 9.02ZM17.659 3C17.409 3 17.149 3.1 16.959 3.29L15.129 5.12L18.879 8.87L20.709 7.04C21.099 6.65 21.099 6.02 20.709 5.63L18.369 3.29C18.169 3.09 17.919 3 17.659 3ZM14.059 6.19L2.99902 17.25V21H6.74902L17.809 9.94L14.059 6.19Z"
                                  fill="#e84455"
                                />
                              </svg>
                            </Link>

                          }

                        </td>
                      </tr>
                    ))
                    :
                    (
                      <tr style={{ textAlign: "center" }}>
                        <td colSpan="2">
                          {t("NorecordsfoundLabel")}
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </Table>
            </div>}
        </div>
      </div>

      {/* Confirmation Popup */}
      <Modal className='missing-doc-modal' show={showmodal} onHide={() => setShowmodal(true)}>
        <Modal.Header closeButton onHide={handleModalClose}>
          <Modal.Title>
            <h2>Confirmer la supprimer dossier</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span className="complete-process">
            Êtes-vous sûr de vouloir mettre à jour l'autorisation de suppression de dossier?
          </span>
        </Modal.Body>
        <Modal.Footer>
          <div className="text-end">
            <Button variant="primary" onClick={() => HandleDeletePermission()}>
              {t("confirmbtnLabel")}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <Offcanvas
        className="account-request-pannel"
        placement="end"
        show={themeSetting}
        onHide={handleCloseTheme}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            {t("themesetting")}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Row>
            <h2>{role}</h2>
            <Col xl={12} className="mb-3">
              <Form.Label className="mb-4">Logo du thème
              </Form.Label>
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
                <div 
                  className="custom-upload-box"
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = e.dataTransfer.files;
                    if (files.length) {
                      handleFileUpload({ target: { files } });
                    }
                  }}
                >
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
              {/* <div className="d-flex gap-2 mt-3">
                <Form.Group controlId="logoWidth">
                  <Form.Label>Width (px)</Form.Label>
                  <Form.Control disabled={!logoChange} type="number" min="1" placeholder="Width" onChange={(e) => setLogoWidth(e.target.value)} />
                </Form.Group>

                <Form.Group controlId="logoHeight">
                  <Form.Label>Height (px)</Form.Label>
                  <Form.Control disabled={!logoChange} type="number" min="1" placeholder="Height" onChange={(e) => setLogoHeight(e.target.value)} />
                </Form.Group>
              </div>
              <div className="image-preview">
                <img src={logoChange ? logoImage : `${process.env.REACT_APP_IMAGE_URL}/${logoImageShowIn}`} className="mt-3" alt="Uploaded Logo" style={{ maxWidth: "100%" }} />
              </div> */}
              <div className="d-flex align-items-center gap-3 mt-3">
                {/* Width Input */}
                <div className="d-flex  gap-3" style={{width: "50%"}}>
                  <Form.Group controlId="logoWidth" className="flex-grow-1" style={{width: "25%"}}>
                    <Form.Label>Width (px)</Form.Label>
                    <Form.Control
                      disabled={!logoChange}
                      type="number"
                      min="1"
                      placeholder="Width"
                      onChange={(e) => setLogoWidth(e.target.value)}
                    />
                  </Form.Group>

                  {/* Height Input */}
                  <Form.Group controlId="logoHeight" className="flex-grow-1" style={{width: "25%"}}>
                    <Form.Label>Height (px)</Form.Label>
                    <Form.Control
                      disabled={!logoChange}
                      type="number"
                      min="1"
                      placeholder="Height"
                      onChange={(e) => setLogoHeight(e.target.value)}
                    />
                  </Form.Group>
                </div>
                <div className="mt-3" style={{width: "50%", textAlign: "center", height: "100px"}}>
                  {/* Image Preview */}
                    <img
                      src={logoChange ? logoImage : `${process.env.REACT_APP_IMAGE_URL}/${logoImageShowIn}`}
                      alt="Uploaded Logo"
                      style={{ marginTop: "24px", maxWidth: "85%", maxHeight: "100px", width: logoWidth  + "px", height: logoHeight + "px", borderRadius: "8px", border: "1px solid #c1cbd4"}}
                    />
                </div>
              </div>

            </Col>
            <Col xl={12} className="mb-3 mt-5">
              <Row>
                <Col xl={4} className="mb-3">
                  <Form.Label className="mb-2 role-label">Couleur du panneau latéral</Form.Label>
                  <SketchPicker
                    width="auto"
                    color={leftPanelThemeColorIn}
                    onChangeComplete={handleChangeLeftPanel}
                  />
                  <div
                    style={{
                      marginTop: "20px",
                      width: "50px",
                      height: "50px",
                      backgroundColor: leftPanelThemeColorIn,
                      border: "1px solid #ccc",
                    }}
                  ></div>
                </Col>
                <Col xl={4} className="mb-3">
                  <Form.Label className="mb-2 role-label">Couleur du panneau principal</Form.Label>
                  <SketchPicker
                    width="auto"
                    color={rightPanelThemeColorIn}
                    onChangeComplete={handleChangeRightPanel}
                  />
                  <div
                    style={{
                      marginTop: "20px",
                      width: "50px",
                      height: "50px",
                      backgroundColor: rightPanelThemeColorIn,
                      border: "1px solid #ccc",
                    }}
                  ></div>
                </Col>
                <Col xl={4} className="mb-3">
                  <Form.Label className="mb-2 role-label">Couleur du bouton</Form.Label>
                  <SketchPicker
                    width="auto"
                    color={buttonColorIn}
                    onChangeComplete={handleChangeButtonColor}
                  />
                  <div
                    style={{
                      marginTop: "20px",
                      width: "50px",
                      height: "50px",
                      backgroundColor: buttonColorIn,
                      border: "1px solid #ccc",
                    }}
                  ></div>
                </Col>
              </Row>
            </Col>
          </Row>
          <Button className="mt-4 d-inline" variant="primary" onClick={(e) => handleSubmit(e)}>
            {t("saveChangesLabel")}
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </Fragment>
  );
};

export default RoleManagementList;