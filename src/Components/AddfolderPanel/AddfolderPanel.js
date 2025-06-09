import React, { Fragment, useEffect } from "react";
import "./AddfolderPanel.css";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import AddBroker from "../AddBroker/AddBroker";
import AddFolderPanelService from "../../API/AddFolderPanel/AddFolderPanelService";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import { fr } from "date-fns/locale";

const AddfolderPanel = (props) => {
  const { t } = useTranslation();

  const { data, userRole, userName, userId, UserDocument, GetStatistics, FolderList, search, sort, currentPage, editUserStatus, file } = props;
  const [show, setShow] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [brokerList, setBrokerList] = useState([]);
  const [documentTypeList, setDocumentTypeList] = useState([]);
  const [documentTypeListStep2, setDocumentTypeListStep2] = useState([]);
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });

  const [folderName, setFolderName] = useState("");
  const [contractNo, setContractNo] = useState("");
  const [policyholderName, setPolicyholderName] = useState("");
  const [estimatedStartDate, setEstimatedStartDate] = useState(null);
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState(null);
  const [estimatedSiteCost, setEstimatedSiteCost] = useState("");
  const [selectBroker, setSelectBroker] = useState("");

  const [showstep1, setShowStep1] = useState(false);
  const [showstep2, setShowStep2] = useState(false);
  const [showstep3, setShowStep3] = useState(false);
  const [showstep4, setShowStep4] = useState(false);
  const [showstep5, setShowStep5] = useState(false);
  const [showstep6, setShowStep6] = useState(false);
  const [showstep7, setShowStep7] = useState(false);
  const [showstep8, setShowStep8] = useState(false);

  const [fileListStep2, setFileListStep2] = useState([]);
  const [fileListStep3, setFileListStep3] = useState([]);
  const [fileListStep4, setFileListStep4] = useState([]);
  const [fileListStep5, setFileListStep5] = useState([]);
  const [fileListStep6, setFileListStep6] = useState([]);
  const [fileListStep7, setFileListStep7] = useState([]);

  const [selectDocumentType3, setSelectDocumentType3] = useState("");
  const [selectDocumentTypeName3, setSelectDocumentTypeName3] = useState("");
  const [selectDocumentType4, setSelectDocumentType4] = useState("");
  const [selectDocumentTypeName4, setSelectDocumentTypeName4] = useState("");
  const [selectDocumentType5, setSelectDocumentType5] = useState("");
  const [selectDocumentTypeName5, setSelectDocumentTypeName5] = useState("");
  const [selectDocumentType6, setSelectDocumentType6] = useState("");
  const [selectDocumentTypeName6, setSelectDocumentTypeName6] = useState("");

  const handleClose = () => {
    setShow(false);
    setShowStep1(false);
    setShowStep2(false);
    setShowStep3(false);
    setShowStep4(false);
    setShowStep5(false);
    setShowStep6(false);
    setShowStep7(false);
    setShowStep8(false);
    setFolderName("");
    setContractNo("");
    setSelectBroker("");
    setSelectDocumentType3("");
    setSelectDocumentTypeName3("");
    setSelectDocumentType4("");
    setSelectDocumentTypeName4("");
    setSelectDocumentType5("");
    setSelectDocumentTypeName5("");
    setSelectDocumentType6("");
    setSelectDocumentTypeName6("");
    setFileListStep2([]);
    setFileListStep3([]);
    setFileListStep4([]);
    setFileListStep5([]);
    setFileListStep6([]);
    setFileListStep7([]);
  };

  const handleShow = () => {
    setShow(true);
    setShowStep1(true);
  };

  useEffect(() => {
    if (showstep7) {
      const combinedFiles = [
        ...fileListStep2,
        ...fileListStep3,
        ...fileListStep4,
        ...fileListStep5,
        ...fileListStep6
      ];
      setFileListStep7(combinedFiles);
    }
  }, [showstep7]);

  useEffect(() => {
    if (showstep1) {
      BrokerList();
    }
  }, [showstep1]);

  useEffect(() => {
    if (showstep2) {
      if (userRole.includes("Courtier")) {
        DocumentTypeList("documents_de_chantier_généraux");
      } else {
        DocumentTypeList("police");
      }
    } else if (showstep3) {
      DocumentTypeList("rapports_d’étude");
    } else if (showstep4) {
      DocumentTypeList("documents_de_chantier_généraux");
    } else if (showstep5) {
      DocumentTypeList("contracteur");
    } else if (showstep6) {
      DocumentTypeList("déclaration_coût_définitif");
    } else {
      return;
    }
  }, [showstep2, showstep3, showstep4, showstep5, showstep6]);

  useEffect(() => {
    if (flashMessage.message) {
      const timer = setTimeout(() => {
        setFlashMessage({ type: "", message: "" });
      }, 3000); // Adjust time as needed

      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  const BrokerList = async () => {
    try {
      const response = await AddFolderPanelService.broker_list();
      if (response.data.status) {
        setBrokerList(response.data.brokerList);
      } else {
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const DocumentTypeList = async (slug) => {
    try {
      const response = await AddFolderPanelService.document_type_list(slug);
      if (response.data.status) {
        if (showstep2) {
          setDocumentTypeListStep2(response.data.docTypeList);
        } else {
          setDocumentTypeList(response.data.docTypeList);
        }
      } else {
        setDocumentTypeList([]);
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      console.log(error);
      setDocumentTypeList([]);
    }
  };

  const HandleStoreDocument = async (e) => {
    e.preventDefault();
    setUploadingDoc(true);

    try {
      const documents = [];
      if (fileListStep7?.length) {
        documents.push(...fileListStep7);
      }

      const formData = new FormData();
      formData.append("folder_name", folderName ?? "");
      formData.append("broker_id", userRole == "Courtier" ? userId : selectBroker);
      formData.append("contract_no", contractNo ?? "");
      formData.append("insurance_policyholder_name", policyholderName ?? "");
      formData.append("estimated_start_date", estimatedStartDate ?? "");
      formData.append("estimated_completion_date", estimatedCompletionDate ?? "");
      formData.append("estimated_site_cost", estimatedSiteCost ?? "");

      documents.forEach((doc, index) => {
        formData.append(`documents[${index}][file]`, doc.file); // Actual file
        formData.append(`documents[${index}][filename]`, doc.filename);
        formData.append(`documents[${index}][doc_type_id]`, doc.doc_type_id);
        formData.append(`documents[${index}][doc_Type_Name]`, doc.doc_Type_Name);
      });

      const response = await AddFolderPanelService.store_document(formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status) {
        setShowStep8(true);
        setShowStep7(false);
        if ((userRole.includes("Courtier") || userRole.includes("Assureur")) && file) {
          FolderList(search, sort, currentPage, editUserStatus);
        } else {
          UserDocument(search, sort, currentPage, editUserStatus);
          GetStatistics();
        }
      } else {
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }

    } catch (error) {
      if (error.response?.data?.message === "La valeur du champ folder name a déjà été prise.") {
        setFlashMessage({
          type: "error",
          message: error.response.data.message,
        });
        setShowStep7(false);
        setShowStep1(true);
      } else {
        setFlashMessage({
          type: "error",
          message: t("somethingWentWrong"),
        });
      }
    } finally {
      setUploadingDoc(false);
    }
  };


  const HandlePreviousPage = () => {
    if (showstep2) {
      setShowStep2(false);
      setShowStep1(true);
    } else if (showstep3) {
      setShowStep3(false);
      setShowStep2(true);
    } else if (showstep4) {
      setShowStep4(false);
      setShowStep3(true);
    } else if (showstep5) {
      setShowStep5(false);
      setShowStep4(true);
    } else if (showstep6) {
      setShowStep6(false);
      setShowStep5(true);
    } else {
      setShowStep7(false);
      setShowStep6(true);
    }
  };

  const handleNextPage = () => {
    if (showstep1) {
      if (folderName != "") {
        setShowStep2(true);
        setShowStep1(false);
      } else {
        setFlashMessage({ type: "error", message: t("requriedErrorMessage") });
      }
    } else if (showstep2) {
      if (fileListStep2?.length > 0) {
        setShowStep3(true);
        setShowStep2(false);
      } else {
        setFlashMessage({ type: "error", message: t("requriedErrorMessage") });
      }
    } else if (showstep3) {
      setShowStep4(true);
      setShowStep3(false);
    } else if (showstep4) {
      setShowStep5(true);
      setShowStep4(false);
    } else if (showstep5) {
      setShowStep6(true);
      setShowStep5(false);
    } else {
      setShowStep7(true);
      setShowStep6(false);
    }
  };

  const handleBrokerChange = (e) => {
    setSelectBroker(e.target.value);
  };

  const handleDocumentTypeChange = (e) => {
    const selectedValue = e.target.value;
    const selectedDocument = documentTypeList.find(
      (doctype) => doctype.id == selectedValue
    );
    if (showstep3) {
      setSelectDocumentType3(selectedDocument?.id || "");
      setSelectDocumentTypeName3(selectedDocument?.name || "");
    } else if (showstep4) {
      setSelectDocumentType4(selectedDocument?.id || "");
      setSelectDocumentTypeName4(selectedDocument?.name || "");
    } else if (showstep5) {
      setSelectDocumentType5(selectedDocument?.id || "");
      setSelectDocumentTypeName5(selectedDocument?.name || "");
    } else if (showstep6) {
      setSelectDocumentType6(selectedDocument?.id || "");
      setSelectDocumentTypeName6(selectedDocument?.name || "");
    } else {
      return;
    }
  };

  const allowedFileTypes = [
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/pdf", // .pdf
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-powerpoint", // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  ];

  const maxFileSize = 50 * 1024 * 1024;

  const handleFileChangeStep2 = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];

    for (const file of files) {
      if (!allowedFileTypes.includes(file.type)) {
        setFlashMessage({
          type: "error",
          message: `Ce type de document n'est pas pris en charge: ${file.name}`,
        });
        continue;
      }

      if (file.size > maxFileSize) {
        setFlashMessage({
          type: "error",
          message: `Limite de taille atteinte. Vos fichiers ne doivent pas dépasser 50 Mo: ${file.name}`,
        });
        continue;
      }

      const filterDocType = documentTypeListStep2?.find((doctype) => doctype.name === "Police");
      const filterDocTypeBroker = documentTypeListStep2?.find((doctype) => doctype.name === "Questionnaire");

      newFiles.push({
        file, // actual File object
        filename: file.name,
        doc_type_id: userRole.includes("Courtier") ? filterDocTypeBroker?.id : filterDocType?.id,
        doc_Type_Name: userRole.includes("Courtier") ? filterDocTypeBroker?.name : filterDocType?.name
      });
    }

    if (newFiles.length > 0) {
      setFileListStep2((prev) => [...prev, ...newFiles]);
    }

    e.target.value = ""; // Reset the file input
  };


  const handleFileChangeStep3 = async (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];

    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]); // Extract only Base64 content
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    };

    for (const file of files) {
      if (!allowedFileTypes.includes(file.type)) {
        setFlashMessage({
          type: "error",
          message: `Ce type de document n'est pas pris en charge: ${file.name}`,
        });
        continue;
      }

      if (file.size > maxFileSize) {
        setFlashMessage({
          type: "error",
          message: `Limite de taille atteinte. Vos fichiers ne doivent pas dépasser 50 Mo: ${file.name}`,
        });
        continue;
      }

      const filterDocType = documentTypeListStep2?.find((doctype) => doctype.name === "Police");
      const filterDocTypeBroker = documentTypeListStep2?.find((doctype) => doctype.name === "Questionnaire");

      newFiles.push({
        file, // actual File object
        filename: file.name,
        doc_type_id: selectDocumentType3 ? selectDocumentType3 : userRole.includes("Courtier") ? filterDocTypeBroker?.id : filterDocType?.id,
        doc_Type_Name: selectDocumentTypeName3 ? selectDocumentTypeName3 : userRole.includes("Courtier") ? filterDocTypeBroker?.name : filterDocType?.name
      });
    }

    if (newFiles.length > 0) {
      setFileListStep3((prevFiles) => [...prevFiles, ...newFiles]);
    }

    e.target.value = ""; // Reset the file input
  };

  const handleFileChangeStep4 = async (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];

    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]); // Extract only Base64 content
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    };

    for (const file of files) {
      if (!allowedFileTypes.includes(file.type)) {
        setFlashMessage({
          type: "error",
          message: `Ce type de document n'est pas pris en charge: ${file.name}`,
        });
        continue;
      }

      if (file.size > maxFileSize) {
        setFlashMessage({
          type: "error",
          message: `Limite de taille atteinte. Vos fichiers ne doivent pas dépasser 50 Mo: ${file.name}`,
        });
        continue;
      }

      const filterDocType = documentTypeListStep2?.find((doctype) => doctype.name === "Police");
      const filterDocTypeBroker = documentTypeListStep2?.find((doctype) => doctype.name === "Questionnaire");

      newFiles.push({
        file, // actual File object
        filename: file.name,
        doc_type_id: selectDocumentType4 ? selectDocumentType4 : userRole.includes("Courtier") ? filterDocTypeBroker?.id : filterDocType?.id,
        doc_Type_Name: selectDocumentTypeName4 ? selectDocumentTypeName4 : userRole.includes("Courtier") ? filterDocTypeBroker?.name : filterDocType?.name
      });
    }

    if (newFiles.length > 0) {
      setFileListStep4((prevFiles) => [...prevFiles, ...newFiles]);
    }

    e.target.value = ""; // Reset the file input
  };

  const handleFileChangeStep5 = async (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];

    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]); // Extract only Base64 content
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    };

    for (const file of files) {
      if (!allowedFileTypes.includes(file.type)) {
        setFlashMessage({
          type: "error",
          message: `Ce type de document n'est pas pris en charge: ${file.name}`,
        });
        continue;
      }

      if (file.size > maxFileSize) {
        setFlashMessage({
          type: "error",
          message: `Limite de taille atteinte. Vos fichiers ne doivent pas dépasser 50 Mo: ${file.name}`,
        });
        continue;
      }

      const filterDocType = documentTypeListStep2?.find((doctype) => doctype.name === "Police");
      const filterDocTypeBroker = documentTypeListStep2?.find((doctype) => doctype.name === "Questionnaire");

      newFiles.push({
        file, // actual File object
        filename: file.name,
        doc_type_id: selectDocumentType5 ? selectDocumentType5 : userRole.includes("Courtier") ? filterDocTypeBroker?.id : filterDocType?.id,
        doc_Type_Name: selectDocumentTypeName5 ? selectDocumentTypeName5 : userRole.includes("Courtier") ? filterDocTypeBroker?.name : filterDocType?.name
      });
    }

    if (newFiles.length > 0) {
      setFileListStep5((prevFiles) => [...prevFiles, ...newFiles]);
    }

    e.target.value = ""; // Reset the file input
  };

  const handleFileChangeStep6 = async (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];

    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]); // Extract only Base64 content
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    };

    for (const file of files) {
      if (!allowedFileTypes.includes(file.type)) {
        setFlashMessage({
          type: "error",
          message: `Ce type de document n'est pas pris en charge: ${file.name}`,
        });
        continue;
      }

      if (file.size > maxFileSize) {
        setFlashMessage({
          type: "error",
          message: `Limite de taille atteinte. Vos fichiers ne doivent pas dépasser 50 Mo: ${file.name}`,
        });
        continue;
      }

      const filterDocType = documentTypeListStep2?.find((doctype) => doctype.name === "Police");
      const filterDocTypeBroker = documentTypeListStep2?.find((doctype) => doctype.name === "Questionnaire");

      newFiles.push({
        file, // actual File object
        filename: file.name,
        doc_type_id: selectDocumentType6 ? selectDocumentType6 : userRole.includes("Courtier") ? filterDocTypeBroker?.id : filterDocType?.id,
        doc_Type_Name: selectDocumentTypeName6 ? selectDocumentTypeName6 : userRole.includes("Courtier") ? filterDocTypeBroker?.name : filterDocType?.name
      });
    }

    if (newFiles.length > 0) {
      setFileListStep6((prevFiles) => [...prevFiles, ...newFiles]);
    }

    e.target.value = ""; // Reset the file input
  };

  const handleRemoveFileStep2 = (index) => {
    setFileListStep2((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleRemoveFileStep3 = (index) => {
    setFileListStep3((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleRemoveFileStep4 = (index) => {
    setFileListStep4((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleRemoveFileStep5 = (index) => {
    setFileListStep5((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleRemoveFileStep6 = (index) => {
    setFileListStep6((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleRemoveFileStep7 = (index) => {
    setFileListStep7((prevFiles) => prevFiles.filter((_, i) => i !== index));
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

  const formatDate = (dateString) => {
    if (dateString) {
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

  return (
    <Fragment>
      <style> {` button.btn.btn-primary  { background-color: ${localStorage.getItem('button_color') ? JSON.parse(localStorage.getItem('button_color')) : "#e84455"} !Important};`} </style>

      <button onClick={handleShow} className="big-btn-icon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="white" />
        </svg>
        Ajouter un dossier
      </button>

      <Offcanvas
        className={`add-folder-panel ${data ? data : ""}`}
        placement={"end"}
        show={show}
        onHide={handleClose}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Nouveau dossier</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* step 1 */}
          {showstep1 && (
            <div className="step-1">
              <h2>1 - Information dossiers</h2>
              <span className="complete-process">
                Complétez les informations relatives au dossier
              </span>
              <Form>
                {flashMessage.message && (
                  <div
                    className={`mt-3 alert ${flashMessage.type === "success"
                        ? "alert-success"
                        : "alert-danger"
                      } text-center`}
                    role="alert"
                  >
                    {flashMessage.message}
                  </div>
                )}

                <Form.Group className="mt-32" controlId="formBasicEmail">
                  <Form.Label>
                    N° de dossier <span>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="N° de dossier"
                    value={folderName}
                    onChange={(e) => {
                      const value = e.target.value;
                      const filteredValue = value.replace(/[^a-zA-Z0-9 ]/g, "");
                      setFolderName(filteredValue);
                    }}
                  />
                </Form.Group>

                <Form.Group className="mt-32" controlId="formBasicEmail">
                  <Form.Label>Numéro de contrat</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Numéro de contrat"
                    value={contractNo}
                    onChange={(e) => setContractNo(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mt-32" controlId="formBasicEmail">
                  <Form.Label>Nom du preneur d'assurance</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nom du preneur d'assurance"
                    value={policyholderName}
                    onChange={(e) => setPolicyholderName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mt-32" controlId="names">
                  <Form.Label className="d-block">Date de début prévisionnelle</Form.Label>
                  <DatePicker
                    placeholderText="Selectionner une date de début prévisionnelle"
                    selected={estimatedStartDate ? getFormattedDate(estimatedStartDate) : null}
                    onChange={(date) => setEstimatedStartDate(formatDate(date))}
                    dateFormat="dd/MM/yyyy"
                    locale={fr}
                  />
                </Form.Group>

                <Form.Group className="mt-32" controlId="names">
                  <Form.Label className="d-block">Date de fin de chantier prévisionnelle</Form.Label>
                  <DatePicker
                    placeholderText="Selectionner une date de fin de chantier prévisionnelle"
                    selected={estimatedCompletionDate ? getFormattedDate(estimatedCompletionDate) : null}
                    onChange={(date) => setEstimatedCompletionDate(formatDate(date))}
                    dateFormat="dd/MM/yyyy"
                    locale={fr}
                  />
                </Form.Group>

                <Form.Group className="mt-32" controlId="formBasicEmail">
                  <Form.Label>Coût prévisionnel du chantier</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Entrez le coût estimé du site"
                    value={estimatedSiteCost}
                    onChange={(e) => {
                      const value = e.target.value;
                      const onlyNumbers = value.replace(/[^0-9.]/g, '');
                      setEstimatedSiteCost(onlyNumbers);
                    }}
                  />
                </Form.Group>


                {userRole != "Courtier" &&
                  <Form.Group className="mt-32" controlId="formBasicEmail">
                    <Form.Label>Sélectionner Courtier</Form.Label>
                    <Form.Select
                      className="full-width mb-3"
                      aria-label={"statusSelectAria"}
                      value={selectBroker}
                      onChange={handleBrokerChange}
                    >
                      <option value="" disabled>
                        Sélectionner Courtier
                      </option>
                      {brokerList?.length > 0 ?
                        brokerList?.map((broker) => (
                          <option value={broker.id}>{broker.first_name}</option>
                        )) : (
                          <option value="">{t("NorecordsfoundLabel")}</option>
                        )
                      }
                    </Form.Select>
                    <AddBroker BrokerList={BrokerList} />
                  </Form.Group>
                }
              </Form>
            </div>
          )}

          {/* step 2 */}
          {showstep2 && (
            <div className="step-2">
              {userRole == "Courtier" ?
                <>
                  <h2>2 - Questionnaire de risque <span>*</span></h2>
                  <span className="complete-process">
                    Ajouter d'autres documents liés au dossier
                  </span>
                </>
                :
                <h2>2 - Téléchargement Police <span>*</span></h2>
              }
              <Form>
                {flashMessage.message && (
                  <div
                    className={`mt-3 alert ${flashMessage.type === "success"
                        ? "alert-success"
                        : "alert-danger"
                      } text-center`}
                    role="alert"
                  >
                    {flashMessage.message}
                  </div>
                )}
                <Form.Group
                  controlId="formFile"
                  className="file-upload-container mt-4"
                >
                  <div
                    className="custom-upload-box"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();

                      const files = e.dataTransfer.files;
                      if (files.length) {
                        handleFileChangeStep2({ target: { files } });
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
                      <span className="browse-link">{t("browsemyfilesLabel")}</span>
                    </p>
                    <span>
                      {t("documentsAcceptedLabel")}: mot, exceller, pdf, PowerPoint
                    </span>
                    <Form.Control
                      type="file"
                      className="file-input"
                      multiple
                      onChange={handleFileChangeStep2}
                    />
                  </div>
                </Form.Group>
              </Form>
              {fileListStep2.length > 0 && (
                <div className="upload-file-list">
                  {fileListStep2.map((file, index) => (
                    <div key={index} className="upload-file">
                      <span>{file.filename}</span>
                      <Link onClick={() => handleRemoveFileStep2(index)}>
                        <svg
                          width="14"
                          height="18"
                          viewBox="0 0 14 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11 6V16H3V6H11ZM9.5 0H4.5L3.5 1H0V3H14V1H10.5L9.5 0ZM13 4H1V16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4Z"
                            fill="#e84455"
                          />
                        </svg>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* step 3 */}
          {showstep3 && (
            <div className="step-3">
              <h2>3 - Rapports d’étude</h2>
              <Form>
                {flashMessage.message && (
                  <div
                    className={`mt-3 alert ${flashMessage.type === "success"
                        ? "alert-success"
                        : "alert-danger"
                      } text-center`}
                    role="alert"
                  >
                    {flashMessage.message}
                  </div>
                )}
                <Form.Group className="mt-32" controlId="formBasicEmail">
                  <Form.Label>{t("documentTypeLabel")}</Form.Label>
                  <Form.Select
                    aria-label="Choisir un type de document"
                    value={selectDocumentType3}
                    onChange={handleDocumentTypeChange}
                  >
                    <option value="">{t("selectDocumentTypeLabel")}</option>
                    {documentTypeList?.length > 0 ?
                      documentTypeList?.map((doctype) => (
                        <option key={doctype.id} value={doctype.id}>
                          {doctype.name}
                        </option>
                      )) : (
                        <option value="">{t("NorecordsfoundLabel")}</option>
                      )
                    }
                  </Form.Select>
                </Form.Group>
                <Form.Group
                  controlId="formFile"
                  className="file-upload-container mt-4"
                >
                  <div
                    className="custom-upload-box"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();

                      const files = e.dataTransfer.files;
                      if (files.length) {
                        handleFileChangeStep3({ target: { files } });
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
                      <span className="browse-link">{t("browsemyfilesLabel")}</span>
                    </p>
                    <span>
                      {t("documentsAcceptedLabel")}: mot, exceller, pdf, PowerPoint
                    </span>
                    <Form.Control
                      type="file"
                      className="file-input"
                      multiple
                      onChange={handleFileChangeStep3}
                    />
                  </div>
                </Form.Group>
              </Form>
              {fileListStep3.length > 0 && (
                <div className="upload-file-list">
                  {fileListStep3.map((file, index) => (
                    <div key={index} className="upload-file">
                      <span>{file.filename}</span>
                      <Link onClick={() => handleRemoveFileStep3(index)}>
                        <svg
                          width="14"
                          height="18"
                          viewBox="0 0 14 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11 6V16H3V6H11ZM9.5 0H4.5L3.5 1H0V3H14V1H10.5L9.5 0ZM13 4H1V16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4Z"
                            fill="#e84455"
                          />
                        </svg>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* step 4 */}
          {showstep4 && (
            <div className="step-4">
              <h2>4 - Documents de chantier généraux</h2>
              <Form>
                {flashMessage.message && (
                  <div
                    className={`mt-3 alert ${flashMessage.type === "success"
                        ? "alert-success"
                        : "alert-danger"
                      } text-center`}
                    role="alert"
                  >
                    {flashMessage.message}
                  </div>
                )}
                <Form.Group className="mt-32" controlId="formBasicEmail">
                  <Form.Label>{t("documentTypeLabel")}</Form.Label>
                  <Form.Select
                    aria-label="Choisir un type de document"
                    value={selectDocumentType4}
                    onChange={handleDocumentTypeChange}
                  >
                    <option value="">{t("selectDocumentTypeLabel")}</option>
                    {documentTypeList?.length > 0 ?
                      documentTypeList?.map((doctype) => (
                        <option key={doctype.id} value={doctype.id}>
                          {doctype.name}
                        </option>
                      )) : (
                        <option value="">{t("NorecordsfoundLabel")}</option>
                      )
                    }
                  </Form.Select>
                </Form.Group>
                <Form.Group
                  controlId="formFile"
                  className="file-upload-container mt-4"
                >
                  <div
                    className="custom-upload-box"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();

                      const files = e.dataTransfer.files;
                      if (files.length) {
                        handleFileChangeStep3({ target: { files } });
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
                      <span className="browse-link">{t("browsemyfilesLabel")}</span>
                    </p>
                    <span>
                      {t("documentsAcceptedLabel")}: mot, exceller, pdf, PowerPoint
                    </span>
                    <Form.Control
                      type="file"
                      className="file-input"
                      multiple
                      onChange={handleFileChangeStep4}
                    />
                  </div>
                </Form.Group>
              </Form>
              {fileListStep4.length > 0 && (
                <div className="upload-file-list">
                  {fileListStep4.map((file, index) => (
                    <div key={index} className="upload-file">
                      <span>{file.filename}</span>
                      <Link onClick={() => handleRemoveFileStep4(index)}>
                        <svg
                          width="14"
                          height="18"
                          viewBox="0 0 14 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11 6V16H3V6H11ZM9.5 0H4.5L3.5 1H0V3H14V1H10.5L9.5 0ZM13 4H1V16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4Z"
                            fill="#e84455"
                          />
                        </svg>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* step 5 */}
          {showstep5 && (
            <div className="step-5">
              <h2>5 - Contracteur</h2>
              <Form>
                {flashMessage.message && (
                  <div
                    className={`mt-3 alert ${flashMessage.type === "success"
                        ? "alert-success"
                        : "alert-danger"
                      } text-center`}
                    role="alert"
                  >
                    {flashMessage.message}
                  </div>
                )}
                <Form.Group className="mt-32" controlId="formBasicEmail">
                  <Form.Label>{t("documentTypeLabel")}</Form.Label>
                  <Form.Select
                    aria-label="Choisir un type de document"
                    value={selectDocumentType5}
                    onChange={handleDocumentTypeChange}
                  >
                    <option value="">{t("selectDocumentTypeLabel")}</option>
                    {documentTypeList?.length > 0 ?
                      documentTypeList?.map((doctype) => (
                        <option key={doctype.id} value={doctype.id}>
                          {doctype.name}
                        </option>
                      )) : (
                        <option value="">{t("NorecordsfoundLabel")}</option>
                      )
                    }
                  </Form.Select>
                </Form.Group>
                <Form.Group
                  controlId="formFile"
                  className="file-upload-container mt-4"
                >
                  <div
                    className="custom-upload-box"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();

                      const files = e.dataTransfer.files;
                      if (files.length) {
                        handleFileChangeStep5({ target: { files } });
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
                      <span className="browse-link">{t("browsemyfilesLabel")}</span>
                    </p>
                    <span>
                      {t("documentsAcceptedLabel")}: mot, exceller, pdf, PowerPoint
                    </span>
                    <Form.Control
                      type="file"
                      className="file-input"
                      multiple
                      onChange={handleFileChangeStep5}
                    />
                  </div>
                </Form.Group>
              </Form>
              {fileListStep5.length > 0 && (
                <div className="upload-file-list">
                  {fileListStep5.map((file, index) => (
                    <div key={index} className="upload-file">
                      <span>{file.filename}</span>
                      <Link onClick={() => handleRemoveFileStep5(index)}>
                        <svg
                          width="14"
                          height="18"
                          viewBox="0 0 14 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11 6V16H3V6H11ZM9.5 0H4.5L3.5 1H0V3H14V1H10.5L9.5 0ZM13 4H1V16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4Z"
                            fill="#e84455"
                          />
                        </svg>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* step 6 */}
          {showstep6 && (
            <div className="step-6">
              <h2>6 - Déclaration coût définitif</h2>
              <Form>
                {flashMessage.message && (
                  <div
                    className={`mt-3 alert ${flashMessage.type === "success"
                        ? "alert-success"
                        : "alert-danger"
                      } text-center`}
                    role="alert"
                  >
                    {flashMessage.message}
                  </div>
                )}
                <Form.Group className="mt-32" controlId="formBasicEmail">
                  <Form.Label>{t("documentTypeLabel")}</Form.Label>
                  <Form.Select
                    aria-label="Choisir un type de document"
                    value={selectDocumentType6}
                    onChange={handleDocumentTypeChange}
                  >
                    <option value="">{t("selectDocumentTypeLabel")}</option>
                    {documentTypeList?.length > 0 ?
                      documentTypeList?.map((doctype) => (
                        <option key={doctype.id} value={doctype.id}>
                          {doctype.name}
                        </option>
                      )) : (
                        <option value="">{t("NorecordsfoundLabel")}</option>
                      )
                    }
                  </Form.Select>
                </Form.Group>
                <Form.Group
                  controlId="formFile"
                  className="file-upload-container mt-4"
                >
                  <div
                    className="custom-upload-box"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();

                      const files = e.dataTransfer.files;
                      if (files.length) {
                        handleFileChangeStep6({ target: { files } });
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
                      <span className="browse-link">{t("browsemyfilesLabel")}</span>
                    </p>
                    <span>
                      {t("documentsAcceptedLabel")}: mot, exceller, pdf, PowerPoint
                    </span>
                    <Form.Control
                      type="file"
                      className="file-input"
                      multiple
                      onChange={handleFileChangeStep6}
                    />
                  </div>
                </Form.Group>
              </Form>
              {fileListStep6.length > 0 && (
                <div className="upload-file-list">
                  {fileListStep6.map((file, index) => (
                    <div key={index} className="upload-file">
                      <span>{file.filename}</span>
                      <Link onClick={() => handleRemoveFileStep6(index)}>
                        <svg
                          width="14"
                          height="18"
                          viewBox="0 0 14 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11 6V16H3V6H11ZM9.5 0H4.5L3.5 1H0V3H14V1H10.5L9.5 0ZM13 4H1V16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4Z"
                            fill="#e84455"
                          />
                        </svg>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* step 7 */}
          {showstep7 && (
            <div className="step-7">
              <h2>7 - Récapitulatif</h2>
              <Form>
                {flashMessage.message && (
                  <div
                    className={`mt-3 alert ${flashMessage.type === "success"
                        ? "alert-success"
                        : "alert-danger"
                      } text-center`}
                    role="alert"
                  >
                    {flashMessage.message}
                  </div>
                )}
                <Form.Group className="mt-32" controlId="formBasicEmail">
                  <Form.Label>Informations générales</Form.Label>
                </Form.Group>
                <div className="d-flex justify-content-between align-aitems-center mt-24">
                  <div className="file-name">N° Dossier</div>
                  <div className="file-number">{folderName}</div>
                </div>
                {userRole.includes("Courtier") &&
                  <div className="d-flex justify-content-between align-aitems-center mt-24">
                    <div className="file-name">Courtier</div>
                    <div className="file-number">{userName}</div>
                  </div>
                }
                <Form.Group className="mt-32" controlId="formBasicEmail">
                  <Form.Label>Documents associés</Form.Label>
                </Form.Group>
              </Form>
              {fileListStep7.length > 0 && (
                <div className="upload-file-list">
                  {fileListStep7.map((file, index) => (
                    <div key={index} className="upload-file">
                      <span className="filename">{file.filename}</span>
                      <div className="d-flex align-items-center gap-3">
                        <span className="certificate-name">
                          {file.doc_Type_Name}
                        </span>
                        <Link onClick={() => handleRemoveFileStep7(index)}>
                          <svg
                            width="14"
                            height="18"
                            viewBox="0 0 14 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11 6V16H3V6H11ZM9.5 0H4.5L3.5 1H0V3H14V1H10.5L9.5 0ZM13 4H1V16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4Z"
                              fill="#e84455"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* step 8 */}
          {showstep8 && (
            <div className="step-5">
              <div className="final-submit">
                <svg
                  width="140"
                  height="94"
                  viewBox="0 0 140 94"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M112.875 35.5668C108.908 15.4418 91.2333 0.333496 70 0.333496C53.1417 0.333496 38.5 9.90016 31.2083 23.9002C13.65 25.7668 0 40.6418 0 58.6668C0 77.9752 15.6917 93.6668 35 93.6668H110.833C126.933 93.6668 140 80.6002 140 64.5002C140 49.1002 128.042 36.6168 112.875 35.5668ZM110.833 82.0002H35C22.1083 82.0002 11.6667 71.5585 11.6667 58.6668C11.6667 46.7085 20.5917 36.7335 32.4333 35.5085L38.675 34.8668L41.5917 29.3252C47.1333 18.6502 57.9833 12.0002 70 12.0002C85.2833 12.0002 98.4667 22.8502 101.442 37.8418L103.192 46.5918L112.117 47.2335C121.217 47.8168 128.333 55.4585 128.333 64.5002C128.333 74.1252 120.458 82.0002 110.833 82.0002ZM58.3333 59.7168L46.1417 47.5252L37.9167 55.7502L58.3333 76.1668L93.3917 41.1085L85.1667 32.8835L58.3333 59.7168Z"
                    fill="#00366B"
                  />
                </svg>
                <h2>Le dossier a été créé</h2>
                {userRole == "Courtier" &&
                  <span className="complete-process">
                    Notre équipe de souscription reviendra vers vous sous 48 heures
                  </span>
                }
                <Link onClick={handleClose} className="close-sutter">
                  Fermer le volet
                </Link>
              </div>
            </div>
          )}

        </Offcanvas.Body>
        {!showstep8 && (
          <div className="offcanvas-footer text-end">
            {!showstep1 && (
              <button
                type="submit"
                className="btn btn-primary float-left previous-btn"
                onClick={() => HandlePreviousPage()}
              >
                <svg
                  height="9px"
                  width="12px"
                  version="1.1"
                  id="Layer_1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 410.258 410.258"
                >
                  <polygon
                    fill="#76787B"
                    points="298.052,24 266.052,0 112.206,205.129 266.052,410.258 298.052,386.258 162.206,205.129"
                  />
                </svg>
                {t("previousButton")}
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!(folderName)}
              onClick={(e) =>
                showstep7 ? uploadingDoc ? "" : HandleStoreDocument(e) : handleNextPage()
              }
            >
              {showstep7 ? uploadingDoc ? "Soumission..." : t("submitButton") : t("nextButton")}
            </button>
          </div>
        )}
      </Offcanvas>
    </Fragment>
  );
};

export default AddfolderPanel;
