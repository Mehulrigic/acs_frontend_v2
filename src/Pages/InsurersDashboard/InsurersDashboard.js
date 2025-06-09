import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SidePanel from "../../Components/SidePanel/SidePanel";
import "./InsurersDashboard.css";
import StatisticsData from "../../Components/StatisticsData/StatisticsData";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import AddfolderPanel from "../../Components/AddfolderPanel/AddfolderPanel";
import DashboardManagementService from "../../API/DashboardManagement/DashboardManagementService";
import logo from "../../ass-logo.png";
import Paginations from "../../Components/Paginations/Paginations";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Loading from "../../Common/Loading";
import { Tab,Tabs } from 'react-bootstrap';


const InsurersDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [userDocumentData, setUserDocumentData] = useState([]);
  const [statisticsData, setStatisticsData] = useState({});
  const [editUserStatus, setEditUserStatus] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [logoImageShow, setLogoImageShow] = useState("");
  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
  const [isRotated, setIsRotated] = useState(false);
  const [sort, setSort] = useState({ key: "created_at", value: "desc" });
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [deletePermission, setDeletePermission] = useState(false);
  const [showFolderId, setShowFolderId] = useState("");

  const [showAddcol, setShowAddcol] = useState(false);
  const handleAddcolClose = () => setShowAddcol(false);
  const handleAddcolShow = () => setShowAddcol(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const [editUserSiteStatus, setEditUserSiteStatus] = useState("");

  const [modalColumns, setModalColumns] = useState({
    fileNumber: true,
    // client: true,
    "Nom du preneur d'assurance": true,
    brokerlabel: true,
    "Date de création": true,
    lastModifiedDateLabel: true,
    "Date de début de chantier": true,
    "Date de fin de chantier": true,
    status: true,
    "Etat du chantier": true,
  });

  const [selectedColumns, setSelectedColumns] = useState(
    Object.keys(modalColumns).filter((key) => modalColumns[key])
  );

  useEffect(() => {
    if(deletePermission){
      setModalColumns((prev) => ({
        ...prev,
        Action: true,
      }));
      const newSelectedColumns = Object.keys(modalColumns).filter(
        (key) => modalColumns[key]
      );
      newSelectedColumns.push("Action");
      setSelectedColumns(newSelectedColumns);
    }
  }, [deletePermission]);
  
  useEffect(() => {
    const userRole = JSON.parse(localStorage.getItem("userRole"));
    const token = localStorage.getItem("authToken");
    const can_delete_folder = localStorage.getItem("can_delete_folder");
    setDeletePermission(can_delete_folder == 1 ? true : false);
    if (token && userRole.includes("Assureur")) {
      const user = JSON.parse(localStorage.getItem("user"));
      const logo_image = JSON.parse(localStorage.getItem("logo_image"));
      const right_panel_color = JSON.parse(localStorage.getItem("right_panel_color"));
      setRightPanelThemeColor(right_panel_color);
      setLogoImageShow(logo_image);
      setUserRole(userRole);
      setUserName(user?.first_name + " " + user?.last_name);
      setUserId(user?.id);
      UserDocument(search, sort, currentPage, editUserStatus, activeTab, editUserSiteStatus);
    } else {
      navigate("/");
    }
  }, [sort]);

  useEffect(() => {
    const userRole = JSON.parse(localStorage.getItem("userRole"));
    const token = localStorage.getItem("authToken");
    const can_delete_folder = localStorage.getItem("can_delete_folder");
    setDeletePermission(can_delete_folder == 1 ? true : false);
    if (token && userRole.includes("Assureur")) {
      if (selectedMonth != "custom") {
        GetStatistics();
      }
    } else {
      navigate("/");
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (startDate) {
      GetStatistics();
    }
  }, [startDate]);

  const UserDocument = async (search, sort, page = 1, status, key, siteStatus) => {
    setIsLoading(true);
    try {
      var userData = {
        search: search ?? "",
        sort: {
          key: sort.key,
          value: sort.value
        },
        page,
        status: status ?? "",
        filter_type: key,
        site_status: siteStatus,
        tab_type: "dashboard"
      };
      const response = await DashboardManagementService.user_document(userData);
      if (response.data.status) {
        setIsLoading(false);
        setUserDocumentData(response.data.documents.data);
        setCurrentPage(response.data.documents.meta.current_page);
        setTotalPages(response.data.documents.meta.last_page);
        setTotalRecords(response.data.documents.meta.total);
        localStorage.setItem("assureur_dashboard", response.data.documents.meta.total);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const formatDate = (dateString) => {
    if(dateString){
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else {
      return "";
    }
  };

  const getFormattedDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(`${month}/${day}/${year}`); // Convert to MM/DD/YYYY format
  };

  const GetStatistics = async () => {
    setIsLoading(true);
    try {
      var userData = {
        filter_by: selectedMonth,
      };
      if (selectedMonth === "custom") {
        userData.filter_date = startDate ? startDate : "";
      }
      const response = await DashboardManagementService.get_statistics(
        userData
      );
      if (response.data) {
        setIsLoading(false);
        setStatisticsData(response.data);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const handleStatusChange = (status) => {
    setEditUserStatus(status);
    UserDocument(search, sort, 1, status, activeTab, editUserSiteStatus);
  };

  const handleSearchChange = (search) => {
    setSearch(search);
    UserDocument(search, sort, 1, editUserStatus, activeTab, editUserSiteStatus);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchChange(search);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    UserDocument(search, sort, page, editUserStatus, activeTab, editUserSiteStatus);
  };

  const handleCheckboxChange = (key) => {
    setModalColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddcolSubmit = () => {
    const newSelectedColumns = Object.keys(modalColumns).filter(
      (key) => modalColumns[key]
    );
    setSelectedColumns(newSelectedColumns);
    handleAddcolClose(); // Close the modal
  };

  const handleClickRotate = (column) => {
    const direction = sort.key === column  ? sort.value === "desc" ? "asc" : "desc" : "asc";
    setSort({ key: column, value: direction });
    setIsRotated(!isRotated); // Toggle the class on click
  };

  const HandleDeleteDocumentFile = async () => {
    try {
      const response = await DashboardManagementService.delete_user_document(showFolderId);
      if (response.data.status) {
        handleCloseDeleteModal();
        setShowFolderId("");
        UserDocument(search, sort, currentPage, editUserStatus, activeTab, editUserSiteStatus);
        GetStatistics();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const [activeTab, setActiveTab] = useState('toProcess');

  const handleTabSelect = (key) => {
    setActiveTab(key);
    UserDocument(search, sort, currentPage, editUserStatus, key, editUserSiteStatus);
  };

  const handleSiteStatusChange = (siteStatus) => {
    setEditUserSiteStatus(siteStatus);
    UserDocument(search, sort, 1, editUserStatus, activeTab, siteStatus);
  };

  return (
    <Fragment>
      <style> {` button.btn.btn-primary  { background-color: ${localStorage.getItem('button_color') ? JSON.parse(localStorage.getItem('button_color')) : "#e84455"} !Important};`} </style>

      <SidePanel
        sidebarLogo={
          (logoImageShow == "" || logoImageShow == null || logoImageShow == undefined)
            ? logo
            : `${process.env.REACT_APP_IMAGE_URL}/${logoImageShow}`
        }
      />
        <div className="dashboard-main-content insurers-dashboard" style={{ backgroundColor: rightPanelThemeColor }}>
          <div className="top-header">
            <h4>{t("dashboard")}</h4>
            <div className="mt-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-md-0 gap-3">
              <h1 className="m-0">{t("dashboard")}</h1>
              <AddfolderPanel
                userRole={userRole}
                userName={userName}
                userId={userId}
                search={search}
                sort={sort}
                currentPage={currentPage}
                editUserStatus={editUserStatus}
                UserDocument={UserDocument}
                GetStatistics={GetStatistics}
              />
            </div>
          </div>
        {isLoading ? <Loading /> :
          <>
            <StatisticsData
              statisticsData={statisticsData}
              startDate={startDate}
              setStartDate={setStartDate}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              getFormattedDate={getFormattedDate}
              formatDate={formatDate}
            />
            <Tabs
              id="controlled-tab-example"
              activeKey={activeTab}
              onSelect={handleTabSelect}
              className="mt-5"
            >
              <Tab
                title="À traiter"
                eventKey="toProcess"
              >
                <div className="table-wrapper mt-16 p-0">
                  <div className="d-md-flex align-items-center gap-2 justify-content-between">
                    <h2 className="mb-3 mb-md-0">
                      {t("toProcess", { count: totalRecords })}
                    </h2>
                    <Form.Group
                      className="relative"
                      controlId="exampleForm.ControlInput1"
                    >
                      <Form.Control
                        type="search"
                        placeholder="Rechercher"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyPress}
                      />
                      <div
                        className="search-icon"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSearchChange(search)}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.7549 11.2549H11.9649L11.6849 10.9849C12.6649 9.84488 13.2549 8.36488 13.2549 6.75488C13.2549 3.16488 10.3449 0.254883 6.75488 0.254883C3.16488 0.254883 0.254883 3.16488 0.254883 6.75488C0.254883 10.3449 3.16488 13.2549 6.75488 13.2549C8.36488 13.2549 9.84488 12.6649 10.9849 11.6849L11.2549 11.9649V12.7549L16.2549 17.7449L17.7449 16.2549L12.7549 11.2549ZM6.75488 11.2549C4.26488 11.2549 2.25488 9.24488 2.25488 6.75488C2.25488 4.26488 4.26488 2.25488 6.75488 2.25488C9.24488 2.25488 11.2549 4.26488 11.2549 6.75488C11.2549 9.24488 9.24488 11.2549 6.75488 11.2549Z"
                            fill="#998f90"
                          />
                        </svg>
                      </div>
                    </Form.Group>
                  </div>
                  <div className="table-wrap mt-24">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          {selectedColumns.includes("fileNumber") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("fileNumber")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("folder_name")}
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
                          }
                          {/* {selectedColumns.includes("client") &&
                        <th>
                          <div className="d-flex align-items-center">
                            <span>{t("client")}</span>
                            <Link
                              className={`sorting-icon ms-2`}
                              onClick={() => handleClickRotate("customer_name")}
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
                      } */}
                          {selectedColumns.includes("Nom du preneur d'assurance") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Nom du preneur d'assurance</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("insurance_policyholder_name")}
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
                          }
                          {selectedColumns.includes("brokerlabel") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("brokerlabel")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("broker.first_name")}
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
                          }
                          {selectedColumns.includes("Date de création") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de création</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("created_at")}
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
                          }
                          {selectedColumns.includes("lastModifiedDateLabel") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("lastModifiedDateLabel")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("updated_at")}
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
                          }
                          {selectedColumns.includes("Date de début de chantier") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de début de chantier</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("start_date")}
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
                          }
                          {selectedColumns.includes("Date de fin de chantier") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de fin de chantier</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("complete_date")}
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
                          }
                          {selectedColumns.includes("status") && (
                            <th className="select-drop elips-dropdown">
                              <div className="d-flex align-items-center">
                                <div>
                                  <Form.Select
                                    aria-label="statusSelectAria"
                                    value={editUserStatus}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                  >
                                    <option value="">{t("status")}</option>
                                    <option value="to_be_checked">{t("toBeCheckedLabel")}</option>
                                    <option value="transfer_to_manager">Transfert au Gestionnaire</option>
                                    <option value="transfer_to_broker">Transfert au Courtier</option>
                                    <option value="transfer_to_insurer">Transfert à l'assureur</option>
                                    <option value="formal_notice">Mise en demeure</option>
                                    <option value="to_be_decided">A statuer</option>
                                    <option value="validated">{t("validatedLabel")}</option>
                                    <option value="invalid">{t("invalidLabel")}</option>
                                  </Form.Select>
                                </div>
                                <div>
                                  <Link
                                    className={`sorting-icon ms-2`}
                                    onClick={() => handleClickRotate("status")}
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
                              </div>
                            </th>
                          )}
                          {selectedColumns.includes("Etat du chantier") &&
                            <th className="select-drop elips-dropdown">
                              <div className="d-flex align-items-center">
                                <div>
                                  <Form.Select aria-label="Etat du chantier" value={editUserSiteStatus} onChange={(e) => handleSiteStatusChange(e.target.value)}>
                                    <option value="">Etat du chantier</option>
                                    <option value="on_site">En cours de chantier</option>
                                    <option value="end_of_site">Fin de chantier</option>
                                  </Form.Select>
                                </div>
                                <div>
                                  <Link
                                    className={`sorting-icon ms-2`}
                                    onClick={() => handleClickRotate("site_status")}
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
                              </div>
                            </th>
                          }
                          {selectedColumns.includes("Action") && deletePermission && <th>Action</th>}
                          <th style={{ textAlign: "right" }}>
                            <Link onClick={handleAddcolShow}>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="black" />
                              </svg>
                            </Link>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(userDocumentData?.length > 0 && selectedColumns?.length > 0) ? (
                          userDocumentData?.map((data) => (
                            <tr key={data.id} onClick={() => navigate(`/file-details/${data.id}`)}>
                              {selectedColumns.includes("fileNumber") && (
                                <td className="bold-font">{data.folder_name}</td>
                              )}
                              {/* {selectedColumns.includes("client") && <td>{data.customer_name}</td>} */}
                              {selectedColumns.includes("Nom du preneur d'assurance") && <td>{data.insurance_policyholder_name}</td>}
                              {selectedColumns.includes("brokerlabel") && (
                                <td>
                                  {(data.broker?.first_name || data.broker?.last_name)
                                    ? `${data.broker?.first_name} ${data.broker?.last_name == null ? '': data.broker?.last_name }`
                                    : "Sans"}
                                </td>
                              )}
                              {selectedColumns.includes("Date de création") && <td>{data.created_at}</td>}
                              {selectedColumns.includes("lastModifiedDateLabel") && <td>{data.updated_at}</td>}
                              {selectedColumns.includes("Date de début de chantier") && <td className="bold-font">{data?.estimated_start_date}</td>}
                              {selectedColumns.includes("Date de fin de chantier") && <td className="bold-font">{data?.estimated_completion_date}</td>}
                              {selectedColumns.includes("status") && (
                                <td>
                                  {
                                    data.status === "to_be_checked" ? <span className="checked badges">{t("toBeCheckedLabel")}</span> :
                                    data.status === "transfer_to_manager" ? <span className="transfer badges">Transfert au Gestionnaire</span> :
                                    data.status === "transfer_to_broker" ? <span className="transfer badges">Transfert au Courtier</span> :
                                    data.status === "transfer_to_insurer" ? <span className="formal_notice badges">Transfert à l'assureur</span> :
                                    data.status === "formal_notice" ? <span className="formal_notice badges">Mise en demeure</span> :
                                    data.status === "to_be_decided" ? <span className="to_be_decided badges">A statuer</span> :
                                    data.status === "validated" ? <span className="verified badges">{t("validatedLabel")}</span> :
                                    <span className="incomplete badges">{t("invalidLabel")}</span>
                                  }
                                </td>
                              )}
                              {selectedColumns.includes("Etat du chantier") && <td>{data.site_status === "on_site" ? "En cours de chantier" : "Fin de chantier"}</td>}
                              {selectedColumns.includes("Action") && deletePermission && (
                                <td>
                                  <div className="action-btn" style={{ justifyContent: "center" }}>
                                    <Link
                                      className="delete"
                                      href="/user-management"
                                      data-discover="true"
                                      title="Supprimer"
                                      onClick={(e) => { e.stopPropagation(); handleShowDeleteModal(); setShowFolderId(data.id); }}
                                    >
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M16 9V19H8V9H16ZM14.5 3H9.5L8.5 4H5V6H19V4H15.5L14.5 3ZM18 7H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7Z"
                                          fill="#00366B"
                                        />
                                      </svg>
                                    </Link>
                                  </div>
                                </td>
                              )}
                              <td></td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="10" style={{ textAlign: "left" }}>
                              {t("NorecordsfoundLabel")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                  {totalRecords > 10 && (
                    <Paginations
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </Tab>
              <Tab
                title="Réceptions à venir"
                eventKey="receipts_to_come"
              >
                <div className="table-wrapper mt-16 p-0">
                  <div className="d-md-flex align-items-center gap-2 justify-content-between">
                    <h2 className="mb-3 mb-md-0">
                      <h2> Réceptions à venir  {`(` + totalRecords + `)`}</h2>
                    </h2>
                    <Form.Group
                      className="relative"
                      controlId="exampleForm.ControlInput1"
                    >
                      <Form.Control
                        type="search"
                        placeholder="Rechercher"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyPress}
                      />
                      <div
                        className="search-icon"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSearchChange(search)}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.7549 11.2549H11.9649L11.6849 10.9849C12.6649 9.84488 13.2549 8.36488 13.2549 6.75488C13.2549 3.16488 10.3449 0.254883 6.75488 0.254883C3.16488 0.254883 0.254883 3.16488 0.254883 6.75488C0.254883 10.3449 3.16488 13.2549 6.75488 13.2549C8.36488 13.2549 9.84488 12.6649 10.9849 11.6849L11.2549 11.9649V12.7549L16.2549 17.7449L17.7449 16.2549L12.7549 11.2549ZM6.75488 11.2549C4.26488 11.2549 2.25488 9.24488 2.25488 6.75488C2.25488 4.26488 4.26488 2.25488 6.75488 2.25488C9.24488 2.25488 11.2549 4.26488 11.2549 6.75488C11.2549 9.24488 9.24488 11.2549 6.75488 11.2549Z"
                            fill="#998f90"
                          />
                        </svg>
                      </div>
                    </Form.Group>
                  </div>
                  <div className="table-wrap mt-24">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          {selectedColumns.includes("fileNumber") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("fileNumber")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("folder_name")}
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
                          }
                          {/* {selectedColumns.includes("client") &&
                        <th>
                          <div className="d-flex align-items-center">
                            <span>{t("client")}</span>
                            <Link
                              className={`sorting-icon ms-2`}
                              onClick={() => handleClickRotate("customer_name")}
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
                      } */}
                          {selectedColumns.includes("Nom du preneur d'assurance") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Nom du preneur d'assurance</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("insurance_policyholder_name")}
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
                          }
                          {selectedColumns.includes("brokerlabel") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("brokerlabel")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("broker.first_name")}
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
                          }
                          {selectedColumns.includes("Date de création") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de création</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("created_at")}
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
                          }
                          {selectedColumns.includes("lastModifiedDateLabel") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("lastModifiedDateLabel")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("updated_at")}
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
                          }
                          {selectedColumns.includes("Date de début de chantier") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de début de chantier</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("start_date")}
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
                          }
                          {selectedColumns.includes("Date de fin de chantier") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de fin de chantier</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("complete_date")}
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
                          }
                          {selectedColumns.includes("status") && (
                            <th className="select-drop elips-dropdown">
                              <div className="d-flex align-items-center">
                                <div>
                                  <Form.Select
                                    aria-label="statusSelectAria"
                                    value={editUserStatus}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                  >
                                    <option value="">{t("status")}</option>
                                    <option value="to_be_checked">{t("toBeCheckedLabel")}</option>
                                    <option value="transfer_to_manager">Transfert au Gestionnaire</option>
                                    <option value="transfer_to_broker">Transfert au Courtier</option>
                                    <option value="transfer_to_insurer">Transfert à l'assureur</option>
                                    <option value="formal_notice">Mise en demeure</option>
                                    <option value="to_be_decided">A statuer</option>
                                    <option value="validated">{t("validatedLabel")}</option>
                                    <option value="invalid">{t("invalidLabel")}</option>
                                  </Form.Select>
                                </div>
                                <div>
                                  <Link
                                    className={`sorting-icon ms-2`}
                                    onClick={() => handleClickRotate("status")}
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
                              </div>
                            </th>
                          )}
                          {selectedColumns.includes("Etat du chantier") &&
                            <th className="select-drop elips-dropdown">
                              <div className="d-flex align-items-center">
                                <div>
                                  <Form.Select aria-label="Etat du chantier" value={editUserSiteStatus} onChange={(e) => handleSiteStatusChange(e.target.value)}>
                                    <option value="">Etat du chantier</option>
                                    <option value="on_site">En cours de chantier</option>
                                    <option value="end_of_site">Fin de chantier</option>
                                  </Form.Select>
                                </div>
                                <div>
                                  <Link
                                    className={`sorting-icon ms-2`}
                                    onClick={() => handleClickRotate("site_status")}
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
                              </div>
                            </th>
                          }
                          {selectedColumns.includes("Action") && deletePermission && <th>Action</th>}
                          <th style={{ textAlign: "right" }}>
                            <Link onClick={handleAddcolShow}>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="black" />
                              </svg>
                            </Link>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(userDocumentData?.length > 0 && selectedColumns?.length > 0) ? (
                          userDocumentData?.map((data) => (
                            <tr key={data.id} onClick={() => navigate(`/file-details/${data.id}`)}>
                              {selectedColumns.includes("fileNumber") && (
                                <td className="bold-font">{data.folder_name}</td>
                              )}
                              {/* {selectedColumns.includes("client") && <td>{data.customer_name}</td>} */}
                              {selectedColumns.includes("Nom du preneur d'assurance") && <td>{data.insurance_policyholder_name}</td>}
                              {selectedColumns.includes("brokerlabel") && (
                                <td>
                                  {(data.broker?.first_name || data.broker?.last_name)
                                    ? `${data.broker?.first_name} ${data.broker?.last_name == null ? '': data.broker?.last_name }`
                                    : "Sans"}
                                </td>
                              )}
                              {selectedColumns.includes("Date de création") && <td>{data.created_at}</td>}
                              {selectedColumns.includes("lastModifiedDateLabel") && <td>{data.updated_at}</td>}
                              {selectedColumns.includes("Date de début de chantier") && <td className="bold-font">{data?.estimated_start_date}</td>}
                              {selectedColumns.includes("Date de fin de chantier") && <td className="bold-font">{data?.estimated_completion_date}</td>}
                              {selectedColumns.includes("status") && (
                                <td>
                                  {
                                    data.status === "to_be_checked" ? <span className="checked badges">{t("toBeCheckedLabel")}</span> :
                                    data.status === "transfer_to_manager" ? <span className="transfer badges">Transfert au Gestionnaire</span> :
                                    data.status === "transfer_to_broker" ? <span className="transfer badges">Transfert au Courtier</span> :
                                    data.status === "transfer_to_insurer" ? <span className="formal_notice badges">Transfert à l'assureur</span> :
                                    data.status === "formal_notice" ? <span className="formal_notice badges">Mise en demeure</span> :
                                    data.status === "to_be_decided" ? <span className="to_be_decided badges">A statuer</span> :
                                    data.status === "validated" ? <span className="verified badges">{t("validatedLabel")}</span> :
                                    <span className="incomplete badges">{t("invalidLabel")}</span>
                                  }
                                </td>
                              )}
                              {selectedColumns.includes("Etat du chantier") && <td>{data.site_status === "on_site" ? "En cours de chantier" : "Fin de chantier"}</td>}
                              {selectedColumns.includes("Action") && deletePermission && (
                                <td>
                                  <div className="action-btn" style={{ justifyContent: "center" }}>
                                    <Link
                                      className="delete"
                                      href="/user-management"
                                      data-discover="true"
                                      title="Supprimer"
                                      onClick={(e) => { e.stopPropagation(); handleShowDeleteModal(); setShowFolderId(data.id); }}
                                    >
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M16 9V19H8V9H16ZM14.5 3H9.5L8.5 4H5V6H19V4H15.5L14.5 3ZM18 7H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7Z"
                                          fill="#00366B"
                                        />
                                      </svg>
                                    </Link>
                                  </div>
                                </td>
                              )}
                              <td></td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="10" style={{ textAlign: "left" }}>
                              {t("NorecordsfoundLabel")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                  {totalRecords > 10 && (
                    <Paginations
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </Tab>
              <Tab
                eventKey="receipts_past"
                title="Réceptions passées"
              >
                <div className="table-wrapper mt-16 p-0">
                  <div className="d-md-flex align-items-center gap-2 justify-content-between">
                    <h2 className="mb-3 mb-md-0">
                      <h2> Réceptions passées  {`(` + totalRecords + `)`}</h2>
                    </h2>
                    <Form.Group
                      className="relative"
                      controlId="exampleForm.ControlInput1"
                    >
                      <Form.Control
                        type="search"
                        placeholder="Rechercher"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyPress}
                      />
                      <div
                        className="search-icon"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSearchChange(search)}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.7549 11.2549H11.9649L11.6849 10.9849C12.6649 9.84488 13.2549 8.36488 13.2549 6.75488C13.2549 3.16488 10.3449 0.254883 6.75488 0.254883C3.16488 0.254883 0.254883 3.16488 0.254883 6.75488C0.254883 10.3449 3.16488 13.2549 6.75488 13.2549C8.36488 13.2549 9.84488 12.6649 10.9849 11.6849L11.2549 11.9649V12.7549L16.2549 17.7449L17.7449 16.2549L12.7549 11.2549ZM6.75488 11.2549C4.26488 11.2549 2.25488 9.24488 2.25488 6.75488C2.25488 4.26488 4.26488 2.25488 6.75488 2.25488C9.24488 2.25488 11.2549 4.26488 11.2549 6.75488C11.2549 9.24488 9.24488 11.2549 6.75488 11.2549Z"
                            fill="#998f90"
                          />
                        </svg>
                      </div>
                    </Form.Group>
                  </div>
                  <div className="table-wrap mt-24">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          {selectedColumns.includes("fileNumber") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("fileNumber")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("folder_name")}
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
                          }
                          {/* {selectedColumns.includes("client") &&
                        <th>
                          <div className="d-flex align-items-center">
                            <span>{t("client")}</span>
                            <Link
                              className={`sorting-icon ms-2`}
                              onClick={() => handleClickRotate("customer_name")}
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
                      } */}
                          {selectedColumns.includes("Nom du preneur d'assurance") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Nom du preneur d'assurance</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("insurance_policyholder_name")}
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
                          }
                          {selectedColumns.includes("brokerlabel") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("brokerlabel")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("broker.first_name")}
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
                          }
                          {selectedColumns.includes("Date de création") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de création</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("created_at")}
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
                          }
                          {selectedColumns.includes("lastModifiedDateLabel") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("lastModifiedDateLabel")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("updated_at")}
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
                          }
                          {selectedColumns.includes("Date de début de chantier") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de début de chantier</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("start_date")}
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
                          }
                          {selectedColumns.includes("Date de fin de chantier") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de fin de chantier</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("complete_date")}
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
                          }
                          {selectedColumns.includes("status") && (
                            <th className="select-drop elips-dropdown">
                              <div className="d-flex align-items-center">
                                <div>
                                  <Form.Select
                                    aria-label="statusSelectAria"
                                    value={editUserStatus}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                  >
                                    <option value="">{t("status")}</option>
                                    <option value="to_be_checked">{t("toBeCheckedLabel")}</option>
                                    <option value="transfer_to_manager">Transfert au Gestionnaire</option>
                                    <option value="transfer_to_broker">Transfert au Courtier</option>
                                    <option value="transfer_to_insurer">Transfert à l'assureur</option>
                                    <option value="formal_notice">Mise en demeure</option>
                                    <option value="to_be_decided">A statuer</option>
                                    <option value="validated">{t("validatedLabel")}</option>
                                    <option value="invalid">{t("invalidLabel")}</option>
                                  </Form.Select>
                                </div>
                                <div>
                                  <Link
                                    className={`sorting-icon ms-2`}
                                    onClick={() => handleClickRotate("status")}
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
                              </div>
                            </th>
                          )}
                          {selectedColumns.includes("Etat du chantier") &&
                            <th className="select-drop elips-dropdown">
                              <div className="d-flex align-items-center">
                                <div>
                                  <Form.Select aria-label="Etat du chantier" value={editUserSiteStatus} onChange={(e) => handleSiteStatusChange(e.target.value)}>
                                    <option value="">Etat du chantier</option>
                                    <option value="on_site">En cours de chantier</option>
                                    <option value="end_of_site">Fin de chantier</option>
                                  </Form.Select>
                                </div>
                                <div>
                                  <Link
                                    className={`sorting-icon ms-2`}
                                    onClick={() => handleClickRotate("site_status")}
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
                              </div>
                            </th>
                          }
                          {selectedColumns.includes("Action") && deletePermission && <th>Action</th>}
                          <th style={{ textAlign: "right" }}>
                            <Link onClick={handleAddcolShow}>
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 14 14"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="black" />
                              </svg>
                            </Link>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(userDocumentData?.length > 0 && selectedColumns?.length > 0) ? (
                          userDocumentData?.map((data) => (
                            <tr key={data.id} onClick={() => navigate(`/file-details/${data.id}`)}>
                              {selectedColumns.includes("fileNumber") && (
                                <td className="bold-font">{data.folder_name}</td>
                              )}
                              {/* {selectedColumns.includes("client") && <td>{data.customer_name}</td>} */}
                              {selectedColumns.includes("Nom du preneur d'assurance") && <td>{data.insurance_policyholder_name}</td>}
                              {selectedColumns.includes("brokerlabel") && (
                                <td>
                                   {(data.broker?.first_name || data.broker?.last_name)
                                    ? `${data.broker?.first_name} ${data.broker?.last_name == null ? '': data.broker?.last_name }`
                                    : "Sans"}
                                </td>
                              )}
                              {selectedColumns.includes("Date de création") && <td>{data.created_at}</td>}
                              {selectedColumns.includes("lastModifiedDateLabel") && <td>{data.updated_at}</td>}
                              {selectedColumns.includes("Date de début de chantier") && <td className="bold-font">{data?.estimated_start_date}</td>}
                              {selectedColumns.includes("Date de fin de chantier") && <td className="bold-font">{data?.estimated_completion_date}</td>}
                              {selectedColumns.includes("status") && (
                                <td>
                                  {
                                    data.status === "to_be_checked" ? <span className="checked badges">{t("toBeCheckedLabel")}</span> :
                                    data.status === "transfer_to_manager" ? <span className="transfer badges">Transfert au Gestionnaire</span> :
                                    data.status === "transfer_to_broker" ? <span className="transfer badges">Transfert au Courtier</span> :
                                    data.status === "transfer_to_insurer" ? <span className="formal_notice badges">Transfert à l'assureur</span> :
                                    data.status === "formal_notice" ? <span className="formal_notice badges">Mise en demeure</span> :
                                    data.status === "to_be_decided" ? <span className="to_be_decided badges">A statuer</span> :
                                    data.status === "validated" ? <span className="verified badges">{t("validatedLabel")}</span> :
                                    <span className="incomplete badges">{t("invalidLabel")}</span>
                                  }
                                </td>
                              )}
                              {selectedColumns.includes("Etat du chantier") && <td>{data.site_status === "on_site" ? "En cours de chantier" : "Fin de chantier"}</td>}
                              {selectedColumns.includes("Action") && deletePermission && (
                                <td>
                                  <div className="action-btn" style={{ justifyContent: "center" }}>
                                    <Link
                                      className="delete"
                                      href="/user-management"
                                      data-discover="true"
                                      title="Supprimer"
                                      onClick={(e) => { e.stopPropagation(); handleShowDeleteModal(); setShowFolderId(data.id); }}
                                    >
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M16 9V19H8V9H16ZM14.5 3H9.5L8.5 4H5V6H19V4H15.5L14.5 3ZM18 7H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7Z"
                                          fill="#00366B"
                                        />
                                      </svg>
                                    </Link>
                                  </div>
                                </td>
                              )}
                              <td></td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="10" style={{ textAlign: "left" }}>
                              {t("NorecordsfoundLabel")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                  {totalRecords > 10 && (
                    <Paginations
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </Tab>
            </Tabs>
          </>
        }
        </div>

      {/* Add Col Modal */}
      <Modal show={showAddcol} onHide={handleAddcolClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter une colonne</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h2 className="mb-4">Liste des colonnes</h2>
          {/* Select All Checkbox */}
          <Form.Check
            id="select-all-checkbox"
            label="Sélectionner tout"
            checked={Object.values(modalColumns).every((value) => value)} // All true
            onChange={(e) => {
              const isChecked = e.target.checked;
              setModalColumns((prev) =>
                Object.fromEntries(Object.keys(prev).map((key) => [key, isChecked]))
              );
            }}
          />

          {/* Individual Column Checkboxes */}
          {Object.keys(modalColumns).map((key) => (
            <Form.Check
              key={key}
              id={`checkbox-${key}`}
              label={<label style={{cursor: "pointer"}} htmlFor={`checkbox-${key}`}>{t(key)}</label>}
              checked={modalColumns[key]}
              onChange={() => handleCheckboxChange(key)}
            />
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAddcolSubmit}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Popup */}
      <Modal className="final-modal" show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title><h2>Confirmation</h2></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Etes-vous sûr de vouloir supprimer le dossier?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button className="cancel-btn" variant="primary" onClick={handleCloseDeleteModal}>
            Annuler
          </Button>
          <Button variant="primary" onClick={HandleDeleteDocumentFile}>
          {t("confirmbtnLabel")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default InsurersDashboard;
