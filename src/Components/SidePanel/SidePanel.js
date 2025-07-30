import React, { Fragment, useEffect, useState } from "react";
import "./SidePanel.css";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import LoginService from "../../API/Login/LoginService";
import Loading from "../../Common/Loading";

const SidePanel = ({ sidebarLogo, backgroundColor, leftPanelChange, logoChange , logoImage, logoWidth, logoHeight}) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location (URL)
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const [userRole, setUserRole] = useState("");
  const [leftPanelThemeColor, setLeftPanelThemeColor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newLogoChange, setNewLogoChange] = useState("");
  const [logoNewWidth, setLogoNewWidth] = useState("");
  const [logoNewheight, setLogoNewheight] = useState("");

  const isActive = location.pathname === "/insurers-file" || location.pathname.startsWith("/file-details/");

  useEffect(() => {
    if (localStorage.getItem("userRole")) {
      const userRole = JSON.parse(localStorage.getItem("userRole"));
      const left_panel_color = JSON.parse(localStorage.getItem("left_panel_color"));
      const logo_width = localStorage.getItem("logo_width") ? JSON.parse(localStorage.getItem("logo_width")) : "85%";
      const logo_height = localStorage.getItem("logo_height") ? JSON.parse(localStorage.getItem("logo_height")) : "100px";
      setLeftPanelThemeColor(left_panel_color);
      setLogoNewWidth(logo_width);
      setLogoNewheight(logo_height);
      setUserRole(userRole);
    }
  }, []);

  useEffect(() => {
    if(logoChange && logoImage){
      setNewLogoChange(logoImage);
      if(logoWidth || logoHeight){
        setLogoNewWidth(logoWidth);
        setLogoNewheight(logoHeight);
      }
    }
  }, [logoChange, logoImage, logoWidth, logoHeight]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const Logout = async () => {
    setIsLoading(true);
    try {
      const response = await LoginService.logout();
      if (response.data.status) {
        navigate("/");
        setIsLoading(false);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
        localStorage.removeItem("logo_image");
        localStorage.removeItem("left_panel_color");
        localStorage.removeItem("right_panel_color");
        localStorage.removeItem("total_proceed");
        localStorage.clear();
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      localStorage.clear();
    }
    localStorage.clear();
  };

  const [isToggled, setIsToggled] = useState(localStorage.getItem("isToggled") ? JSON.parse(localStorage.getItem("isToggled")) : false);

  const handleToggle = () => {
    setIsToggled(!isToggled);
    localStorage.setItem("isToggled", isToggled === true ? false : true);
  };

  useEffect(() => {
    const isToggled = JSON.parse(localStorage.getItem("isToggled"));
    if (isToggled) {
      document.body.classList.add("sidebar-toggle");
    } else {
      document.body.classList.remove("sidebar-toggle");
    }
    return () => {
      document.body.classList.remove("sidebar-toggle");
    };
  }, [isToggled]);

  return (
    <Fragment>
      {isLoading && 
        <div className="loading-overlay">
          <Loading />
        </div>
      }
      <div className={`side-panel-container ${isOpen ? "open" : ""}`} style={{ backgroundColor: leftPanelChange ? backgroundColor : leftPanelThemeColor }}>
        <div className="top-section">
          <div className="logo-section">
            <img className="main-logo" src={logoChange ? newLogoChange : sidebarLogo} alt="logo" style={{width: logoNewWidth + "px", height: logoNewheight + "px"}} />
            {/* <img src={panelsidebarLogo} alt="logo" /> */}
            <img className="panel-logo" src={"../images/panel-logo.png"} />
            <div onClick={handleToggle}
              className={`side-panel-canvas ${isToggled ? "toggled" : ""}`}
            >
              <span className="arrow" />
            </div>
          </div>
          <div className="link-section">
            <ul>
              {/* Admin */}
              {userRole == "Administrateur" &&
                <Fragment>
                  <li title={t("dashboard")} className={location.pathname === "/admin-dashboard" ? "active" : location.pathname.startsWith("/admin-file-detail/") ? 'active' : ''}>
                    <Link to="/admin-dashboard"><svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M21.4498 10.275L11.9998 3.1875L2.5498 10.275L2.9998 11.625H3.7498V20.25H20.2498V11.625H20.9998L21.4498 10.275ZM5.2498 18.75V10.125L11.9998 5.0625L18.7498 10.125V18.75H14.9999V14.3333L14.2499 13.5833H9.74988L8.99988 14.3333V18.75H5.2498ZM10.4999 18.75H13.4999V15.0833H10.4999V18.75Z" fill="#fff" />
                    </svg>
                      <span className="menu-title">{t("dashboard")} {`(${localStorage.getItem("admin_dashboard") || 0})`}</span></Link>
                  </li>
                  <li title={t("RoleManagement")} className={location.pathname === "/role-management" ? "active" : ""}>
                    <Link to="/role-management">
                      <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="6" r="4" stroke="#fff" stroke-width="1.5" />
                        <ellipse cx="12" cy="17" rx="7" ry="4" stroke="#fff" stroke-width="1.5" />
                      </svg>
                      <span className="menu-title">{t("RoleManagement")}</span></Link>
                  </li>
                  <li title={t("userManagementLabel")} className={location.pathname === "/user-management" ? "active" : ""}>
                    <Link className="fill-svg" to="/user-management">
                      <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 19H1V18C1 16.1362 2.27477 14.57 4 14.126M6 10.8293C4.83481 10.4175 4 9.30623 4 8.00001C4 6.69379 4.83481 5.58255 6 5.17072M21 19H23V18C23 16.1362 21.7252 14.57 20 14.126M18 5.17072C19.1652 5.58255 20 6.69379 20 8.00001C20 9.30623 19.1652 10.4175 18 10.8293M10 14H14C16.2091 14 18 15.7909 18 18V19H6V18C6 15.7909 7.79086 14 10 14ZM15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8Z" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>

                      <span className="menu-title">{t("userManagementLabel")}</span></Link>
                  </li>

                  <li title="Bloc logique" className={location.pathname === "/logical-block" ? "active" : ""}>
                    <Link to="/logical-block">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="12,2 22,12 12,22 2,12" stroke="#fff" stroke-width="2" fill="none" />
                        <text x="12" y="16" text-anchor="middle" fill="#fff" font-size="10" font-family="Arial" font-weight="bold">IF</text>
                      </svg>
                      <span className="menu-title">Bloc logique</span></Link>
                  </li>

                  <li title={t("documentTypeLabel")} className={location.pathname === "/document-type" ? "active" : ""}>
                    <Link to="/document-type">
                      <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M15.6111 1.5837C17.2678 1.34703 18.75 2.63255 18.75 4.30606V5.68256C19.9395 6.31131 20.75 7.56102 20.75 9.00004V19C20.75 21.0711 19.0711 22.75 17 22.75H7C4.92893 22.75 3.25 21.0711 3.25 19V5.00004C3.25 4.99074 3.25017 4.98148 3.2505 4.97227C3.25017 4.95788 3.25 4.94344 3.25 4.92897C3.25 4.02272 3.91638 3.25437 4.81353 3.12621L15.6111 1.5837ZM4.75 6.75004V19C4.75 20.2427 5.75736 21.25 7 21.25H17C18.2426 21.25 19.25 20.2427 19.25 19V9.00004C19.25 7.7574 18.2426 6.75004 17 6.75004H4.75ZM5.07107 5.25004H17.25V4.30606C17.25 3.54537 16.5763 2.96104 15.8232 3.06862L5.02566 4.61113C4.86749 4.63373 4.75 4.76919 4.75 4.92897C4.75 5.10629 4.89375 5.25004 5.07107 5.25004ZM7.25 12C7.25 11.5858 7.58579 11.25 8 11.25H16C16.4142 11.25 16.75 11.5858 16.75 12C16.75 12.4143 16.4142 12.75 16 12.75H8C7.58579 12.75 7.25 12.4143 7.25 12ZM7.25 15.5C7.25 15.0858 7.58579 14.75 8 14.75H13.5C13.9142 14.75 14.25 15.0858 14.25 15.5C14.25 15.9143 13.9142 16.25 13.5 16.25H8C7.58579 16.25 7.25 15.9143 7.25 15.5Z" fill="#fff" />
                      </svg>
                      <span className="menu-title">{t("documentTypeLabel")}</span></Link>
                  </li>
                  <li title={t("SpeakerManagement")} className={location.pathname === "/speaker-management" ? "active" : ""} style={{ textWrap: "nowrap" }}>
                    <Link className="fill-svg" to="/speaker-management">
                      <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="6" r="4" stroke="#fff" stroke-width="1.5" />
                        <path d="M18 9C19.6569 9 21 7.88071 21 6.5C21 5.11929 19.6569 4 18 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" />
                        <path d="M6 9C4.34315 9 3 7.88071 3 6.5C3 5.11929 4.34315 4 6 4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" />
                        <ellipse cx="12" cy="17" rx="6" ry="4" stroke="#fff" stroke-width="1.5" />
                        <path d="M20 19C21.7542 18.6153 23 17.6411 23 16.5C23 15.3589 21.7542 14.3847 20 14" stroke="#fff" stroke-width="1.5" stroke-linecap="round" />
                        <path d="M4 19C2.24575 18.6153 1 17.6411 1 16.5C1 15.3589 2.24575 14.3847 4 14" stroke="#fff" stroke-width="1.5" stroke-linecap="round" />
                      </svg>
                      <span className="menu-title">{t("SpeakerManagement")}</span></Link>
                  </li>
                  <li title={t("Settings")} className={location.pathname === "/settings" ? "active" : ""}>
                    <Link to="/settings">
                      <svg fill="#fff" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"><path d="M19.9,12.66a1,1,0,0,1,0-1.32L21.18,9.9a1,1,0,0,0,.12-1.17l-2-3.46a1,1,0,0,0-1.07-.48l-1.88.38a1,1,0,0,1-1.15-.66l-.61-1.83A1,1,0,0,0,13.64,2h-4a1,1,0,0,0-1,.68L8.08,4.51a1,1,0,0,1-1.15.66L5,4.79A1,1,0,0,0,4,5.27L2,8.73A1,1,0,0,0,2.1,9.9l1.27,1.44a1,1,0,0,1,0,1.32L2.1,14.1A1,1,0,0,0,2,15.27l2,3.46a1,1,0,0,0,1.07.48l1.88-.38a1,1,0,0,1,1.15.66l.61,1.83a1,1,0,0,0,1,.68h4a1,1,0,0,0,.95-.68l.61-1.83a1,1,0,0,1,1.15-.66l1.88.38a1,1,0,0,0,1.07-.48l2-3.46a1,1,0,0,0-.12-1.17ZM18.41,14l.8.9-1.28,2.22-1.18-.24a3,3,0,0,0-3.45,2L12.92,20H10.36L10,18.86a3,3,0,0,0-3.45-2l-1.18.24L4.07,14.89l.8-.9a3,3,0,0,0,0-4l-.8-.9L5.35,6.89l1.18.24a3,3,0,0,0,3.45-2L10.36,4h2.56l.38,1.14a3,3,0,0,0,3.45,2l1.18-.24,1.28,2.22-.8.9A3,3,0,0,0,18.41,14ZM11.64,8a4,4,0,1,0,4,4A4,4,0,0,0,11.64,8Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,11.64,14Z" /></svg>
                      <span className="menu-title">{t("Settings")}</span></Link>
                  </li>
                  <li title={t("Task Management")} className={location.pathname === "/taskmanagement-dashboard" ? "active" : ""}>
                    <Link to="/taskmanagement-dashboard">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-file-earmark-font" viewBox="0 0 16 16">
                        <path d="M10.943 6H5.057L5 8h.5c.18-1.096.356-1.192 1.694-1.235l.293-.01v5.09c0 .47-.1.582-.898.655v.5H9.41v-.5c-.803-.073-.903-.184-.903-.654V6.755l.298.01c1.338.043 1.514.14 1.694 1.235h.5l-.057-2z" />
                        <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z" />
                      </svg>
                      <span className="menu-title">{t("Task Management")}</span></Link>
                  </li>
                  {/* <li className={location.pathname === "/preferred-document" ? "active" : ""}>
                    <Link to="/preferred-document">{t("preferredDocumentLabel")}</Link>
                  </li> */}
                </Fragment>
              }

              {/* Gestionnaire ACS ( ACS Manager ) */}
              {userRole == "Gestionnaire ACS" &&
                <Fragment>
                  <li className={location.pathname === "/manager-dashboard" ? "active" : ""} title={t("tobetreat")}>
                    <Link to="/manager-dashboard">
                      <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M21.4498 10.275L11.9998 3.1875L2.5498 10.275L2.9998 11.625H3.7498V20.25H20.2498V11.625H20.9998L21.4498 10.275ZM5.2498 18.75V10.125L11.9998 5.0625L18.7498 10.125V18.75H14.9999V14.3333L14.2499 13.5833H9.74988L8.99988 14.3333V18.75H5.2498ZM10.4999 18.75H13.4999V15.0833H10.4999V18.75Z" fill="#fff" />
                      </svg>
                      <span className="menu-title">{t("tobetreat")} {`(${localStorage.getItem("total_proceed") || 0})`}</span>
                    </Link>
                  </li>
                  <li title={t("folders")} className={location.pathname === "/manager-files" ? "active" : location.pathname.startsWith("/manager-file-detail/") ? 'active' : ''}>
                    <Link to="/manager-files">
                      <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M15.6111 1.5837C17.2678 1.34703 18.75 2.63255 18.75 4.30606V5.68256C19.9395 6.31131 20.75 7.56102 20.75 9.00004V19C20.75 21.0711 19.0711 22.75 17 22.75H7C4.92893 22.75 3.25 21.0711 3.25 19V5.00004C3.25 4.99074 3.25017 4.98148 3.2505 4.97227C3.25017 4.95788 3.25 4.94344 3.25 4.92897C3.25 4.02272 3.91638 3.25437 4.81353 3.12621L15.6111 1.5837ZM4.75 6.75004V19C4.75 20.2427 5.75736 21.25 7 21.25H17C18.2426 21.25 19.25 20.2427 19.25 19V9.00004C19.25 7.7574 18.2426 6.75004 17 6.75004H4.75ZM5.07107 5.25004H17.25V4.30606C17.25 3.54537 16.5763 2.96104 15.8232 3.06862L5.02566 4.61113C4.86749 4.63373 4.75 4.76919 4.75 4.92897C4.75 5.10629 4.89375 5.25004 5.07107 5.25004ZM7.25 12C7.25 11.5858 7.58579 11.25 8 11.25H16C16.4142 11.25 16.75 11.5858 16.75 12C16.75 12.4143 16.4142 12.75 16 12.75H8C7.58579 12.75 7.25 12.4143 7.25 12ZM7.25 15.5C7.25 15.0858 7.58579 14.75 8 14.75H13.5C13.9142 14.75 14.25 15.0858 14.25 15.5C14.25 15.9143 13.9142 16.25 13.5 16.25H8C7.58579 16.25 7.25 15.9143 7.25 15.5Z" fill="#fff" />
                      </svg>
                      <span className="menu-title">{t("folders")}</span>

                    </Link>
                  </li>
                </Fragment>
              }

              {/* Assureur ( Insurers ) */}
              {userRole == "Assureur" &&
                <Fragment>
                  <li title={t("dashboard")} className={location.pathname === "/insurers-dashboard" ? "active" : ""}>
                    <Link to="/insurers-dashboard">
                      <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M21.4498 10.275L11.9998 3.1875L2.5498 10.275L2.9998 11.625H3.7498V20.25H20.2498V11.625H20.9998L21.4498 10.275ZM5.2498 18.75V10.125L11.9998 5.0625L18.7498 10.125V18.75H14.9999V14.3333L14.2499 13.5833H9.74988L8.99988 14.3333V18.75H5.2498ZM10.4999 18.75H13.4999V15.0833H10.4999V18.75Z" fill="#fff" />
                      </svg>
                      <span className="menu-title">{t("dashboard")} {`(${localStorage.getItem("assureur_dashboard") || 0})`}</span>
                    </Link>
                  </li>
                  {/* <li className={location.pathname === "/document-type" ? "active" : ""}>
                    <Link to="/document-type">{t("documentTypeLabel")}</Link>
                  </li> */}
                  <li title={t("folders")} className={location.pathname === "/insurers-file" ? "active" : location.pathname.startsWith("/file-details/") ? 'active' : ''}>
                    <Link to="/insurers-file">
                      <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M15.6111 1.5837C17.2678 1.34703 18.75 2.63255 18.75 4.30606V5.68256C19.9395 6.31131 20.75 7.56102 20.75 9.00004V19C20.75 21.0711 19.0711 22.75 17 22.75H7C4.92893 22.75 3.25 21.0711 3.25 19V5.00004C3.25 4.99074 3.25017 4.98148 3.2505 4.97227C3.25017 4.95788 3.25 4.94344 3.25 4.92897C3.25 4.02272 3.91638 3.25437 4.81353 3.12621L15.6111 1.5837ZM4.75 6.75004V19C4.75 20.2427 5.75736 21.25 7 21.25H17C18.2426 21.25 19.25 20.2427 19.25 19V9.00004C19.25 7.7574 18.2426 6.75004 17 6.75004H4.75ZM5.07107 5.25004H17.25V4.30606C17.25 3.54537 16.5763 2.96104 15.8232 3.06862L5.02566 4.61113C4.86749 4.63373 4.75 4.76919 4.75 4.92897C4.75 5.10629 4.89375 5.25004 5.07107 5.25004ZM7.25 12C7.25 11.5858 7.58579 11.25 8 11.25H16C16.4142 11.25 16.75 11.5858 16.75 12C16.75 12.4143 16.4142 12.75 16 12.75H8C7.58579 12.75 7.25 12.4143 7.25 12ZM7.25 15.5C7.25 15.0858 7.58579 14.75 8 14.75H13.5C13.9142 14.75 14.25 15.0858 14.25 15.5C14.25 15.9143 13.9142 16.25 13.5 16.25H8C7.58579 16.25 7.25 15.9143 7.25 15.5Z" fill="#fff" />
                      </svg>
                      <span className="menu-title">{t("folders")}</span>
                    </Link>
                  </li>
                </Fragment>
              }

              {/* Courtier ( Broker ) */}
              {userRole == "Courtier" &&
                <Fragment>
                  <li title={t("dashboard")} className={location.pathname === "/courtier-dashboard" ? "active" : ""}>
                    <Link to="/courtier-dashboard">
                      <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M21.4498 10.275L11.9998 3.1875L2.5498 10.275L2.9998 11.625H3.7498V20.25H20.2498V11.625H20.9998L21.4498 10.275ZM5.2498 18.75V10.125L11.9998 5.0625L18.7498 10.125V18.75H14.9999V14.3333L14.2499 13.5833H9.74988L8.99988 14.3333V18.75H5.2498ZM10.4999 18.75H13.4999V15.0833H10.4999V18.75Z" fill="#fff" />
                      </svg>
                      <span className="menu-title">{t("dashboard")} {`(${localStorage.getItem("courtier_dashboard") || 0})`}</span>
                    </Link>
                  </li>
                  {/* <li className={location.pathname === "/document-type" ? "active" : ""}>
                    <Link to="/document-type">{t("documentTypeLabel")}</Link>
                  </li> */}
                  <li title={t("folders")} className={location.pathname === "/courtier-files" ? "active" : location.pathname.startsWith("/courtier-file-detail/") ? 'active' : ''}>
                    <Link to="/courtier-files">
                      <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M15.6111 1.5837C17.2678 1.34703 18.75 2.63255 18.75 4.30606V5.68256C19.9395 6.31131 20.75 7.56102 20.75 9.00004V19C20.75 21.0711 19.0711 22.75 17 22.75H7C4.92893 22.75 3.25 21.0711 3.25 19V5.00004C3.25 4.99074 3.25017 4.98148 3.2505 4.97227C3.25017 4.95788 3.25 4.94344 3.25 4.92897C3.25 4.02272 3.91638 3.25437 4.81353 3.12621L15.6111 1.5837ZM4.75 6.75004V19C4.75 20.2427 5.75736 21.25 7 21.25H17C18.2426 21.25 19.25 20.2427 19.25 19V9.00004C19.25 7.7574 18.2426 6.75004 17 6.75004H4.75ZM5.07107 5.25004H17.25V4.30606C17.25 3.54537 16.5763 2.96104 15.8232 3.06862L5.02566 4.61113C4.86749 4.63373 4.75 4.76919 4.75 4.92897C4.75 5.10629 4.89375 5.25004 5.07107 5.25004ZM7.25 12C7.25 11.5858 7.58579 11.25 8 11.25H16C16.4142 11.25 16.75 11.5858 16.75 12C16.75 12.4143 16.4142 12.75 16 12.75H8C7.58579 12.75 7.25 12.4143 7.25 12ZM7.25 15.5C7.25 15.0858 7.58579 14.75 8 14.75H13.5C13.9142 14.75 14.25 15.0858 14.25 15.5C14.25 15.9143 13.9142 16.25 13.5 16.25H8C7.58579 16.25 7.25 15.9143 7.25 15.5Z" fill="#fff" />
                      </svg>

                      <span className="menu-title">{t("folders")}</span>
                    </Link>
                  </li>
                </Fragment>
              }
            </ul>
          </div>
        </div>

        <div className="footer-section">
          <div className="manage-account d-flex align-items-center" title={t("manageProfile")}>
            <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6ZM12 16C14.7 16 17.8 17.29 18 18H6C6.23 17.28 9.31 16 12 16ZM12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white"/>
            </svg>
            </div>
            <div className="redirection">
              <Link to="/my-account">{t("manageProfile")}</Link>
            </div>
          </div>
          <div className="log-out d-flex align-items-center"  title={t("logOut")}>
            <div className="icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17 8L15.59 9.41L17.17 11H9V13H17.17L15.59 14.58L17 16L21 12L17 8ZM5 5H12V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H12V19H5V5Z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="redirection">
              <Link onClick={() => Logout()}>{t("logOut")}</Link>
            </div>
          </div>
        </div>
      </div>
      <button className="toggle-button" onClick={toggleSidebar}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 12H21M3 6H21M3 18H21"
            stroke="#272E2D"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </Fragment>
  );
};

export default SidePanel;
