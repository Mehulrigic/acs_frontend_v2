import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SidePanel from "../../Components/SidePanel/SidePanel";
import "./BrokerDashboard.css";
import StatisticsData from "../../Components/StatisticsData/StatisticsData";
import Table from "react-bootstrap/Table";
import Form from 'react-bootstrap/Form';
import DashboardManagementService from '../../API/DashboardManagement/DashboardManagementService';
import logo from "../../ass-logo.png";
import Paginations from "../../Components/Paginations/Paginations";
import AddfolderPanel from "../../Components/AddfolderPanel/AddfolderPanel";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import Loading from "../../Common/Loading";


const BrokerDashboard = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [userDocumentData, setUserDocumentData] = useState([]);
  const [statisticsData, setStatisticsData] = useState({});
  const [editUserStatus, setEditUserStatus] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [logoImageShow, setLogoImageShow] = useState("");
  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
  const [showAddcol, setShowAddcol] = useState(false);
  const handleAddcolClose = () => setShowAddcol(false);
  const handleAddcolShow = () => setShowAddcol(true);
  const [isRotated, setIsRotated] = useState(false);
  // const [sort, setSort] = useState({ key: "folder_name", value: "asc" });
  const [sort, setSort] = useState({ key: "created_at", value: "desc" });
  const [deletePermission, setDeletePermission] = useState(false);
  const [showFolderId, setShowFolderId] = useState("");
    
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const [modalColumns, setModalColumns] = useState({
    fileNumber: true,
    client: true,
    "Date de création": true,
    status: true,
  });

  const [selectedColumns, setSelectedColumns] = useState(
    Object.keys(modalColumns).filter((key) => modalColumns[key])
  );

  useEffect(() => {
    if (deletePermission) {
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
    if (token && userRole.includes("Courtier")) {
      const user = JSON.parse(localStorage.getItem("user"));
      const logo_image = JSON.parse(localStorage.getItem("logo_image"));
      const right_panel_color = JSON.parse(localStorage.getItem("right_panel_color"));
      setRightPanelThemeColor(right_panel_color);
      UserDocument(search, sort, currentPage, editUserStatus);
      setUserRole(userRole);
      setUserId(user?.id);
      setUserName(user?.first_name + " " + user?.last_name);
      setLogoImageShow(logo_image);
    } else {
      navigate("/");
    }
  }, [sort]);

  useEffect(() => {
    const userRole = JSON.parse(localStorage.getItem("userRole"));
    const token = localStorage.getItem("authToken");
    if (token && userRole.includes("Courtier")) {
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

  const UserDocument = async (search, sort, page = 1, status) => {
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
        tab_type: "dashboard"
      }
      const response = await DashboardManagementService.user_document(userData);
      if (response.data.status) {
        setIsLoading(false);
        setUserDocumentData(response.data.documents.data);
        setCurrentPage(response.data.documents.meta.current_page);
        setTotalPages(response.data.documents.meta.last_page);
        setTotalRecords(response.data.documents.meta.total);
        localStorage.setItem("courtier_dashboard", response.data.documents.meta.total);
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
      }
      if (selectedMonth === "custom") {
        userData.filter_date = startDate ? startDate : "";
      }
      const response = await DashboardManagementService.get_statistics(userData);
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
    UserDocument(search, sort, 1, status);
  };

  const handleSearchChange = (search) => {
    setSearch(search);
    UserDocument(search, sort, 1, editUserStatus);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchChange(search);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    UserDocument(search, sort, page, editUserStatus);
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
    const direction = sort.key === column ? sort.value === "desc" ? "asc" : "desc" : "asc";
    setSort({ key: column, value: direction });
    setIsRotated(!isRotated); // Toggle the class on click
  };

  const HandleDeleteDocumentFile = async () => {
    try {
      const response = await DashboardManagementService.delete_user_document(showFolderId);
      if (response.data.status) {
        handleCloseDeleteModal();
        setShowFolderId("");
        UserDocument(search, sort, currentPage, editUserStatus);
        GetStatistics();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Fragment>
      <style> {` button.btn.btn-primary  { background-color: ${localStorage.getItem('button_color') ? JSON.parse(localStorage.getItem('button_color')) : "#e84455"} !Important};`} </style>

      <div className="broker-side-pannel">
        <SidePanel
          sidebarLogo={(logoImageShow == "" || logoImageShow == null || logoImageShow == undefined) ? logo : `${process.env.REACT_APP_IMAGE_URL}/${logoImageShow}`}
        />
      </div>


      <div className="dashboard-main-content broker-dashboard" style={{ backgroundColor: rightPanelThemeColor ? rightPanelThemeColor : "#feeaf5" }}>
        <div className="top-header">
          <h4>{t("dashboard")}</h4>
          <div className="mt-3 d-md-flex justify-content-between align-items-center">
            <h1 className="m-md-0 mb-3">{t("dashboard")}</h1>
            <AddfolderPanel
              data={"broker-add-panel"}
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

            <div className="table-wrapper mt-16">
              <div className="d-md-flex align-items-center gap-2 justify-content-between">
                <h2 className="mb-3 mb-md-0">{t("toProcess", { count: totalRecords })}</h2>
                <Form.Group className="relative" controlId="exampleForm.ControlInput1">
                  <Form.Control
                    type="search"
                    placeholder="Rechercher"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <div className="search-icon" style={{ cursor: "pointer" }} onClick={() => handleSearchChange(search)}>
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
                      {selectedColumns.includes("client") &&
                        <th>
                          <div className="d-flex align-items-center">
                            <span>{t("client")}</span>
                            <Link
                              className={`sorting-icon ms-2`}
                              onClick={() => handleClickRotate("company_name")}
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
                      {selectedColumns.includes("status") &&
                        <th className="select-drop">
                          <div className="d-flex align-items-center">
                            <div>
                              <Form.Select aria-label={t("statusSelectAria")} value={editUserStatus} onChange={(e) => handleStatusChange(e.target.value)}>
                                <option value="">{t("status")}</option>
                                <option value="to_be_checked">{t("toBeCheckedLabel")}</option>
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
                            <path
                              d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z"
                              fill="black"
                            />
                          </svg>
                        </Link>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDocumentData?.length > 0 && selectedColumns?.length > 0 ?
                      userDocumentData?.map((data) => (
                        <tr onClick={() => navigate(`/courtier-file-detail/${data.id}`)}>
                          {selectedColumns.includes("fileNumber") && <td className="bold-font">{data.folder_name}</td>}
                          {selectedColumns.includes("client") && <td>{data.customer_name}</td>}
                          {selectedColumns.includes("Date de création") && <td>{data.created_at}</td>}
                          {selectedColumns.includes("status") &&
                            <td>
                              {
                                data.status === "to_be_checked" ? <span className="checked badges">{t("toBeCheckedLabel")}</span> :
                                data.status === "validated" ? <span className="verified badges">{t("validatedLabel")}</span> :
                                <span className="incomplete badges">{t("invalidLabel")}</span>
                              }
                            </td>
                          }
                          {selectedColumns.includes("Action") && deletePermission && (
                            <td>
                              <div className="action-btn">
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
                      )) :
                      <tr style={{ textAlign: "center" }}>
                        <td colSpan={selectedColumns.length}>
                          {t("NorecordsfoundLabel")}
                        </td>
                      </tr>
                    }
                  </tbody>
                </Table>
              </div>
              {totalRecords > 10 &&
                <Paginations
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              }
            </div>
          </>}
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
              label={<label style={{ cursor: "pointer" }} htmlFor={`checkbox-${key}`}>{t(key)}</label>}
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

export default BrokerDashboard;