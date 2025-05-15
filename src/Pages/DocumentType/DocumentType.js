import React, { Fragment, useEffect, useState } from "react";
import SidePanel from "../../Components/SidePanel/SidePanel";
import Table from "react-bootstrap/Table";
import { Link, useNavigate } from "react-router";
import { Button, Form, Modal, Offcanvas } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Paginations from "../../Components/Paginations/Paginations";
import logo from "../../acs-logo.png"
import DocumentTypeService from "../../API/DocumentType/DocumentTypeService";
import Loading from "../../Common/Loading";

const DocumentType = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [editDocumentType, setEditDocumentType] = useState(false);
  const [documentTypeList, setDocumentTypeList] = useState([]);
  const [showDocumentTypeList, setShowDocumentTypeList] = useState([]);
  const [editDocumentTypeId, setEditDocumentTypeId] = useState("");
  const [updateDocumentTypeId, setUpdateDocumentTypeId] = useState("");
  const [editDocumentTypeStatus, setEditDocumentTypeStatus] = useState("");
  const [editDocumentTypeQualification, setEditDocumentTypeQualification] = useState('');
  const [updateDocumentTypeStatus, setUpdateDocumentTypeStatus] = useState("");
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);
  const [siteStatus, setSiteStatus] = useState(false);
  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("#d9ebff");
  const [logoImageShow, setLogoImageShow] = useState("");
  const [deleteDocumentTypeId, setDeleteDocumentTypeId] = useState("");
  const [isRotated, setIsRotated] = useState(false);
  const [qualification, setQualification] = useState('');
  const [sort, setSort] = useState({ key: "created_at", value: "desc" });

  const [formShow, setFormShow] = useState(false);
  const handleFormShow = () => setFormShow(true);
  const handleFormClose = () => {
    setShowDocumentTypeList([]);
    setSiteStatus(false);
    setQualification("");
    setFormShow(false);
  };

  const [showmodal, setShowmodal] = useState(false);
  const handleModalShow = () => setShowmodal(true);
  const handleModalClose = () => {
    setShowmodal(false);
    setSiteStatus(false);
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
      DocumentTypeList(sort, currentPage, editDocumentTypeStatus, editDocumentTypeQualification);
      setEditDocumentTypeStatus("");
    } else {
      navigate("/");
    }
  }, [sort]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    DocumentTypeList(sort, page, editDocumentTypeStatus, editDocumentTypeQualification); // Fetch data for the selected page
  };

  const DocumentTypeList = async (sort, page = 1, status, editDocumentTypeQualification) => {
    setIsLoading(true);
    try {
      const useData = {
        sort: {
          key: sort.key,
          value: sort.value
        },
        page,
        status: status,
        type_for: editDocumentTypeQualification
      };
      const response = await DocumentTypeService.document_type_list(useData);
      if (response.data.status) {
        setIsLoading(false);
        setDocumentTypeList(response.data.DocumentType.data);
        setCurrentPage(response.data.DocumentType.meta.current_page);
        setTotalPages(response.data.DocumentType.meta.last_page);
        setTotalRecord(response.data.DocumentType.meta.total);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const NewDocumentTypeCreate = async (e) => {
    e.preventDefault();
    if (e.target.elements.nameLabel.value == "") {
      setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
      return;
    }
    try {
      var useData = {
        name: e.target.elements.nameLabel.value ?? "",
        type_for: e.target.elements.qualificationLabel.value ?? "",
        site_status: siteStatus == true ? 'end_of_site' : 'on_site'
      };

      const response = await DocumentTypeService.create_document_type(useData);
      if (response.data.status) {
        setFormShow(false);
        setSiteStatus(false);
        DocumentTypeList(sort, 1, "", "");
      } else {
        setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
      }
    } catch (error) {
      setFlashMessage({ type: "error", message: error.response.data.message || t("somethingWentWrong") });
    }
  };

  const ShowDocumentType = async (e, id) => {
    e.preventDefault();
    setEditDocumentTypeId(id);
    try {
      const response = await DocumentTypeService.show_document_type(id);
      if (response.data.status) {
        setShowDocumentTypeList(response.data.DocumentType);
        if (response.data.DocumentType.site_status === "end_of_site") {
          setSiteStatus(true);
        } else {
          setSiteStatus(false);
        }
        setQualification(response.data.DocumentType.type_for);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const EditDocumentType = async (e) => {
    e.preventDefault();
    if (e.target.elements.nameLabel.value == "") {
      setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
      return;
    }
    try {
      var useData = {
        name: e.target.elements.nameLabel.value ?? "",
        type_for: e.target.elements.qualificationLabel.value ?? "",
        site_status: siteStatus == true ? 'end_of_site' : 'on_site'
      };

      const response = await DocumentTypeService.edit_document_type(editDocumentTypeId, useData);
      if (response.data.status) {
        setFormShow(false);
        setSiteStatus(false);
        DocumentTypeList(sort, currentPage, "", "");
      } else {
        setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
      }
    } catch (error) {
      setFlashMessage({ type: "error", message: error.response.data.message || t("somethingWentWrong") });
    }
  };

  const DeleteDocumentType = async () => {
    try {
      const response = await DocumentTypeService.delete_document_type(deleteDocumentTypeId);
      if (response.data.status) {
        DocumentTypeList(sort, 1, "", "");
        handleCloseDeleteModal();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const HandleUpdateStatus = async () => {
    try {
      var useData = {
        status: updateDocumentTypeStatus == 1 ? "0" : "1",
      };
      const response = await DocumentTypeService.document_type_status_update(updateDocumentTypeId, useData);
      if (response.data.status) {
        setEditDocumentTypeStatus("");
        DocumentTypeList(sort, currentPage, "", "");
        handleModalClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleStatusChange = (id, status) => {
    setUpdateDocumentTypeId(id);
    setUpdateDocumentTypeStatus(status);
    handleModalShow();
  };

  const HandleFilterStatus = (status) => {
    setEditDocumentTypeStatus(status);
    DocumentTypeList(sort, 1, status, editDocumentTypeQualification)
  };

  const HandleFilterQualification = (qualification) => {
    setEditDocumentTypeQualification(qualification);
    DocumentTypeList(sort, 1, editDocumentTypeStatus, qualification)
  };

  const handleClickRotate = (column) => {
    const direction = sort.key === column ? (sort.value === "desc" ? "asc" : "desc") : "asc";
    setSort({ key: column, value: direction });
    setIsRotated(!isRotated); // Toggle the class on click
  };

  const handleQualificationChange = (e) => {
    setQualification(e.target.value);
  }

  const handleCheckboxChange = (e) => {
    setSiteStatus(e.target.checked)
  };

  return (
    <Fragment>
      <style> {` button.btn.btn-primary  { background-color: ${localStorage.getItem('button_color') ? JSON.parse(localStorage.getItem('button_color')) : "#e84455"} !Important};`} </style>

      <SidePanel sidebarLogo={`${process.env.REACT_APP_IMAGE_URL}/${logoImageShow}`} />

      <div className="dashboard-main-content user-management" style={{ backgroundColor: rightPanelThemeColor }}>
        <h1 className="mb-5">{t("documentTypeLabel")}</h1>

        <div className="table-wrapper mt-16">
          <div className="text-end mb-3">
            <Button onClick={() => { setShowDocumentTypeList([]); handleFormShow(); setEditDocumentType(false); }} variant="primary">
              {t("AddDocumentType")}
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
                    <th>
                      <div className="d-flex align-items-center">
                        <div>
                          <Form.Select aria-label="statusSelectAria" value={editDocumentTypeQualification} onChange={(e) => HandleFilterQualification(e.target.value)}>
                            <option value="">{t("Rattachement")}</option>
                            <option value="general">{t("Dossier")}</option>
                            <option value="speaker">{t("Intervenant")}</option>
                          </Form.Select>
                        </div>
                        <Link
                          className={`sorting-icon ms-2`}
                          onClick={() => handleClickRotate("type_for")}
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
                    <th> Fin de chantier</th>
                    <th width={165} className="select-drop">
                      <div className="d-flex align-items-center">
                        <div>
                          <Form.Select aria-label="statusSelectAria" value={editDocumentTypeStatus} onChange={(e) => HandleFilterStatus(e.target.value)}>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documentTypeList?.length > 0 ?
                    documentTypeList?.map((data, index) => (
                      <tr>
                        <td>{(currentPage - 1) * 10 + (index + 1)}</td>
                        <td className="bold-font">{data.name}</td>
                        <td className="bold-font">{data.type_for == 'general' ? 'Dossier' : data.type_for == 'speaker' ? 'Intervenant' : ''}</td>
                        <td>
                          <div>
                            <Form.Check
                              id="select-all-checkbox"
                              checked={data.site_status === "end_of_site"}
                            />
                          </div>
                        </td>
                        <td>{data.status == 1 ? <span className="verified badges" onClick={() => handleStatusChange(data.id, data.status)} style={{ cursor: "pointer" }}>{t("activeLabel")}</span> : <span className="incomplete badges" onClick={() => handleStatusChange(data.id, data.status)} style={{ cursor: "pointer" }}>{t("inActiveLabel")}</span>}</td>
                        <td>
                          <div className="action-btn">
                            <Link className="edit" onClick={(e) => { ShowDocumentType(e, data.id); handleFormShow(); setEditDocumentType(true); }}>
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
                            <Link className="delete" onClick={() => {handleShowDeleteModal(); setDeleteDocumentTypeId(data.id)}}>
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
                        <td colSpan="6">
                          {t("NorecordsfoundLabel")}
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </Table>
            </div>}
          {totalRecord > 10 &&
            <Paginations
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          }
        </div>
      </div>

      {/* Add User Canvas */}
      <Offcanvas
        className="account-request-pannel"
        placement="end"
        show={formShow}
        onHide={handleFormClose}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{editDocumentType ? t("EditDocumentType") : t("AddDocumentType")}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={editDocumentType ? EditDocumentType : NewDocumentTypeCreate}>
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
              <Form.Control type="text" placeholder={t("nameLabel")} defaultValue={showDocumentTypeList?.name} name="nameLabel" />
            </Form.Group>
            <Form.Group controlId="qualificationLabel">
              <Form.Label>Rattachement <span>*</span></Form.Label>
              <Form.Select
                defaultValue={showDocumentTypeList?.type_for}
                value={qualification}
                onChange={handleQualificationChange}
                aria-label="statusSelectAria"
              >
                <option value="">Sélectionner une qualification</option>
                <option value="general">Dossier</option>
                <option value="speaker">Intervenant</option>
              </Form.Select>

            </Form.Group>
            <div className="mt-3">

              <Form.Label className="d-flex">
                <Form.Check
                  id="select-all-checkbox"
                  checked={siteStatus}
                  onChange={handleCheckboxChange}
                />
                <span style={{ paddingLeft: "5px", cursor: "pointer" }}>Fin de chantier</span>
              </Form.Label>
            </div>
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
          <p>Etes-vous sûr de vouloir supprimer le type de document?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button className="cancel-btn" variant="primary" onClick={handleCloseDeleteModal}>
            Annuler
          </Button>
          <Button variant="primary" onClick={DeleteDocumentType}>
            {t("confirmbtnLabel")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default DocumentType;