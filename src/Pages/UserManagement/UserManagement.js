import React, { Fragment, useEffect, useState } from "react";
import "./UserManagement.css";
import SidePanel from "../../Components/SidePanel/SidePanel";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Table from "react-bootstrap/Table";
import { Link, useNavigate } from "react-router";
import { Button, Form, Modal, Offcanvas } from "react-bootstrap";
import UserManagementService from "../../API/UserManagement/UserManagementService";
import { useTranslation } from "react-i18next";
import Paginations from "../../Components/Paginations/Paginations";
import logo from "../../acs-logo.png"
import Loading from "../../Common/Loading";


const UserManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Courtier");
  const [editUser, setEditUser] = useState(false);
  const [userList, setUserList] = useState([]);
  const [showUserList, setShowUserList] = useState([]);
  const [passwordShow, setPasswordShow] = useState(false);
  const [role, setRole] = useState("");
  const [editUserId, setEditUserId] = useState("");
  const [updateUserId, setUpdateUserId] = useState("");
  const [editUserStatus, setEditUserStatus] = useState("");
  const [updateUserStatus, setUpdateUserStatus] = useState("");
  const [roleList, setRoleList] = useState([]);
  const [InsurerList, setInsurerList] = useState([]);
  const [SelectInsurer, setSelectInsurer] = useState("");
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
  const [logoImageShow, setLogoImageShow] = useState("");
  const [handleDeleteUserId, setHandleDeleteUserId] = useState("");

  const [formShow, setFormShow] = useState(false);
  const handleFormClose = () => {
    setFormShow(false);
    setRole(activeTab);
    setSelectInsurer("");
  };
  const handleFormShow = () => setFormShow(true);

  const [showmodal, setShowmodal] = useState(false);
  const handleModalClose = () => setShowmodal(false);
  const handleModalShow = () => setShowmodal(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const [isRotated, setIsRotated] = useState(false);
  // const [sort, setSort] = useState({ key: "first_name", value: "asc" });
  const [sort, setSort] = useState({ key: "created_at", value: "desc" });

  useEffect(() => {
    if (flashMessage.message) {
      const timer = setTimeout(() => {
        setFlashMessage({ type: "", message: "" });
      }, 3000); // Adjust time as needed
      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  useEffect(() => {
    const logo_image = JSON.parse(localStorage.getItem("logo_image"));
    const right_panel_color = JSON.parse(localStorage.getItem("right_panel_color"));
    setRightPanelThemeColor(right_panel_color);
    setLogoImageShow(logo_image);
    RoleList();
  }, []);

  useEffect(() => {
    const userRole = JSON.parse(localStorage.getItem("userRole"));
    const token = localStorage.getItem("authToken");
    if (token && userRole.includes("Administrateur")) {
      UserList(sort, activeTab, currentPage, editUserStatus);
      setRole(activeTab);
      getinsurerlist();
      setEditUserStatus("");
    } else {
      navigate("/");
    }
  }, [activeTab, sort]);

  useEffect(() => {
    if (showUserList?.insurer_id) {
      handleInsurerchange(null, showUserList?.insurer_id);
    }
  }, [showUserList]);

  const getinsurerlist = async () => {
    try {
      const response = await UserManagementService.insurer_list();
      if (response.data.status) {
        setInsurerList(response.data.insurerList)

      }
    } catch (error) {
      console.log(error);
    }

  }
  const handleTabChange = (tabKey) => {

    setActiveTab(tabKey);
  };

  const RoleList = async () => {
    try {
      const response = await UserManagementService.user_role_list();
      if (response.data.status) {

        setRoleList(response.data.roles);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    UserList(sort, activeTab, page, editUserStatus); // Fetch data for the selected page
  };

  const UserList = async (sort, activeTab, page = 1, status) => {
    setIsLoading(true);
    try {
      const useData = {
        sort: {
          key: sort.key,
          value: sort.value
        },
        role: activeTab,
        status: status ?? "",
        page,
      };
      const response = await UserManagementService.user_list(useData);
      if (response.data.status) {
        setIsLoading(false);
        setUserList(response.data.user.data);
        setCurrentPage(response.data.user.meta.current_page);
        setTotalPages(response.data.user.meta.last_page);
        setTotalRecords(response.data.user.meta.total);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const NewUserCreate = async (e) => {
    e.preventDefault();
    if (e.target.elements.firstName.value == "" || e.target.elements.lastName.value == "" ||
      e.target.elements.email.value == "" || e.target.elements.password.value == "" || role == "") {
      setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
      return;
    }

    if(role === "Courtier"){
      if(SelectInsurer == ""){
        setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
        return;
      }
    }

    try {
      var useData = {
        first_name: e.target.elements.firstName.value,
        last_name: e.target.elements.lastName.value,
        email: e.target.elements.email.value,
        password: e.target.elements.password.value,
        role: role,
      };

      if(role === "Courtier") {
        useData.insurer_id = SelectInsurer;
      }

      if (role === "Assureur") {
        useData.insurer_code = e.target.elements.insurercode.value ?? "";
      }

      const response = await UserManagementService.create_user(useData);
      if (response.data.status) {
        setFormShow(false);
        UserList(sort, activeTab, 1, "");
      } else {
        setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
      }
    } catch (error) {
      setFlashMessage({ type: "error", message: error.response.data.message || t("somethingWentWrong") });
    }
  };

  const ShowUser = async (e, id) => {
    e.preventDefault();
    setEditUserId(id);
    try {
      const response = await UserManagementService.show_user(id);
      if (response.data.status) {
        setShowUserList(response.data.user);
        setRole(response.data.user.role);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const EditUser = async (e) => {
    e.preventDefault();

    if (e.target.elements.firstName.value == "" || e.target.elements.lastName.value == "" ||
      e.target.elements.email.value == "" || role == "") {
      setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
      return;
    }

    if(role === "Courtier"){
      if(SelectInsurer == ""){
        setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
        return;
      }
    }

    try {
      var useData = {
        first_name: e.target.elements.firstName.value,
        last_name: e.target.elements.lastName.value,
        email: e.target.elements.email.value,
        password: e.target.elements.password.value,
        role: role,
      };

      if(role === "Courtier") {
        useData.insurer_id = SelectInsurer;
      }

      if (role === "Assureur") {
        useData.insurer_code = e.target.elements.insurercode.value ?? "";
      }

      const response = await UserManagementService.edit_user(editUserId, useData);
      if (response.data.status) {
        setFormShow(false);
        UserList(sort, activeTab, currentPage, editUserStatus);
      } else {
        setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
      }
    } catch (error) {
      setFlashMessage({ type: "error", message: error.response.data.message || t("somethingWentWrong") });
    }
  };

  const HandleDeleteUser = async () => {
    try {
      const response = await UserManagementService.delete_user(handleDeleteUserId);
      if (response.data.status) {
        UserList(sort, activeTab, currentPage, editUserStatus);
        handleCloseDeleteModal();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const HandleUpdateStatus = async () => {
    try {
      var useData = {
        status: updateUserStatus == 1 ? "0" : "1",
      };
      const response = await UserManagementService.user_status_update(updateUserId, useData);
      if (response.data.status) {
        UserList(sort, activeTab, currentPage, "");
        setEditUserStatus("");
        handleModalClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleStatusChange = (id, status) => {
    setUpdateUserId(id);
    setUpdateUserStatus(status);
    handleModalShow();
  };

  const handleChange = (e) => {
    setRole(e.target.value);
  };

  const handleInsurerchange = (e, insurerId) => {
    if(e) {
      setSelectInsurer(e.target.value);
    } else {
      setSelectInsurer(insurerId);
    }
  };

  const HandleFilterStatus = (status) => {
    setEditUserStatus(status);
    UserList(sort, activeTab, currentPage, status)
  };

  const handleClickRotate = (column) => {
    const direction = sort.key === column ? sort.value === "desc" ? "asc" : "desc" : "asc";
    setSort({ key: column, value: direction });
    setIsRotated(!isRotated); // Toggle the class on click
  };

  return (
    <Fragment>
      <style> {` button.btn.btn-primary  { background-color: ${localStorage.getItem('button_color') ? JSON.parse(localStorage.getItem('button_color')) : "#e84455"} !Important};`} </style>

      <SidePanel sidebarLogo={`${process.env.REACT_APP_IMAGE_URL}/${logoImageShow}`} />
      <div className="dashboard-main-content user-management" style={{ backgroundColor: rightPanelThemeColor }}>
        <h1 className="mb-5">{t("UserManagement")}</h1>
        <Tabs
          defaultActiveKey="broker"
          id="uncontrolled-tab-example"
          activeKey={activeTab}
          onSelect={handleTabChange}
          className=""
        >
          {/* Courtier Tab */}
          <Tab eventKey="Courtier" title="Courtier">
            <div className="text-end mb-3">
              <Button onClick={() => { setShowUserList([]); handleFormShow(); setEditUser(false); }} variant="primary">
                {t("Add")} {activeTab}
              </Button>
            </div>
            {isLoading ? <Loading /> :
              <div className="table-wrap mt-24">
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>
                        <div className="d-flex align-items-center">
                          <span>{t("firstName")}</span>
                          <Link
                            className={`sorting-icon ms-2`}
                            onClick={() => handleClickRotate("first_name")}
                          >
                            {sort.value === "asc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fillOpacity="0.5" />
                              </svg>
                            }

                            {sort.value === "desc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fillOpacity="0.5" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                              </svg>
                            }
                          </Link>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex align-items-center">
                          <span>{t("lastName")}</span>
                          <Link
                            className={`sorting-icon ms-2`}
                            onClick={() => handleClickRotate("last_name")}
                          >
                            {sort.value === "asc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fillOpacity="0.5" />
                              </svg>
                            }

                            {sort.value === "desc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fillOpacity="0.5" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                              </svg>
                            }
                          </Link>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex align-items-center">
                          <span>{t("emailLabel")}</span>
                          <Link
                            className={`sorting-icon ms-2`}
                            onClick={() => handleClickRotate("email")}
                          >
                            {sort.value === "asc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fillOpacity="0.5" />
                              </svg>
                            }

                            {sort.value === "desc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fillOpacity="0.5" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                              </svg>
                            }
                          </Link>
                        </div>
                      </th>
                      <th width={165} className="select-drop elips-dropdown">
                        <div className="d-flex align-items-center">
                          <div>
                            <Form.Select aria-label="statusSelectAria" value={editUserStatus} onChange={(e) => HandleFilterStatus(e.target.value)}>
                              <option value="">{t("status")}</option>
                              <option value="0">{t("inActiveLabel")}</option>
                              <option value="1">{t("activeLabel")}</option>
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
                                  <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fillOpacity="0.5" />
                                </svg>
                              }

                              {sort.value === "desc" &&
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fillOpacity="0.5" />
                                  <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                                </svg>
                              }
                            </Link>
                          </div>
                        </div>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList?.length > 0 ?
                      userList?.map((data) => (
                        <tr>
                          <td className="bold-font">{data.firstname}</td>
                          <td>{data.lastname}</td>
                          <td>{data.email}</td>
                          <td>{data.status == 1 ? <span className="verified badges" onClick={() => handleStatusChange(data.id, data.status)} style={{ cursor: "pointer" }}>{t("activeLabel")}</span> : <span className="incomplete badges" onClick={() => handleStatusChange(data.id, data.status)} style={{ cursor: "pointer" }}>{t("inActiveLabel")}</span>}</td>
                          <td>
                            <div className="action-btn">
                              <Link className="edit" onClick={(e) => { ShowUser(e, data.id); handleFormShow(); setEditUser(true); }}>
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
                              <Link className="delete" onClick={() => {handleShowDeleteModal(); setHandleDeleteUserId(data.id)}}>
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M16 9V19H8V9H16ZM14.5 3H9.5L8.5 4H5V6H19V4H15.5L14.5 3ZM18 7H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7Z"
                                    fill="#e84455"
                                  />
                                </svg>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                      :
                      (
                        <tr style={{ textAlign: "center" }}>
                          <td colSpan='5'>{t("NorecordsfoundLabel")}</td>
                        </tr>
                      )
                    }
                  </tbody>
                </Table>
              </div>
            }
            {totalRecords > 10 &&
              <Paginations
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={10}
                totalItems={totalRecords}
              />
            }
          </Tab>

          {/* Assureur Tab */}
          <Tab eventKey="Assureur" title="Assureur">
            <div className="text-end mb-3">
              <Button onClick={() => { setShowUserList([]); handleFormShow(); setEditUser(false); }} variant="primary">
                {t("Add")} {activeTab}
              </Button>
            </div>

            {isLoading ? <Loading /> :
              <div className="table-wrap mt-24">
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>
                        <div className="d-flex align-items-center">
                          <span>{t("firstName")}</span>
                          <Link
                            className={`sorting-icon ms-2`}
                            onClick={() => handleClickRotate("first_name")}
                          >
                            {sort.value === "asc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fillOpacity="0.5" />
                              </svg>
                            }

                            {sort.value === "desc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fillOpacity="0.5" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                              </svg>
                            }
                          </Link>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex align-items-center">
                          <span>{t("lastName")}</span>
                          <Link
                            className={`sorting-icon ms-2`}
                            onClick={() => handleClickRotate("last_name")}
                          >
                            {sort.value === "asc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fillOpacity="0.5" />
                              </svg>
                            }

                            {sort.value === "desc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fillOpacity="0.5" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                              </svg>
                            }
                          </Link>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex align-items-center">
                          <span>{t("emailLabel")}</span>
                          <Link
                            className={`sorting-icon ms-2`}
                            onClick={() => handleClickRotate("email")}
                          >
                            {sort.value === "asc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fillOpacity="0.5" />
                              </svg>
                            }

                            {sort.value === "desc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fillOpacity="0.5" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                              </svg>
                            }
                          </Link>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex align-items-center">
                          <span>{t("insurercode")}</span>
                          <Link
                            className={`sorting-icon ms-2`}
                            onClick={() => handleClickRotate("insurer_code")}
                          >
                            {sort.value === "asc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fillOpacity="0.5" />
                              </svg>
                            }

                            {sort.value === "desc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fillOpacity="0.5" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                              </svg>
                            }
                          </Link>
                        </div>
                      </th>
                      <th width={165} className="select-drop elips-dropdown">
                        <div className="d-flex align-items-center">
                          <div>
                            <Form.Select aria-label="statusSelectAria" value={editUserStatus} onChange={(e) => HandleFilterStatus(e.target.value)}>
                              <option value="">{t("status")}</option>
                              <option value="0">{t("inActiveLabel")}</option>
                              <option value="1">{t("activeLabel")}</option>
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
                                  <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fillOpacity="0.5" />
                                </svg>
                              }

                              {sort.value === "desc" &&
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fillOpacity="0.5" />
                                  <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                                </svg>
                              }
                            </Link>
                          </div>
                        </div>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList?.length > 0 ?
                      userList?.map((data) => (
                        <tr>
                          <td className="bold-font">{data.firstname}</td>
                          <td>{data.lastname}</td>
                          <td>{data.email}</td>
                          <td>{data.insurer_code ? data.insurer_code : "_"}</td>
                          <td>{data.status == 1 ? <span className="verified badges" onClick={() => handleStatusChange(data.id, data.status)} style={{ cursor: "pointer" }}>{t("activeLabel")}</span> : <span className="incomplete badges" onClick={() => handleStatusChange(data.id, data.status)} style={{ cursor: "pointer" }}>{t("inActiveLabel")}</span>}</td>
                          <td>
                            <div className="action-btn">
                              <Link onClick={(e) => { ShowUser(e, data.id); handleFormShow(); setEditUser(true); }} className="edit">
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
                              <Link className="delete" onClick={() => {handleShowDeleteModal(); setHandleDeleteUserId(data.id)}}>
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M16 9V19H8V9H16ZM14.5 3H9.5L8.5 4H5V6H19V4H15.5L14.5 3ZM18 7H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7Z"
                                    fill="#e84455"
                                  />
                                </svg>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                      :
                      (
                        <tr style={{ textAlign: "center" }}>
                          <td colSpan='6'>{t("NorecordsfoundLabel")}</td>
                        </tr>
                      )
                    }
                  </tbody>
                </Table>
              </div>
            }
            {totalRecords > 10 &&
              <Paginations
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={10}
                totalItems={totalRecords}
              />
            }
          </Tab>

          {/* Gestionnaire ACS Tab */}
          <Tab eventKey="Gestionnaire ACS" title="Gestionnaire ACS">
            <div className="text-end mb-3">
              <Button onClick={() => { setShowUserList([]); handleFormShow(); setEditUser(false); }} variant="primary">
                {t("Add")} {activeTab}
              </Button>
            </div>

            {isLoading ? <Loading /> :
              <div className="table-wrap mt-24">
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>
                        <div className="d-flex align-items-center">
                          <span>{t("firstName")}</span>
                          <Link
                            className={`sorting-icon ms-2`}
                            onClick={() => handleClickRotate("first_name")}
                          >
                            {sort.value === "asc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fillOpacity="0.5" />
                              </svg>
                            }

                            {sort.value === "desc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fillOpacity="0.5" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                              </svg>
                            }
                          </Link>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex align-items-center">
                          <span>{t("lastName")}</span>
                          <Link
                            className={`sorting-icon ms-2`}
                            onClick={() => handleClickRotate("last_name")}
                          >
                            {sort.value === "asc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fillOpacity="0.5" />
                              </svg>
                            }

                            {sort.value === "desc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fillOpacity="0.5" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                              </svg>
                            }
                          </Link>
                        </div>
                      </th>
                      <th>
                        <div className="d-flex align-items-center">
                          <span>{t("emailLabel")}</span>
                          <Link
                            className={`sorting-icon ms-2`}
                            onClick={() => handleClickRotate("email")}
                          >
                            {sort.value === "asc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fillOpacity="0.5" />
                              </svg>
                            }

                            {sort.value === "desc" &&
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fillOpacity="0.5" />
                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                              </svg>
                            }
                          </Link>
                        </div>
                      </th>
                      <th width={165} className="select-drop elips-dropdown">
                        <div className="d-flex align-items-center">
                          <div>
                            <Form.Select aria-label="statusSelectAria" value={editUserStatus} onChange={(e) => HandleFilterStatus(e.target.value)}>
                              <option value="">{t("status")}</option>
                              <option value="0">{t("inActiveLabel")}</option>
                              <option value="1">{t("activeLabel")}</option>
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
                                  <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fillOpacity="0.5" />
                                </svg>
                              }

                              {sort.value === "desc" &&
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fillOpacity="0.5" />
                                  <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                                </svg>
                              }
                            </Link>
                          </div>
                        </div>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList?.length > 0 ?
                      userList?.map((data) => (
                        <tr>
                          <td className="bold-font">{data.firstname}</td>
                          <td>{data.lastname}</td>
                          <td>{data.email}</td>
                          <td>{data.status == 1 ? <span className="verified badges" onClick={() => handleStatusChange(data.id, data.status)} style={{cursor: "pointer"}}>{t("activeLabel")}</span> : <span className="incomplete badges" onClick={() => handleStatusChange(data.id, data.status)} style={{cursor: "pointer"}}>{t("inActiveLabel")}</span>}</td>
                          <td>
                            <div className="action-btn">
                              <Link onClick={(e) => { ShowUser(e, data.id); handleFormShow(); setEditUser(true); }} className="edit">
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
                              <Link className="delete" onClick={() => {handleShowDeleteModal(); setHandleDeleteUserId(data.id)}}>
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M16 9V19H8V9H16ZM14.5 3H9.5L8.5 4H5V6H19V4H15.5L14.5 3ZM18 7H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7Z"
                                    fill="#e84455"
                                  />
                                </svg>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                      :
                      (
                        <tr style={{ textAlign: "center" }}>
                          <td colSpan='5'>{t("NorecordsfoundLabel")}</td>
                        </tr>
                      )
                    }
                  </tbody>
                </Table>
              </div>
            }
            {totalRecords > 10 &&
              <Paginations
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={10}
                totalItems={totalRecords}
              />
            }
          </Tab>
        </Tabs>
      </div>

      {/* Add User Canvas */}
      <Offcanvas
        className="account-request-pannel"
        placement="end"
        show={formShow}
        onHide={handleFormClose}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{editUser ? `${t("Edit")} ${activeTab}` : `${t("Add")} ${activeTab}`}</Offcanvas.Title>

        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={editUser ? EditUser : NewUserCreate}>
            {flashMessage.message && (
              <div
                className={`alert ${flashMessage.type === "success" ? "alert-success" : "alert-danger"
                  } text-center`}
                role="alert"
              >
                {flashMessage.message}
              </div>
            )}
            <Form.Group controlId="firstName">
              <Form.Label>{t("firstName")} <span>*</span></Form.Label>
              <Form.Control type="text" placeholder={t("firstName")} defaultValue={showUserList?.firstname} name="firstName" />
            </Form.Group>

            <Form.Group controlId="lastName">
              <Form.Label>{t("lastName")} <span>*</span></Form.Label>
              <Form.Control type="text" placeholder={t("lastName")} defaultValue={showUserList?.lastname} name="lastName" />
            </Form.Group>

            < Form.Group controlId="emailid">
              <Form.Label>{t("emailLabel")} <span>*</span></Form.Label>
              <Form.Control type="email" placeholder="ex : jean.dupont@email.com" defaultValue={showUserList?.email} name="email" />
            </Form.Group>

            <Form.Group className="relative" controlId="formBasicPassword">
              <Form.Label>{t("passwordLabel")} <span>{editUser ? '' : '*'} </span></Form.Label>
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
                    fill="#e84455"
                  />
                </svg>
              </Link>
            </Form.Group>

            <Form.Group controlId="registeras">
              <Form.Label>{t("registerAs")} <span>*</span></Form.Label>
              <Form.Select
                aria-label={t("selectRoleLabel")}
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

            {role === "Courtier" &&
              <Form.Group controlId="registeras" className="mt-3">
                <Form.Label>{t("selectInsurer")} <span>*</span></Form.Label>
                <Form.Select
                  aria-label={t("selectInsurer")}
                  value={SelectInsurer}
                  onChange={handleInsurerchange}
                >
                  <option value="" disabled>
                    {t("selectInsurer")}
                  </option>
                  {InsurerList?.length > 0 ?
                    InsurerList?.map((insurer) => (
                      <option value={insurer.id}>{insurer.first_name}</option>
                    )) : (
                      <option value="">{t("NorecordsfoundLabel")}</option>
                    )
                  }
                </Form.Select>
              </Form.Group>
            }

            {role === "Assureur" &&
              <Form.Group controlId="insurercode" className="mt-3">
                <Form.Label>{t("insurercode")}</Form.Label>
                <Form.Control type="text" placeholder={t("insurercode")} defaultValue={showUserList?.insurer_code} name="insurercode" />
              </Form.Group>
            }

            <div className="canvas-footer text-end">
              <Button variant="primary" type="submit">
                {t("submitButton")}
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Confirmation Popup */}
      <Modal className='missing-doc-modal' show={showmodal} onHide={() => setShowmodal(true)}>
        <Modal.Header closeButton onHide={handleModalClose}>
          <Modal.Title>
            <h2>{t("confirmStatusTitle")}</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span className="complete-process">
            {t("confirmStatusMessage")}
          </span>
        </Modal.Body>
        <Modal.Footer>
          <div className="text-end">
            <Button variant="primary" onClick={() => HandleUpdateStatus()}>
              {t("confirmbtnLabel")}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Popup */}
      <Modal className="final-modal" show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title><h2>Confirmation</h2></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{`Etes-vous sûr de vouloir supprimer le ${activeTab}?`}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button className="cancel-btn" variant="primary" onClick={handleCloseDeleteModal}>
            Annuler
          </Button>
          <Button variant="primary" onClick={() => HandleDeleteUser()}>
            {t("confirmbtnLabel")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment >
  );
};

export default UserManagement;