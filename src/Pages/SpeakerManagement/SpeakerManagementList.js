import React, { Fragment, useEffect, useState } from "react";
import SidePanel from "../../Components/SidePanel/SidePanel";
import Table from "react-bootstrap/Table";
import { Link, useNavigate } from "react-router";
import { Button, Form, InputGroup, Modal, Offcanvas } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Paginations from "../../Components/Paginations/Paginations";
import logo from "../../acs-logo.png"
import SpeakerManagementService from "../../API/SpeakerManagement/SpeakerManagementService";
import Loading from "../../Common/Loading";

const SpeakerManagementList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [editSpeaker, setEditSpeaker] = useState(false);
    const [speakerManagementList, setSpeakerManagementList] = useState([]);
    const [editSpeakerStatusId, setEditSpeakerStatusId] = useState("");
    const [updateSpeakerStatusId, setUpdateSpeakerStatusId] = useState("");
    const [editSpeakerStatus, setEditSpeakerStatus] = useState("");
    const [updateSpeakerStatus, setUpdateSpeakerStatus] = useState("");
    const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [logoImageShow, setLogoImageShow] = useState("");
    const [deleteSpeakerId, setDeleteSpeakerId] = useState("");
    const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
    const [isRotated, setIsRotated] = useState(false);
    const [sort, setSort] = useState({ key: "created_at", value: "desc" });

    const [showSpeakerList, setShowSpeakerList] = useState([]);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [sirenNumber, setSirenNumber] = useState("");
    const [showSirenNumberDetail, setShowSirenNumberDetail] = useState([]);

    const [formShow, setFormShow] = useState(false);
    const handleFormShow = () => setFormShow(true);
    const handleFormClose = () => {
        setFormShow(false);
        setSirenNumber("");
        setShowSirenNumberDetail([]);
    };

    const [showmodal, setShowmodal] = useState(false);
    const handleModalClose = () => setShowmodal(false);
    const handleModalShow = () => setShowmodal(true);

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
            SpeakerList(sort, currentPage, editSpeakerStatus);
        } else {
            navigate("/");
        }
    }, [sort]);

    useEffect(() => {
        if (showSpeakerList?.siren_number) {
            setShowSirenNumberDetail(showSpeakerList);
        }
    }, [showSpeakerList]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        SpeakerList(sort, page, editSpeakerStatus); // Fetch data for the selected page
    };

    const SpeakerList = async (sort, page = 1, status) => {
        setIsLoading(true);
        try {
            const useData = {
                sort: {
                    key: sort.key,
                    value: sort.value
                },
                page,
                status: status ?? "",
            };
            const response = await SpeakerManagementService.speaker_list(useData);
            if (response.data.status) {
                setIsLoading(false);
                setSpeakerManagementList(response.data.speakers.data);
                setCurrentPage(response.data.speakers.meta.current_page);
                setTotalPages(response.data.speakers.meta.last_page);
                setTotalRecords(response.data.speakers.meta.total);
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error);
        }
    };

    const NewSpeakerCreate = async (e) => {
        e.preventDefault();

        if (e.target.elements.company_name.value == "" || e.target.elements.siren_number.value == "") {
            setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
            return;
        }

        try {
            var useData = {
                siren_number: e.target.elements.siren_number.value ?? "",
                company_name: e.target.elements.company_name.value ?? "",
                nic_number: e.target.elements.nic_number.value ?? "",
                siret_number: e.target.elements.siret_number.value ?? "",
                address: e.target.elements.address.value ?? "",
                city: e.target.elements.city.value ?? "",
                postcode: e.target.elements.postcode.value ?? "",
            };

            const response = await SpeakerManagementService.create_speaker_type(useData);

            if (response.data.status) {
                setFormShow(false);
                setShowSirenNumberDetail([]);
                SpeakerList(sort, 1, "");
            } else {
                setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
            }
        } catch (error) {

            setFlashMessage({ type: "error", message: error.response.data.message || t("somethingWentWrong") });
        }
    };

    const ShowSpeaker = async (e, id) => {
        e.preventDefault();
        setEditSpeakerStatusId(id);
        try {
            const response = await SpeakerManagementService.show_speaker_type(id);
            if (response.data.status) {
                setShowSpeakerList(response.data.Speaker);
                HandleGetDetails(response.data.Speaker.siren_number);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const EditSpeaker = async (e) => {
        e.preventDefault();

        if (e.target.elements.company_name.value == "" || e.target.elements.siren_number.value == "") {
            setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
            return;
        }

        try {
            var useData = {
                siren_number: e.target.elements.siren_number.value ?? "",
                company_name: e.target.elements.company_name.value ?? "",
                nic_number: e.target.elements.nic_number.value ?? "",
                siret_number: e.target.elements.siret_number.value ?? "",
                address: e.target.elements.address.value ?? "",
                city: e.target.elements.city.value ?? "",
                postcode: e.target.elements.postcode.value ?? "",
            };

            const response = await SpeakerManagementService.edit_speaker_type(editSpeakerStatusId, useData);

            if (response.data.status) {
                setFormShow(false);
                setShowSirenNumberDetail([]);
                SpeakerList(sort, currentPage, editSpeakerStatus);
            } else {
                setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
            }
        } catch (error) {
            setFlashMessage({ type: "error", message: error.response.data.message || t("somethingWentWrong") });
        }
    };

    const DeleteSpeaker = async () => {
        try {
            const response = await SpeakerManagementService.delete_speaker_type(deleteSpeakerId);
            if (response.data.status) {
                SpeakerList(sort, currentPage, editSpeakerStatus);
                handleCloseDeleteModal();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const HandleUpdateStatus = async () => {
        try {
            var useData = {
                status: updateSpeakerStatus == 1 ? "0" : "1",
            };
            const response = await SpeakerManagementService.speaker_type_status_update(updateSpeakerStatusId, useData);
            if (response.data.status) {
                SpeakerList(sort, currentPage, "");
                handleModalClose();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const HandleGetDetails = async (sirenNumber) => {
        setIsFormLoading(true);
        if (sirenNumber == "" || sirenNumber == null || sirenNumber == undefined) {
            setIsFormLoading(false);
            setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
            return;
        }
        try {
            const response = await SpeakerManagementService.get_speaker_details(sirenNumber);
            if (response.data.status) {
                setIsFormLoading(false);
                setShowSirenNumberDetail(response.data.data);
            } else {
                setIsFormLoading(false);
                setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
            }
        } catch (error) {
            setIsFormLoading(false);
            setFlashMessage({ type: "error", message: t("somethingWentWrong") });
        }
    };

    const handleStatusChange = (id, status) => {
        setUpdateSpeakerStatusId(id);
        setUpdateSpeakerStatus(status);
        handleModalShow();
    };

    const HandleFilterStatus = (status) => {
        setEditSpeakerStatus(status);
        SpeakerList(sort, currentPage, status);
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
                <h1 className="mb-5">{t("SpeakerManagement")}</h1>
                <div className="table-wrapper mt-16">
                    <div className="text-end mb-3">
                        <Button onClick={() => { handleFormShow(); setEditSpeaker(false); }} variant="primary">
                            {t("AddSpeaker")}
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
                                                <span>{t("companyname")}</span>
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
                                        <th>
                                            <div className="d-flex align-items-center">
                                                <span>{t("address")}</span>
                                                <Link
                                                    className={`sorting-icon ms-2`}
                                                    onClick={() => handleClickRotate("address")}
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
                                                <span>{t("city")}</span>
                                                <Link
                                                    className={`sorting-icon ms-2`}
                                                    onClick={() => handleClickRotate("city")}
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
                                                <span>{t("postcode")}</span>
                                                <Link
                                                    className={`sorting-icon ms-2`}
                                                    onClick={() => handleClickRotate("postcode")}
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
                                        <th className="select-drop elips-dropdown">
                                            <div className="d-flex align-items-center">
                                                <div>
                                                    <Form.Select aria-label="statusSelectAria" value={editSpeakerStatus} onChange={(e) => HandleFilterStatus(e.target.value)}>
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
                                    {speakerManagementList?.length > 0 ?
                                        speakerManagementList?.map((data, index) => (
                                            <tr>
                                                <td>{(currentPage - 1) * 10 + (index + 1)}</td>
                                                <td className="bold-font">{data.company_name}</td>
                                                <td className="bold-font">{data.address}</td>
                                                <td className="bold-font">{data.city}</td>
                                                <td className="bold-font">{data.postcode}</td>
                                                <td>{data.status == 1 ? <span className="verified badges" style={{ cursor: 'pointer' }} onClick={() => handleStatusChange(data.id, data.status)}>{t("activeLabel")}</span> : <span className="incomplete badges" onClick={() => handleStatusChange(data.id, data.status)}>{t("inActiveLabel")}</span>}</td>
                                                <td>
                                                    <div className="action-btn">
                                                        <Link className="edit" onClick={(e) => { ShowSpeaker(e, data.id); handleFormShow(); setEditSpeaker(true); }}>
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
                                                        <Link className="delete" onClick={() => {handleShowDeleteModal(); setDeleteSpeakerId(data.id)}}>
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
                                                <td colSpan="7">
                                                    {t("NorecordsfoundLabel")}
                                                </td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </Table>
                        </div>}
                    {totalRecords > 10 &&
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
                    <Offcanvas.Title>{editSpeaker ? t("EditSpeaker") : t("AddSpeaker")}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form onSubmit={editSpeaker ? EditSpeaker : NewSpeakerCreate}>
                        {flashMessage.message && (
                            <div
                                className={`alert ${flashMessage.type === "success" ? "alert-success" : "alert-danger"
                                    } text-center`}
                                role="alert"
                            >
                                {flashMessage.message}
                            </div>
                        )}
                        <Form.Group controlId="siret_number">
                            <Form.Label>N° de SIRET <span>*</span></Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="SIRET"
                                    defaultValue={showSirenNumberDetail?.siret_number}
                                    name="siret_number"
                                    onChange={(e) => setSirenNumber(e.target.value)}
                                />
                                <Button
                                    variant="primary"
                                    onClick={() => HandleGetDetails(sirenNumber)}
                                    style={{
                                        height: '52px',
                                        borderTopLeftRadius: 0,
                                        borderBottomLeftRadius: 0
                                    }}
                                >
                                    Obtenir des détails
                                </Button>
                            </InputGroup>
                        </Form.Group>

                        {isFormLoading ? <Loading /> :
                            <Fragment>
                                <Form.Group controlId="companyname">
                                    <Form.Label>{t("companyname")} <span>*</span></Form.Label>
                                    <Form.Control type="text" placeholder={t("companyname")} defaultValue={showSirenNumberDetail?.company_name} name="company_name" />
                                </Form.Group>

                                <Form.Group controlId="nic_number">
                                    <Form.Label>N° de NIC</Form.Label>
                                    <Form.Control type="text" placeholder="NIC" defaultValue={showSirenNumberDetail?.nic_number} name="nic_number" />
                                </Form.Group>

                                <Form.Group controlId="siren_number">
                                    <Form.Label>N° de SIREN</Form.Label>
                                    <Form.Control type="text" placeholder="SIREN" defaultValue={showSirenNumberDetail?.siren_number} name="siren_number" />
                                </Form.Group>

                                <Form.Group controlId="address">
                                    <Form.Label>{t("address")}</Form.Label>
                                    <Form.Control type="text" placeholder={t("address")} defaultValue={showSirenNumberDetail?.address} name="address" />
                                </Form.Group>

                                <Form.Group controlId="city">
                                    <Form.Label>{t("city")}</Form.Label>
                                    <Form.Control type="text" placeholder={t("city")} defaultValue={showSirenNumberDetail?.city} name="city" />
                                </Form.Group>

                                <Form.Group controlId="postcode">
                                    <Form.Label>{t("postcode")}</Form.Label>
                                    <Form.Control type="text" placeholder={t("postcode")} defaultValue={showSirenNumberDetail?.postcode} name="postcode" />
                                </Form.Group>

                                <div className="canvas-footer text-end">
                                    <Button variant="primary" type="submit">
                                        {t("submitButton")}
                                    </Button>
                                </div>
                            </Fragment>
                        }
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
                    <div className="text-end" >
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
                    <p>Etes-vous sûr de vouloir supprimer le intervenant?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="cancel-btn" variant="primary" onClick={handleCloseDeleteModal}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={DeleteSpeaker}>
                        {t("confirmbtnLabel")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};

export default SpeakerManagementList;