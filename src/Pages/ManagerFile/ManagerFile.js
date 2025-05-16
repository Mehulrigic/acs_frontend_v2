import React, { Fragment, useEffect, useState } from "react";
import "./ManagerFile.css";
import SidePanel from "../../Components/SidePanel/SidePanel";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Paginations from "../../Components/Paginations/Paginations";
import logo from "../../acs-logo.png";
import AcsManagerFileService from "../../API/AcsManager/AcsManagerFileService";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Loading from '../../Common/Loading';
import DashboardManagementService from "../../API/DashboardManagement/DashboardManagementService";

const ManagerFile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fileList, setFileList] = useState([]);
  const [totalRecords, setTotalrecords] = useState(0);
  const [isRotated, setIsRotated] = useState(false);
  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
  const [logoImageShow, setLogoImageShow] = useState("");
  const [editUserStatus, setEditUserStatus] = useState("");
  const [editUserSiteStatus, setEditUserSiteStatus] = useState("");
  const [search, setSearch] = useState("");
  const [deletePermission, setDeletePermission] = useState(false);
  const [showAddcol, setShowAddcol] = useState(false);
  const handleAddcolClose = () => setShowAddcol(false);
  const handleAddcolShow = () => setShowAddcol(true);
  const [sort, setSort] = useState({ key: "created_at", value: "desc" });

  const [isLoading, setIsLoading] = useState(false);
  const [showFolderId, setShowFolderId] = useState("");
    
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const [modalColumns, setModalColumns] = useState({
    Police: true,
    // client: true,
    brokerlabel: true,
    "Date de création": true,
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
    if(token && userRole.includes("Gestionnaire ACS")) {
      const logo_image = JSON.parse(localStorage.getItem("logo_image"));
      const right_panel_color = JSON.parse(localStorage.getItem("right_panel_color"));
      setRightPanelThemeColor(right_panel_color);
      setLogoImageShow(logo_image);
      FileList(search, sort, currentPage, editUserStatus, editUserSiteStatus);
      setEditUserStatus("");
    } else {
      navigate("/");
    }
  }, [sort]);

  const FileList = async (search, sort, page = 1, status, siteStatus) => {
    setIsLoading(true);
    try {
      var userData = {
        search: search,
        sort: {
          key: sort.key,
          value: sort.value
        },
        status: status,
        page,
        site_status: siteStatus,
      };
      const response = await AcsManagerFileService.filelist(userData);
      if (response.data.status) {
        setIsLoading(false);
        setFileList(response.data.documents.data);
        setCurrentPage(response.data.documents.meta.current_page);
        setTotalPages(response.data.documents.meta.last_page);
        setTotalrecords(response.data.documents.meta.total);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    FileList(search, sort, page, editUserStatus, editUserSiteStatus);
  };

  const handleSearchChange = (search) => {
    setSearch(search);
    FileList(search, sort, 1, editUserStatus, editUserSiteStatus);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchChange(search);
    }
  };

  const handleStatusChange = (status) => {
    setEditUserStatus(status);
    FileList(search, sort, 1, status, editUserSiteStatus);
  };

  const handleSiteStatusChange = (status) => {
    setEditUserSiteStatus(status);
    FileList(search, sort, 1, editUserStatus, status);
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
    const direction = sort.key === column ? (sort.value === "desc" ? "asc" : "desc") : "asc";
    setSort({ key: column, value: direction });
    setIsRotated(!isRotated); // Toggle the class on click
  };

  const HandleDeleteDocumentFile = async () => {
    try {
      const response = await DashboardManagementService.delete_user_document(showFolderId);
      if (response.data.status) {
        handleCloseDeleteModal();
        setShowFolderId("");
        FileList(search, sort, currentPage, editUserStatus, editUserSiteStatus);
      }
    } catch (error) {
      console.log(error);
    }
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
      <div className="dashboard-main-content manager-dashboard" style={{ backgroundColor: rightPanelThemeColor }}>
        <div className="top-header">
          <h4>Dossiers</h4>

          <div className="mt-3 d-flex justify-content-between align-items-center">
            <h1 className="m-0">Mes dossiers ({totalRecords})</h1>
          </div>
        </div>
        <div className="table-wrapper mt-32">
          <div className="d-flex align-aitems-center gap-2 justify-content-between">
            <h2 className="m-0">
              {/* Liste des dossiers ({totalRecords}) */}
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
                onClick={() => handleSearchChange(search, 1, editUserStatus)}
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
          {isLoading ? <Loading /> :

            <div className="table-wrap mt-24">
              <Table responsive hover>
                <thead>
                  <tr>
                    {/* {selectedColumns.includes("Assureur") &&
                      <th>
                        <div className="d-flex align-items-center">
                          <span>Assureur</span>
                          <Link
                            className={`sorting-icon ms-2`}
                            onClick={() => handleClickRotate("uploader.first_name")}
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
                    {selectedColumns.includes("Police") &&
                      <th>
                        <div className="d-flex align-items-center">
                          <span>Police</span>
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
                    {selectedColumns.includes("brokerlabel") &&
                      <th>
                        <div className="d-flex align-items-center">
                          <span>{t('brokerlabel')}</span>
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
                    {selectedColumns.includes("status") && (
                      <th className="select-drop">
                        <div className="d-flex align-items-center">
                          <div>
                            <Form.Select
                              aria-label="statusSelectAria"
                              value={editUserStatus}
                              onChange={(e) => handleStatusChange(e.target.value)}
                            >
                              <option value="">{t("status")}</option>
                              <option value="to_be_checked">{t("toBeCheckedLabel")}</option>
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
                      <th className="select-drop">
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
                  {(fileList?.length > 0 && selectedColumns?.length > 0) ?
                    fileList?.map((data, index) => (
                      <tr key={index} onClick={() => navigate(`/manager-file-detail/${data.id}`)}>
                        {selectedColumns.includes("Police") && <td className="bold-font">{data.folder_name}</td>}
                        {/* {selectedColumns.includes("client") && <td className="bold-font">{data.customer_name}</td>} */}
                        {selectedColumns.includes("brokerlabel") && <td className="bold-font">{data.broker?.first_name ? data.broker?.first_name : "Sans"}</td>}
                        {selectedColumns.includes("Date de création") && <td className="bold-font">{data?.start_date}</td>}
                        {selectedColumns.includes("status") &&
                          <td>
                            {
                              data.status === "to_be_checked" ? <span className="checked badges">{t("toBeCheckedLabel")}</span> :
                              data.status === "validated" ? <span className="verified badges">{t("validatedLabel")}</span> :
                              <span className="incomplete badges">{t("invalidLabel")}</span>
                            }
                          </td>
                        }
                        {selectedColumns.includes("Etat du chantier") && <td>{data.site_status === "on_site" ? "En cours de chantier" : "Fin de chantier"}</td>}
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
                      <td colSpan="7">
                        {t("NorecordsfoundLabel")}
                      </td>
                    </tr>
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
            />
          }
        </div>
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

export default ManagerFile;