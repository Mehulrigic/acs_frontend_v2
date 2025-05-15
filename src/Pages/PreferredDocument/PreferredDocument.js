import React, { Fragment, useEffect, useState } from "react";
import SidePanel from "../../Components/SidePanel/SidePanel";
import Table from "react-bootstrap/Table";
import { Link } from "react-router";
import { Button, Form, Modal, Offcanvas } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Paginations from "../../Components/Paginations/Paginations";
import logo from "../../acs-logo.png"
import PreferredDocumentService from "../../API/PreferredDocument/PreferredDocumentService";
import AddFolderPanelService from "../../API/AddFolderPanel/AddFolderPanelService";


const PreferredDocument = () => {
  const { t } = useTranslation();
  const [editPreferredDocument, setEditPreferredDocument] = useState(false);
  const [preferredDocumentList, setPreferredDocumentList] = useState([]);
  const [showPreferredDocumentList, setShowPreferredDocumentList] = useState([]);
  const [documentTypeList, setDocumentTypeList] = useState([]);
  const [editPreferredDocumentId, setEditPreferredDocumentId] = useState("");
  const [editPreferredDocumentStatus, setEditPreferredDocumentStatus] = useState("");
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });
  const [selectDocumentType, setSelectDocumentType] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
  const [logoImageShow, setLogoImageShow] = useState("");
  const [formShow, setFormShow] = useState(false);
  const [showmodal, setShowmodal] = useState(false);
  const handleFormClose = () => setFormShow(false);
  const handleFormShow = () => setFormShow(true);
  const handleModalClose = () => setShowmodal(false);
  const handleModalShow = () => setShowmodal(true);


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
    PreferredDocumentList(currentPage, editPreferredDocumentStatus);
    DocumentTypeList();
    setEditPreferredDocumentStatus("");
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    PreferredDocumentList(page, editPreferredDocumentStatus); // Fetch data for the selected page
  };

  const PreferredDocumentList = async (page = 1) => {
    try {
      const useData = {
        page,
      };
      const response = await PreferredDocumentService.preferred_document_list(useData);
      if (response.data.status) {
        setPreferredDocumentList(response.data.PreferredDocument.data);
        setCurrentPage(response.data.user.meta.current_page);
        setTotalPages(response.data.user.meta.last_page);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const NewPreferredDocumentCreate = async (e) => {
    e.preventDefault();

    try {
      var useData = {
        name: e.target.elements.nameLabel.value ?? "",
        required_for: e.target.elements.requiredforLabel.value ?? "",
        doc_type_id: selectDocumentType
      };

      const response = await PreferredDocumentService.create_preferred_document(useData);
      if (response.data.status) {
        setFormShow(false);
        PreferredDocumentList(1, "");
      } else {
        setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
      }
    } catch (error) {
      setFlashMessage({ type: "error", message: error.response.data.message || t("somethingWentWrong") });
    }
  };

  const ShowPreferredDocument = async (e, id) => {
    e.preventDefault();
    setEditPreferredDocumentId(id);
    try {
      const response = await PreferredDocumentService.show_preferred_document(id);
      if (response.data.status) {
        setShowPreferredDocumentList(response.data.PreferredDocument);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const EditPreferredDocument = async (e) => {
    e.preventDefault();

    try {
      var useData = {
        name: e.target.elements.nameLabel.value ?? "",
        required_for: e.target.elements.requiredforLabel.value ?? "",
        doc_type_id: selectDocumentType
      };

      const response = await PreferredDocumentService.edit_preferred_document(editPreferredDocumentId, useData);
      if (response.data.status) {
        setFormShow(false);
        PreferredDocumentList(currentPage, editPreferredDocumentStatus);
      } else {
        setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
      }
    } catch (error) {
      setFlashMessage({ type: "error", message: error.response.data.message || t("somethingWentWrong") });
    }
  };

  const DeletePreferredDocument = async (id) => {
    try {
      const response = await PreferredDocumentService.delete_preferred_document(id);
      if (response.data.status) {
        PreferredDocumentList(currentPage, editPreferredDocumentStatus);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const HandleUpdateStatus = async () => {
    try {
      var useData = {
        status: editPreferredDocumentStatus == 1 ? "0" : "1",
      };
      const response = await PreferredDocumentService.preferred_document_status_update(editPreferredDocumentId, useData);
      if (response.data.status) {
        PreferredDocumentList(currentPage, editPreferredDocumentStatus);
        handleModalClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const DocumentTypeList = async () => {
    try {
      const response = await AddFolderPanelService.document_type_list();
      if (response.data.status) {
        setDocumentTypeList(response.data.docTypeList);
      } else {
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setFlashMessage({
        type: "error",
        message: error.response.data.message || t("somethingWentWrong"),
      });
    }
  };

  const handleStatusChange = (id, status) => {
    setEditPreferredDocumentId(id);
    setEditPreferredDocumentStatus(status);
    handleModalShow();
  };

  const HandleFilterStatus = (status) => {
    setEditPreferredDocumentStatus(status);
    PreferredDocumentList(currentPage, status)
  };

  const handleDocumentTypeChange = (e) => {
    const selectedValue = e.target.value;
    const selectedDocument = documentTypeList.find(
      (doctype) => doctype.id == selectedValue
    );
    setSelectDocumentType(selectedDocument?.id || "");
  };

  return (
    <Fragment>
      <SidePanel sidebarLogo={(logoImageShow == "" || logoImageShow == null || logoImageShow == undefined) ? logo : `${process.env.REACT_APP_IMAGE_URL}/${logoImageShow}`} />
      <div className="dashboard-main-content user-management" style={{backgroundColor: rightPanelThemeColor}}>
        <h1 className="mb-5">{t("documentTypeLabel")}</h1>
        <div className="table-wrapper mt-16">
          <div className="text-end mb-3">
            <Button onClick={() => { setShowPreferredDocumentList([]); handleFormShow(); setEditPreferredDocument(false); }} variant="primary">
              Add
            </Button>
          </div>
          <div className="table-wrap mt-24">
            <Table responsive hover>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>{t("nameLabel")}</th>
                  <th>{t("requiredforLabel")}</th>
                  <th>{t("documentTypeLabel")}</th>
                  <th width={165} className="select-drop">
                    <Form.Select aria-label="statusSelectAria" value={editPreferredDocumentStatus} onChange={(e) => HandleFilterStatus(e.target.value)}>
                      <option value="">{t("status")}</option>
                      <option value="0">{t("inActiveLabel")}</option>
                      <option value="1">{t("activeLabel")}</option>
                    </Form.Select>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {preferredDocumentList?.map((data, index) => (
                  <tr>
                    <td>{index + 1}</td>
                    <td className="bold-font">{data.name}</td>
                    <td className="bold-font">{data.required_for}</td>
                    <td className="bold-font">{data.doc_type_id == 1 ? "Certificate" : "Other"}</td>
                    <td>{data.status == 1 ? <span className="verified badges" onClick={() => handleStatusChange(data.id, data.status)}>{t("activeLabel")}</span> : <span className="incomplete badges" onClick={() => handleStatusChange(data.id, data.status)}>{t("inActiveLabel")}</span>}</td>
                    <td>
                      <div className="action-btn">
                        <Link className="edit" onClick={(e) => { ShowPreferredDocument(e, data.id); handleFormShow(); setEditPreferredDocument(true); }}>
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
                        <Link className="delete" onClick={() => DeletePreferredDocument(data.id)}>
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
                ))}
              </tbody>
            </Table>
          </div>
          <Paginations
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
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
          <Offcanvas.Title>{editPreferredDocument ? "Edit Folder" : "New Folder"}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={editPreferredDocument ? EditPreferredDocument : NewPreferredDocumentCreate}>
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
              <Form.Control type="text" placeholder={t("nameLabel")} defaultValue={showPreferredDocumentList?.name} name="nameLabel" />
            </Form.Group>
            <Form.Group controlId="requiredforLabel">
              <Form.Label>{t("requiredforLabel")} <span>*</span></Form.Label>
              <Form.Control type="text" placeholder={t("requiredforLabel")} defaultValue={showPreferredDocumentList?.required_for} name="requiredforLabel" />
            </Form.Group>
            <Form.Group className="mt-32" controlId="formBasicEmail">
              <Form.Label>{t("documentTypeLabel")} <span>*</span></Form.Label>
              <Form.Select
                aria-label="Choisir un type de document"
                value={selectDocumentType}
                onChange={handleDocumentTypeChange}
              >
                <option disabled value="">{t("selectDocumentTypeLabel")}</option>
                {documentTypeList?.map((doctype) => (
                  <option key={doctype.id} value={doctype.id}>
                    {doctype.name}
                  </option>
                ))}
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
    </Fragment>
  );
};

export default PreferredDocument;