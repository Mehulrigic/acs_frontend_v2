import React, { Fragment, useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import { Link, useNavigate } from "react-router";
import { Button, Form, Modal, Offcanvas } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Loading from "../../Common/Loading";
import SidePanel from "../../Components/SidePanel/SidePanel";
import Paginations from "../../Components/Paginations/Paginations";
import LogicalBlockService from "../../API/LogicalBlock/LogicalBlockService";

const LogicalBlock = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const [logicalBlockList, setLogicalBlockList] = useState([]);
  const [showLogicalBlockList, setShowLogicalBlockList] = useState([]);
  const [logoImageShow, setLogoImageShow] = useState("");
  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("#d9ebff");
  const [editLogicalBlockId, setEditLogicalBlockId] = useState("");
  const [editLogicalBlock, setEditLogicalBlock] = useState(false);
  const [editLogicalBlockStatus, setEditLogicalBlockStatus] = useState("");
  const [updateLogicalBlockId, setUpdateLogicalBlockId] = useState("");
  const [updateLogicalBlockStatus, setUpdateLogicalBlockStatus] = useState("");
  const [deleteLogicalBlockId, setDeleteLogicalBlockId] = useState("");
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });
  const [sort, setSort] = useState({ key: "created_at", value: "desc" });
  const [isRotated, setIsRotated] = useState(false);

  const [formShow, setFormShow] = useState(false);
  const handleFormShow = () => setFormShow(true);
  const handleFormClose = () => setFormShow(false);

  const [showmodal, setShowmodal] = useState(false);
  const handleModalShow = () => setShowmodal(true);
  const handleModalClose = () => {
    setShowmodal(false);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  useEffect(() => {
    if (flashMessage.message) {
      const timer = setTimeout(() => {
        setFlashMessage({ type: "", message: "" });
      }, 3000); // Adjust time as needed
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
      LogicalBlockList(sort, currentPage, editLogicalBlockStatus);
      setEditLogicalBlockStatus("");
    } else {
      navigate("/");
    }
  }, [sort]);

  const LogicalBlockList = async (sort, page = 1, status) => {
    setIsLoading(true);
    try {
      const useData = {
        sort: {
          key: sort.key,
          value: sort.value
        },
        page,
        status: status,
      };

      const response = await LogicalBlockService.logical_block_list(useData);

      if (response.data.status) {
        setIsLoading(false);
        setLogicalBlockList(response.data.LogicalBlocks.data);
        setCurrentPage(response.data.LogicalBlocks.meta.current_page);
        setTotalPages(response.data.LogicalBlocks.meta.last_page);
        setTotalRecord(response.data.LogicalBlocks.meta.total);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const NewLogicalBlockCreate = async (e) => {
    e.preventDefault();
    if (e.target.elements.nameLabel.value == "") {
      setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
      return;
    }
    try {
      var useData = {
        name: e.target.elements.nameLabel.value ?? "",
        // status: siteStatus == true ? 'end_of_site' : 'on_site'
      };

      const response = await LogicalBlockService.create_logical_block(useData);

      if (response.data.status) {
        setFormShow(false);
        LogicalBlockList(sort, 1, "", "");
      } else {
        setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
      }
    } catch (error) {
      setFlashMessage({ type: "error", message: error.response.data.message || t("somethingWentWrong") });
    }
  };

  const ShowLogicalBlock = async (e, id) => {
    e.preventDefault();
    setEditLogicalBlockId(id);
    try {

      const response = await LogicalBlockService.show_logical_block(id);

      if (response.data.status) {
        setShowLogicalBlockList(response.data.LogicalBlock);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const EditLogicalBlock = async (e) => {
    e.preventDefault();
    if (e.target.elements.nameLabel.value == "") {
      setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
      return;
    }
    try {
      var useData = {
        name: e.target.elements.nameLabel.value ?? "",
      };

      const response = await LogicalBlockService.edit_logical_block(editLogicalBlockId, useData);

      if (response.data.status) {
        setFormShow(false);
        LogicalBlockList(sort, currentPage, "", "");
      } else {
        setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
      }
    } catch (error) {
      setFlashMessage({ type: "error", message: error.response.data.message || t("somethingWentWrong") });
    }
  };

  const DeleteLogicalBlock = async () => {
    try {

      const response = await LogicalBlockService.delete_logical_block(deleteLogicalBlockId);

      if (response.data.status) {
        LogicalBlockList(sort, 1, "", "");
        handleCloseDeleteModal();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const HandleUpdateStatus = async () => {
    try {
      var useData = {
        status: updateLogicalBlockStatus == 1 ? "0" : "1",
      };

      const response = await LogicalBlockService.logical_block_status_update(updateLogicalBlockId, useData);

      if (response.data.status) {
        setEditLogicalBlockStatus("");
        LogicalBlockList(sort, currentPage, "", "");
        handleModalClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const HandleFilterStatus = (status) => {
    setEditLogicalBlockStatus(status);
    LogicalBlockList(sort, 1, status)
  };

  const handleStatusChange = (id, status) => {
    setUpdateLogicalBlockId(id);
    setUpdateLogicalBlockStatus(status);
    handleModalShow();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    LogicalBlockList(sort, page, editLogicalBlockStatus); // Fetch data for the selected page
  };

  const handleClickRotate = (column) => {
    const direction = sort.key === column ? (sort.value === "desc" ? "asc" : "desc") : "asc";
    setSort({ key: column, value: direction });
    setIsRotated(!isRotated); // Toggle the class on click
  };

  return (
    <Fragment>
      <style> {` button.btn.btn-primary  { background-color: ${localStorage.getItem('button_color') ? JSON.parse(localStorage.getItem('button_color')) : "#e84455"} !Important};`} </style>

      <SidePanel sidebarLogo={`${process.env.REACT_APP_IMAGE_URL}/${logoImageShow}`} />

      <div className="dashboard-main-content user-management" style={{ backgroundColor: rightPanelThemeColor }}>
        <h1 className="mb-5">Bloc logique</h1>

        <div className="table-wrapper mt-16">
          <div className="text-end mb-3">
            <Button onClick={() => { setShowLogicalBlockList([]); handleFormShow(); setEditLogicalBlock(false); }} variant="primary">
              Ajouter un bloc logique
            </Button>
          </div>
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
                          <Form.Select aria-label="statusSelectAria" value={editLogicalBlockStatus} onChange={(e) => HandleFilterStatus(e.target.value)}>
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
                  {logicalBlockList?.length > 0 ?
                    logicalBlockList?.map((data, index) => (
                      <tr>
                        <td>{(currentPage - 1) * 10 + (index + 1)}</td>
                        <td className="bold-font">{data.name}</td>
                        <td>{data.status == 1 ? <span className="verified badges" onClick={() => handleStatusChange(data.id, data.status)} style={{ cursor: "pointer" }}>{t("activeLabel")}</span> : <span className="incomplete badges" onClick={() => handleStatusChange(data.id, data.status)} style={{ cursor: "pointer" }}>{t("inActiveLabel")}</span>}</td>
                        <td>
                          <div className="action-btn">
                            <Link className="edit" onClick={(e) => { ShowLogicalBlock(e, data.id); handleFormShow(); setEditLogicalBlock(true); }}>
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
                            {/* <Link className="delete" onClick={() => { handleShowDeleteModal(); setDeleteLogicalBlockId(data.id) }}>
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
                            </Link> */}
                          </div>
                        </td>
                      </tr>
                    ))
                    :
                    (
                      <tr style={{ textAlign: "center" }}>
                        <td colSpan="6">
                          {t("NorecordsfoundLabel")}
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </Table>
            </div>
          }
          {totalRecord > 10 &&
            <Paginations
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={10}
              totalItems={totalRecord}
            />
          }
        </div>
      </div>

      {/* Add & Edit User Canvas */}
      <Offcanvas
        className="account-request-pannel"
        placement="end"
        show={formShow}
        onHide={handleFormClose}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{editLogicalBlock ? "Changer le bloc logique" : "Ajouter un bloc logique"}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={editLogicalBlock ? EditLogicalBlock : NewLogicalBlockCreate}>
            {flashMessage.message && (
              <div
                className={`alert ${flashMessage.type === "success" ? "alert-success" : "alert-danger"
                  } text-center`}
                role="alert"
              >
                {flashMessage.message}
              </div>
            )}
            <Form.Group controlId="nameLabel">
              <Form.Label>{t("nameLabel")} <span>*</span></Form.Label>
              <Form.Control type="text" placeholder={t("nameLabel")} defaultValue={showLogicalBlockList?.name} name="nameLabel" />
            </Form.Group>
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
          <p>Êtes-vous sûr de vouloir supprimer le bloc logique ?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button className="cancel-btn" variant="primary" onClick={handleCloseDeleteModal}>
            Annuler
          </Button>
          <Button variant="primary" onClick={DeleteLogicalBlock}>
            {t("confirmbtnLabel")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default LogicalBlock;
