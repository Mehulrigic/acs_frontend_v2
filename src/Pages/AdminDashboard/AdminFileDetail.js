import React, { Fragment, useEffect, useRef } from "react";
import "react-datepicker/dist/react-datepicker.css";
import SidePanel from "../../Components/SidePanel/SidePanel";
import Table from "react-bootstrap/Table";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { Button, Form, InputGroup, Offcanvas } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import MissingDocument from "../../Components/MissingDocument/MissingDocument";
import Dropdown from "react-bootstrap/Dropdown";
import ProgressBar from "react-bootstrap/ProgressBar";
import DatePicker from "react-datepicker";
import { fr } from "date-fns/locale";
import logo from "../../acs-logo.png";
import { useTranslation } from "react-i18next";
import AcsManagerFileService from "../../API/AcsManager/AcsManagerFileService";
import AddFolderPanelService from "../../API/AddFolderPanel/AddFolderPanelService";
import FilePageService from "../../API/FilePage/FilePageService";
import Paginations from "../../Components/Paginations/Paginations";
import InvalidDocument from "../../Components/InvalidDocument/InvalidDocument";
import Loading from "../../Common/Loading";
import Select from "react-select";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import SpeakerManagementService from "../../API/SpeakerManagement/SpeakerManagementService";
import AddNote from "../../Components/AddNote/AddNote";
import { BsPatchExclamation } from "react-icons/bs";

const AdminFileDetail = () => {
  const [showSepeakerInner, setShowSpeakerInner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const toggleDetail = (e) => {
    e.preventDefault(); // prevent page reload if using <a>
    setIsVisible(!isVisible);
  };
  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [showReader, setShowReader] = useState(false);

  const toggleReader = () => {
    setShowReader((prev) => {
      const newState = !prev;

      // Toggle class on body
      if (newState) {
        document.body.classList.add("show-reader");
      } else {
        document.body.classList.remove("show-reader");
      }

      return newState;
    });
  };

  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const now = 66;
  const nows = 37;
  const [isLoading, setIsLoading] = useState(false);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [showSpeakerId, setShowSpeakerId] = useState("");
  const [showDocumentId, setShowDocumentId] = useState("");
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [showUserDocumentAfterDeleteFile, setShowUserDocumentAfterDeleteFile] =
    useState(false);
  const [deleteSpeakerDocId, setDeleteSpeakerDocId] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleShowDeleteModal = () => setShowDeleteModal(true);

  const [showDeleteModalSpeaker, setShowDeleteModalSpeaker] = useState(false);
  const handleCloseDeleteModalSpeaker = () => setShowDeleteModalSpeaker(false);
  const handleShowDeleteModalSpeaker = () => setShowDeleteModalSpeaker(true);

  const [showDeleteModalSpeakerDocument, setShowDeleteModalSpeakerDocument] =
    useState(false);
  const handleCloseDeleteModalSpeakerDocument = () =>
    setShowDeleteModalSpeakerDocument(false);
  const handleShowDeleteModalSpeakerDocument = () =>
    setShowDeleteModalSpeakerDocument(true);

  const handleCloseFinalModal = () => setShowFinalModal(false);
  const handleShowFinalModal = () => setShowFinalModal(true);

  const [contractNo, setContractNo] = useState("");
  const [selectBroker, setSelectBroker] = useState("");
  const [brokerList, setBrokerList] = useState([]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [startDate4, setStartDate4] = useState(null);
  const [startDate5, setStartDate5] = useState(null);
  const [startDate6, setStartDate6] = useState(null);

  const [paperList, setPaperList] = useState([]);
  const [documentTypeList, setDocumentTypeList] = useState([]);
  const [selectDocumentType, setSelectDocumentType] = useState("");
  const [selectSpeakerId, setSelectSpeakerId] = useState("");
  const [selectIsRequired, setSelectIsRequired] = useState("0");

  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });
  const [editUserStatus, setEditUserStatus] = useState("");
  const [editUserSiteStatus, setEditUserSiteStatus] = useState("");

  const [speakerList, setSpeakerList] = useState([]);
  const [speakerDropDownList, setSpeakerDropDownList] = useState([]);
  const [folderDetail, setFolderDetail] = useState([]);
  const [fileDetail, setFileDetail] = useState();
  const [speakerDetail, setSpeakerDetail] = useState({});
  const [speakerDocumentTypeList, setSpeakerDocumentTypeList] = useState([]);
  const [markIsReadCount, setMarkIsReadCount] = useState(0);
  const [missingDocumentList, setMissingDocumentList] = useState([]);
  const [historyDocumentList, setHistoryDocumentList] = useState([]);
  const [recordsToShow, setRecordsToShow] = useState(2);
  const [showUserDocumentDataId, setShowUserDocumentDataId] = useState("");
  const [showSpeakerDocument, setShowSpeakerDocument] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [missingDocumentId, setMissingDocumentId] = useState("");
  const [flashMessageStoreDoc, setFlashMessageStoreDoc] = useState({
    type: "",
    message: "",
  });
  const [showUserDocumentData, setShowUserDocumentData] = useState([]);
  const [showUserFolderName, setShowUserFolderName] = useState("");
  const [showUserCompanyName, setShowUserCompanyName] = useState("");
  const [validateDocumnetFilter, setValidateDocumnetFilter] = useState("");
  const [showUserDocumentFileData, setShowUserDocumentFileData] = useState([]);
  const [userDocumentFileDataChanges, setUserDocumentFileDataChanges] =
    useState({
      id: "",
      status: "",
      filename: "",
      doc_type_id: "",
      speaker_id: "",
    });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPaperRecords, setTotalPaperRecords] = useState(0);
  const [totalSpeakerRecords, setTotalSpeakerRecords] = useState(0);
  const [totalMissingRecords, setTotalMissingRecords] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState("speaker");
  const [history, setHistory] = useState([]);
  const [totalSpeakerDocument, setTotalSpeakerDocument] = useState(0);
  const [totalMissingDocument, setTotalMissingDocument] = useState(0);
  const [selectDocumentId, setSelectDocumentId] = useState("");
  const [selectDocumentFileName, setSelectDocumentFileName] = useState("");
  const [isRotated, setIsRotated] = useState(false);
  const [sort, setSort] = useState({ key: "created_at", value: "desc" });

  const [paperModalColumns, setPaperModalColumns] = useState({
    fileNameLabe: true,
    speakerLabel: true,
    "Type de document": true,
    status: true,
    Actions: true,
  });

  const [selectedSpeakerColumns, setSelectedSpeakerColumns] = useState(
    Object.keys(paperModalColumns).filter((key) => paperModalColumns[key])
  );

  const [showAddPaperCol, setShowAddPaperCol] = useState(false);
  const handleAddPaperColClose = () => setShowAddPaperCol(false);
  const handleAddPaperColShow = () => setShowAddPaperCol(true);

  const [showSiteStatusChange, setShowSiteStatusChange] = useState(false);
  const handleSiteStatusChangeShow = () => setShowSiteStatusChange(true);
  const handleSiteStatusChangeClose = () => setShowSiteStatusChange(false);

  const [showNotRequiredStatusChange, setShowNotRequiredStatusChange] =
    useState(false);
  const handleNotRequiredChangeShow = () =>
    setShowNotRequiredStatusChange(true);
  const handleNotRequiredChangeClose = () =>
    setShowNotRequiredStatusChange(false);

  const [showMissingDoc, setShowMissingDoc] = useState(false);
  const handleMissingDocShow = () => setShowMissingDoc(true);
  const handleMissingDocClose = () => {
    setShowMissingDoc(false);
    setFileList([]);
  };

  const [showViewSpeaker, setShowViewSpeaker] = useState(false);
  const handleViewShowSpeaker = () => setShowViewSpeaker(true);
  const handleViewCloseSpeaker = () => {
    SpeakerList(id, sort, currentPage);
    setShowViewSpeaker(false);
  };

  const [showViewPaperDoc, setShowViewPaperDoc] = useState(false);
  const handleViewClosePaperDoc = () => setShowViewPaperDoc(false);
  const handleViewShowPaperDoc = (id) => {
    setShowViewPaperDoc(true);
    FileDetails(id);
  };

  const [showCheck, setShowCheck] = useState(false);
  const handleCheckShow = () => setShowCheck(true);
  const handleCheckClose = () => {
    setShowCheck(false);
    setShowDocumentId("");
    setEditUserStatus("");
    setSelectDocumentType("");
    setSelectSpeakerId("");
    setActiveTab(activeTab);
    PaperList(id, sort, currentPage, "", "", "");
    ShowUserDocumentData(id);
    DocumentTypeList();
    SpeakerDropDownList("", 1);
    setCurrentFileIndex(0);
  };

  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
  const [buttonColor, setButtonColor] = useState("");
  const [logoImageShow, setLogoImageShow] = useState("");
  const [sendToFileStatus, setSendToFileStatus] = useState("");
  const [showSendFileChange, setShowSendFileChange] = useState(false);
  const handleSendFileShow = (status) => {
    setSendToFileStatus(status);
    setShowSendFileChange(true);
  };
  const handleSendFileClose = () => setShowSendFileChange(false);

  const [policyholderName, setPolicyholderName] = useState("");
  const [estimatedSiteCost, setEstimatedSiteCost] = useState("");
  const [estimatedStartDate, setEstimatedStartDate] = useState(null);
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState(null);
  const [finalSiteCost, setFinaldSiteCost] = useState("");
  const [finalStartDate, setFinalStartDate] = useState(null);
  const [finalCompletionDate, setFinalCompletionDate] = useState(null);
  const [documentUploading, setDocumentUploading] = useState(false);

  const [search, setSearch] = useState("");
  const [selectActionType, setSelectActionType] = useState("");
  const [totalHistoryRecords, setTotalHistoryRecords] = useState(0);

  const [isFormLoading, setIsFormLoading] = useState(false);
  const [SIRETNumber, setSIRETNumber] = useState("");
  const [showSirenNumberDetail, setShowSirenNumberDetail] = useState([]);

  const [show, setShow] = useState(false);
  const handleModalShow = () => setShow(true);
  const handleModalClose = () => {
    setShow(false);
    setShowSirenNumberDetail([]);
    setSIRETNumber("");
    setIsFormLoading(false);
  };

  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [selectedAddNoteDocId, setSelectedAddNoteDocId] = useState(null);
  const [selectedAddNoteDocName, setSelectedAddNoteDocName] = useState("");
  const [invalidReasonNoteList, setInvalidReasonNoteList] = useState([]);
  const [recordsToShowNOte, setRecordsToShowNote] = useState(3);

  const [showNote, setShowNote] = useState(false);
  const handleNoteShow = () => setShowNote(true);
  const handleNoteClose = () => setShowNote(false);

  useEffect(() => {
    if (showNote) {
      GetDocumentFileNotesList(id, "");
    }
  }, [showNote]);

  useEffect(() => {
    if (flashMessage.message) {
      const timer = setTimeout(() => {
        setFlashMessage({ type: "", message: "" });
      }, 3000); // Adjust time as needed

      return () => clearTimeout(timer);
    }

    if (flashMessageStoreDoc.message) {
      const timer = setTimeout(() => {
        setFlashMessageStoreDoc({ type: "", message: "" });
      }, 2000); // Adjust time as needed

      return () => {
        handleViewCloseSpeaker();
        handleMissingDocClose();
        clearTimeout(timer);
      };
    }
  }, [flashMessage, flashMessageStoreDoc]);

  useEffect(() => {
    const logo_image = JSON.parse(localStorage.getItem("logo_image"));
    const button_color = JSON.parse(localStorage.getItem("button_color"));
    const right_panel_color = JSON.parse(
      localStorage.getItem("right_panel_color")
    );
    setRightPanelThemeColor(right_panel_color);
    setButtonColor(button_color);
    setLogoImageShow(logo_image);
  }, []);

  useEffect(() => {
    const userRole = JSON.parse(localStorage.getItem("userRole"));
    const token = localStorage.getItem("authToken");
    if (token && userRole.includes("Administrateur")) {
      ShowUserDocumentData(id);
      setShowUserDocumentDataId(id);
    } else {
      navigate("/");
    }
  }, [validateDocumnetFilter]);

  useEffect(() => {
    if (activeTab === "information") {
      FolderDetail(id);
      BrokerList();
      SpeakerDropDownList("", 1);
    }
    if (activeTab === "document") {
      PaperList(
        id,
        sort,
        1,
        editUserStatus,
        selectDocumentType,
        selectSpeakerId
      );
      DocumentTypeList();
      SpeakerDropDownList("", 1);
    }
    if (activeTab === "intervenants") {
      SpeakerList(id, sort, 1);
    }
    if (activeTab === "missingdocument") {
      GetMissingDocumentList(id, sort, 1, selectIsRequired);
    }
    if (activeTab === "history") {
      GetHistoryListDocument(id, sort, search, currentPage, selectActionType);
    }
  }, [activeTab]);

  useEffect(() => {
    if (showViewSpeaker) {
      if (activeSubTab === "speaker") {
        SpeakerDetail(showSpeakerId);
      }
      if (activeSubTab === "documents") {
        ShowSpeakerDocument(id, sort, "", 1, "", "", showSpeakerId);
      }
      if (activeSubTab === "documentType") {
        SpeakerDocumentTypeList(id, showSpeakerId);
      }
    }
  }, [activeSubTab, showViewSpeaker]);

  useEffect(() => {
    if (activeTab === "document") {
      PaperList(
        id,
        sort,
        currentPage,
        editUserStatus,
        selectDocumentType,
        selectSpeakerId
      );
    }
    if (activeTab === "intervenants") {
      SpeakerList(id, sort, currentPage);
    }
    if (activeTab === "missingdocument") {
      GetMissingDocumentList(id, sort, currentPage, selectIsRequired);
    }
    if (activeTab === "history") {
      GetHistoryListDocument(id, sort, search, currentPage, selectActionType);
    }
  }, [sort]);

  useEffect(() => {
    if (showCheck && !showDeleteModal) {
      handleDocChange();
      setShowUserDocumentAfterDeleteFile(false);
    }
    if (showCheck) {
      SpeakerDropDownList("", 1);
    }
  }, [
    showCheck,
    showUserDocumentAfterDeleteFile,
    validateDocumnetFilter,
    showUserDocumentFileData,
  ]);

  // const MarkHistoryAsReadAllDocument = async (id) => {
  //   try {
  //     const response = await FilePageService.mark_history_all_as_read(id);
  //     if (response.data.status) {
  //       GetHistoryListDocument(id, sort, search, currentPage, selectActionType);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const GetHistoryListDocument = async (
    id,
    sort,
    search,
    page = 1,
    actionType
  ) => {
    setIsLoading(true);
    try {
      var userData = {
        search,
        sort: {
          key: sort.key,
          value: sort.value,
        },
        page,
        action_type: actionType,
      };

      const response = await FilePageService.history_list(id, userData);

      if (response.data.status) {
        setIsLoading(false);
        // const markIsRead = response.data.history.data.filter((data) => data.is_read == 0);
        // setMarkIsReadCount(markIsRead.length);
        setHistoryDocumentList(response.data.history.data);
        setCurrentPage(response.data.history.meta.current_page);
        setTotalPages(response.data.history.meta.last_page);
        setTotalHistoryRecords(response.data.history.meta.total);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchChange(search, 1);
    }
  };

  const handleSearchChange = (search, page) => {
    setSearch(search);
    GetHistoryListDocument(id, sort, search, page, selectActionType);
  };

  const handleActionTypeChange = (e) => {
    const selectedValue = e.target.value;
    setSelectActionType(selectedValue);
    GetHistoryListDocument(id, sort, search, currentPage, selectedValue);
  };

  // const handleScroll = (e) => {
  //   const { scrollTop, scrollHeight, clientHeight } = e.target;
  //   if (scrollTop + clientHeight >= scrollHeight - 5) {
  //     setRecordsToShow((prev) =>
  //       Math.min(prev + 2, historyDocumentList.length)
  //     );
  //   }
  // };

  // const displayedRecords = historyDocumentList.slice(0, recordsToShow);
  // const MarkHistoryAsReadDocument = async (id) => {
  //   try {
  //     const response = await FilePageService.mark_history_as_read(id);
  //     if (response.data.status) {
  //       GetHistoryListDocument(showUserDocumentDataId);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const ShowSpeakerDocument = async (
    id,
    sort,
    search,
    page = 1,
    status,
    type,
    speaker
  ) => {
    setIsLoading(true);
    const userData = {
      search,
      sort: {
        key: sort.key,
        value: sort.value,
      },
      page,
      status: status,
      type: type,
      speaker_id: speaker,
    };
    try {
      const response = await FilePageService.speaker_document(id, userData);
      if (response.data.status) {
        setIsLoading(false);
        setShowSpeakerDocument(response.data.speaker_documents.data);
        setTotalSpeakerDocument(response.data.speaker_documents.meta.total);
        setCurrentPage(response.data.speaker_documents.meta.current_page);
        setTotalPages(response.data.speaker_documents.meta.last_page);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const SendFileToUpdate = async () => {
    try {
      var userData = {
        status: sendToFileStatus,
      };
      const response = await FilePageService.update_document_status(
        id,
        userData
      );
      if (response.data.status) {
        handleSendFileClose();
        ShowUserDocumentData(id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const handleUpdateFileChange = async (event) => {
  //   const files = Array.from(event.target.files); // Only get the first selected file

  //   const newFiles = [];

  //   const convertToBase64 = (file) => {
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onload = () => resolve(reader.result.split(",")[1]); // Extract only Base64 content
  //       reader.onerror = (error) => reject(error);
  //       reader.readAsDataURL(file);
  //     });
  //   };

  //   for (const file of files) {
  //     if (!allowedFileTypes.includes(file.type)) {
  //       setFlashMessage({
  //         type: "error",
  //         message: `Ce type de document n'est pas pris en charge: ${file.name}`,
  //       });
  //       return; // Exit if invalid file type
  //     }
  //     console.log(file);
  //     if (file.size > maxFileSize) {
  //       setFlashMessage({
  //         type: "error",
  //         message: `Limite de taille atteinte. Vos fichiers ne doivent pas dépasser 50 Mo: ${file.name}`,
  //       });
  //       return; // Exit if file size is too large
  //     }

  //     const base64File = await convertToBase64(file);

  //     newFiles.push({
  //       file: base64File,
  //       name: file.name,
  //     });
  //   }
  //   if (newFiles.length > 0) {
  //     setFileList((prevFiles) => [...prevFiles, ...newFiles]);
  //   }

  //   event.target.value = ""; // Reset the file input
  // };

  const handleUpdateFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = [];

    for (const file of files) {
      if (!allowedFileTypes.includes(file.type)) {
        setFlashMessage({
          type: "error",
          message: `Ce type de document n'est pas pris en charge: ${file.name}`,
        });
        return;
      }

      if (file.size > maxFileSize) {
        setFlashMessage({
          type: "error",
          message: `Limite de taille atteinte. Vos fichiers ne doivent pas dépasser 50 Mo: ${file.name}`,
        });
        return;
      }

      newFiles.push(file); // Keep File object
    }

    if (newFiles.length > 0) {
      setFileList((prevFiles) => [...prevFiles, ...newFiles]);
    }

    event.target.value = ""; // Reset file input
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

  // const AddMissingDocument = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const documents = [];

  //     if (fileList?.length) {
  //       documents.push(...fileList);
  //     }

  //     var userData = {
  //       speaker_id: showSpeakerId,
  //       missing_document_id: missingDocumentId,
  //       documents: documents
  //     }

  //     const response = await FilePageService.add_missing_document(id, userData);

  //     if (response.data.status) {
  //       setFileList([]);
  //       setFlashMessageStoreDoc({
  //         type: "success",
  //         message: response.data.message || t("somethingWentWrong"),
  //       });

  //       if (activeTab === "speakerdocument") {
  //         if (activeSubTab === "documentType") {
  //           SpeakerDocumentTypeList(id, showSpeakerId);
  //         }
  //       }
  //       if (activeTab === "missingdocument") {
  //         GetMissingDocumentList(id, sort, 1, selectIsRequired);
  //       }
  //       ShowUserDocumentData(id);
  //     } else {
  //       setFlashMessageStoreDoc({
  //         type: "error",
  //         message: response.data.message || t("somethingWentWrong"),
  //       });
  //     }
  //   } catch (error) {
  //     setFlashMessageStoreDoc({
  //       type: "error",
  //       message: t("somethingWentWrong"),
  //     });
  //   }
  // };

  const AddMissingDocument = async (e) => {
    e.preventDefault();
    setDocumentUploading(true);

    try {
      const formData = new FormData();
      formData.append("speaker_id", showSpeakerId);
      formData.append("missing_document_id", missingDocumentId);

      if (fileList?.length) {
        fileList.forEach((file) => {
          formData.append("documents[]", file); // Use array-style key for multiple files
        });
      }

      const response = await FilePageService.add_missing_document(
        id,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.status) {
        setDocumentUploading(false);
        setFileList([]);
        ShowUserDocumentData(id);
        setFlashMessageStoreDoc({
          type: "success",
          message: response.data.message || t("somethingWentWrong"),
        });

        if (activeTab === "speakerdocument") {
          if (activeSubTab === "documentType") {
            SpeakerDocumentTypeList(id, showSpeakerId);
          }
        }
        if (activeTab === "missingdocument") {
          GetMissingDocumentList(id, sort, currentPage, selectIsRequired);
        }

        ShowUserDocumentData(id);
      } else {
        setDocumentUploading(false);
        setFlashMessageStoreDoc({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setDocumentUploading(false);
      setFlashMessageStoreDoc({
        type: "error",
        message: t("somethingWentWrong"),
      });
    }
  };

  const ShowUserDocumentData = async (id) => {
    try {
      var userData = {
        status: validateDocumnetFilter,
      };

      const response = await FilePageService.show_user_document(id, userData);

      if (response.data.status) {
        const fileDataChanges = response.data.documents.user_document_files.map(
          (file) => ({
            id: file.id,
            status: file.status,
            filename: file.filename,
            doc_type_id: file.docType?.id,
            speaker_id: file.speaker?.id ? file.speaker?.id : "",
          })
        );

        setContractNo(response.data.documents.contract_no);
        setShowUserDocumentData(response.data.documents);
        setShowUserFolderName(response.data.documents.folder_name);
        setShowUserCompanyName(response.data.documents.company_name);
        setTotalMissingRecords(response.data.documents.total_missing_doc);
        setTotalSpeakerRecords(response.data.documents.total_speakers);
        setTotalPaperRecords(
          response.data.documents.user_document_files?.length
        );
        setStartDate(response.data.documents.start_date);
        setEndDate(response.data.documents.complete_date);

        setPolicyholderName(
          response.data.documents.insurance_policyholder_name
        );
        setEstimatedSiteCost(response.data.documents.estimated_site_cost);
        setEstimatedStartDate(response.data.documents.estimated_start_date);
        setEstimatedCompletionDate(
          response.data.documents.estimated_completion_date
        );
        setFinaldSiteCost(response.data.documents.final_site_cost);
        setFinalStartDate(response.data.documents.final_start_date);
        setFinalCompletionDate(response.data.documents.final_completion_date);
        if (
          response.data.documents.status == "transfer_to_insurer" ||
          response.data.documents.status == "transfer_to_broker" ||
          response.data.documents.status == "to_be_decided"
        ) {
          setSendToFileStatus(response.data.documents.status);
        } else {
          setSendToFileStatus("");
        }
        setShowUserDocumentFileData(
          response.data.documents.user_document_files
        );
        setUserDocumentFileDataChanges(fileDataChanges);
        setShowDocumentId(fileDataChanges[0].id);
        if (showCheck && showDeleteModal) {
          setShowUserDocumentAfterDeleteFile(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const GetMissingDocumentList = async (id, sort, page = 1, isRequired) => {
    setIsLoading(true);
    try {
      var userData = {
        page,
        sort: sort,
        is_required: isRequired,
      };
      const response = await FilePageService.missing_document_list(
        id,
        userData
      );
      if (response.data.status) {
        setIsLoading(false);
        setMissingDocumentList(response.data.data.data);
        setCurrentPage(response.data.data.meta.current_page);
        setTotalPages(response.data.data.meta.last_page);
        setTotalMissingRecords(response.data.data.meta.total);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const PaperList = async (id, sort, page = 1, status, type, speaker_id) => {
    setIsLoading(true);
    try {
      var userData = {
        sort: {
          key: sort.key,
          value: sort.value,
        },
        page,
        status: status,
        type: type,
        speaker: speaker_id,
      };
      const response = await AcsManagerFileService.paperList(id, userData);
      if (response.data.status) {
        setIsLoading(false);
        setPaperList(response.data.papers.data);
        setCurrentPage(response.data.papers.meta.current_page);
        setTotalPages(response.data.papers.meta.last_page);
        setTotalPaperRecords(response.data.papers.meta.total);
      } else {
        setIsLoading(false);
        console.log(response.data.message);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const FolderDetail = async (id) => {
    setIsLoading(true);
    try {
      const response = await AcsManagerFileService.folderDetails(id);
      if (response.data.status) {
        setIsLoading(false);
        setFolderDetail(response.data.documents);
        setStartDate4(response.data.documents.created_at);
        setStartDate5(response.data.documents.start_date);
        setStartDate6(response.data.documents.complete_date);
        setEditUserSiteStatus(response.data.documents.site_status);
      } else {
        setIsLoading(false);
        console.log(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const SpeakerList = async (id, sort, page = 1) => {
    setIsLoading(true);
    try {
      var userData = {
        page,
      };
      if (activeTab === "intervenants") {
        var userData = {
          sort: {
            key: sort.key,
            value: sort.value,
          },
          page,
        };
      }
      const response = await AcsManagerFileService.speakerList(id, userData);
      if (response.data.status) {
        setIsLoading(false);
        setSpeakerList(response.data.speakers.data);
        setCurrentPage(response.data.speakers.meta.current_page);
        setTotalPages(response.data.speakers.meta.last_page);
        setTotalSpeakerRecords(response.data.speakers.meta.total);
      } else {
        setIsLoading(false);
        console.log(response.data.message);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const SpeakerDropDownList = async (search, page = 1) => {
    setIsLoading(true);
    try {
      var userData = {
        search: search,
        page,
      };

      const response = await AcsManagerFileService.speaker_DropDown_List(
        userData
      );
      if (response.data.status) {
        setIsLoading(false);
        setSpeakerDropDownList(response.data.speakers);
      } else {
        setIsLoading(false);
        console.log(response.data.message);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const DocumentTypeList = async (slug) => {
    try {
      const response = await AddFolderPanelService.document_type_list(slug);
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

  const handleDocumentTypeChange = (e) => {
    const selectedValue = e.target.value;
    const selectedDocument = documentTypeList.find(
      (doctype) => doctype.id == selectedValue
    );
    setSelectDocumentType(selectedDocument?.id || "");
    if (!showCheck) {
      PaperList(
        id,
        sort,
        currentPage,
        editUserStatus,
        selectedDocument?.id,
        selectSpeakerId
      );
    }

    setUserDocumentFileDataChanges((prevData) => {
      return prevData.map((file) => {
        if (file.id == selectDocumentId) {
          return { ...file, doc_type_id: selectedDocument?.id };
        }
        return file;
      });
    });
  };

  const handleTableSpeakerChange = (e) => {
    const selectedValue = e.target.value;
    setSelectSpeakerId(selectedValue);
    PaperList(
      id,
      sort,
      currentPage,
      editUserStatus,
      selectDocumentType,
      selectedValue
    );

    setUserDocumentFileDataChanges((prevData) => {
      return prevData.map((file) => {
        if (file.id == selectDocumentId) {
          return { ...file, speaker_id: selectedValue };
        }
        return file;
      });
    });
  };

  const handleTableIsRequiredChange = (e) => {
    const selectedValue = e.target.value;
    setSelectIsRequired(selectedValue);
    GetMissingDocumentList(id, sort, 1, selectedValue);
  };

  const handleSpeakerChange = (selectedOption) => {
    const selectedValue = selectedOption?.value;
    setSelectSpeakerId(selectedValue);
    if (!showCheck) {
      PaperList(
        id,
        sort,
        currentPage,
        editUserStatus,
        selectDocumentType,
        selectedValue
      );
    }
    SpeakerDetail(selectedValue);

    setUserDocumentFileDataChanges((prevData) => {
      return prevData.map((file) => {
        if (file.id == selectDocumentId) {
          return { ...file, speaker_id: selectedValue };
        }
        return file;
      });
    });
  };

  const options = [
    { value: "", label: t("SelectSpeaker") }, // null option for default selection
    ...speakerDropDownList?.map((speaker) => ({
      value: speaker.id,
      label: speaker.company_name + " - " + speaker.siren_number,
    })),
  ];

  const handleModalShowInvalid = () => setShowmodalInvalid(true);
  const handleModalCloseInvalid = () => setShowmodalInvalid(false);
  const [showmodalInvalid, setShowmodalInvalid] = useState(false);

  const handleStatusChange = (status) => {
    if (status === "invalid") {
      handleModalShowInvalid();
    }
    setEditUserStatus(status);
    if (!showCheck) {
      PaperList(id, sort, 1, status, selectDocumentType, selectSpeakerId);
    }

    setUserDocumentFileDataChanges((prevData) => {
      return prevData.map((file) => {
        if (file.id == selectDocumentId) {
          return { ...file, status: status };
        }
        return file;
      });
    });
  };

  const FileDetails = async (showDocumentId) => {
    setIsLoading(true);
    try {
      const response = await AcsManagerFileService.fileDetail(showDocumentId);
      if (response.data.status) {
        setIsLoading(false);
        setFileDetail(response.data);
      } else {
        setIsLoading(false);
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const SpeakerDetail = async (showSpeakerId) => {
    setIsLoading(true);
    try {
      const response = await AcsManagerFileService.speakerdetail(showSpeakerId);
      if (response.data.status) {
        setIsLoading(false);
        setSpeakerDetail(response.data);
      } else {
        setIsLoading(false);
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setIsLoading(false);
      setFlashMessage({
        type: "error",
        message: t("somethingWentWrong"),
      });
    }
  };

  const SpeakerDocumentTypeList = async (folderId, speakerId) => {
    setIsLoading(true);
    try {
      var userDate = {
        user_document_id: folderId,
        speaker_id: speakerId,
      };
      const response = await AcsManagerFileService.document_type(userDate);
      if (response.data.status) {
        setIsLoading(false);
        setSpeakerDocumentTypeList(response.data.data);
        setTotalMissingDocument(response.data.data.length);
      } else {
        setIsLoading(false);
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setIsLoading(false);
      setFlashMessage({
        type: "error",
        message: error.response.data.message || t("somethingWentWrong"),
      });
    }
  };

  const handleCheckboxChange = (id) => {
    const updatedList = speakerDocumentTypeList.map((item) =>
      item.id === id
        ? { ...item, is_required: item.is_required === 0 ? 1 : 0 }
        : item
    );
    setSpeakerDocumentTypeList(updatedList);
  };

  const DocumentTypeUpdate = async () => {
    try {
      var userDate = {
        user_document_id: showUserDocumentDataId,
        speaker_id: showSpeakerId,
        id: Object.fromEntries(
          speakerDocumentTypeList.map((item) => [item.id, item.is_required])
        ),
      };
      const response = await AcsManagerFileService.update_document_type(
        userDate
      );
      if (response.data.status) {
        SpeakerDocumentTypeList(showUserDocumentDataId, showSpeakerId);
        setFlashMessage({
          type: "success",
          message: response.data.message || t("somethingWentWrong"),
        });
      } else {
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setFlashMessage({
        type: "error",
        message: t("somethingWentWrong"),
      });
    }
  };

  const DocumentTypeUpdateSingle = async (missingDocTypeId, speakerId) => {
    try {
      const updatedList = missingDocumentList.find(
        (item) => item.id === missingDocTypeId
      );
      console.log(updatedList);

      var userDate = {
        user_document_id: showUserDocumentDataId,
        id: Object.fromEntries(
          Array(updatedList).map((item) => [
            item.id,
            item.is_required === 1 ? 0 : 1,
          ])
        ),
      };

      if (speakerId) {
        userDate.speaker_id = speakerId;
      }

      const response = await AcsManagerFileService.update_document_type(
        userDate
      );

      if (response.data.status) {
        handleNotRequiredChangeClose();
        GetMissingDocumentList(id, sort, currentPage, selectIsRequired);
        setFlashMessage({
          type: "success",
          message: response.data.message || t("somethingWentWrong"),
        });
      } else {
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setFlashMessage({
        type: "error",
        message: t("somethingWentWrong"),
      });
    }
  };

  const handlePageChange = (page) => {
    if (activeTab === "document") {
      PaperList(
        id,
        sort,
        page,
        editUserStatus,
        selectDocumentType,
        selectSpeakerId
      );
    }
    if (activeTab === "intervenants") {
      SpeakerList(id, sort, page);
    }
    if (activeTab === "missingdocument") {
      GetMissingDocumentList(id, sort, page, selectIsRequired);
    }
    if (activeTab === "history") {
      GetHistoryListDocument(id, sort, search, page, selectActionType);
    }
  };

  const handlePageChangeView = (page) => {
    setCurrentPage(page);
    ShowSpeakerDocument(id, sort, "", page, "", "", showSpeakerId);
  };

  const handleSelect = (key) => {
    setHistory((prevHistory) => [...prevHistory, activeTab]);
    setActiveTab(key);
  };

  const handleSubTabSelect = (key) => {
    setActiveSubTab(key);
  };

  const handleDocChange = (e) => {
    if (e === undefined) {
      if (showDocumentId) {
        const selectedDoc = showUserDocumentFileData?.find(
          (doc) => doc.id === parseInt(showDocumentId)
        );
        setSelectDocumentId(showDocumentId);
        setShowDocumentId(showDocumentId);
        setSelectDocumentFileName(selectedDoc?.filename);
        setEditUserStatus(selectedDoc?.status);
        setSelectDocumentType(selectedDoc?.docType?.id);
        setSelectSpeakerId(selectedDoc?.speaker?.id);
        if (selectedDoc?.speaker?.id) {
          SpeakerDetail(selectedDoc?.speaker?.id);
        } else {
          setSpeakerDetail({});
        }

        setUserDocumentFileDataChanges((prevData) => {
          return prevData?.map((file) => {
            if (file.id == showDocumentId) {
              return {
                ...file,
                id: parseInt(showDocumentId),
                status: selectedDoc?.status,
                doc_type_id: selectedDoc?.docType?.id,
                speaker_id: selectedDoc?.speaker?.id,
              };
            }
            return file;
          });
        });
      } else {
        setSelectDocumentId(userDocumentFileDataChanges[0]?.id);
        setShowDocumentId(userDocumentFileDataChanges[0]?.id);
        setSelectDocumentFileName(showUserDocumentFileData[0]?.filename);
        setEditUserStatus(userDocumentFileDataChanges[0]?.status);
        setSelectDocumentType(userDocumentFileDataChanges[0]?.doc_type_id);
        setSelectSpeakerId(userDocumentFileDataChanges[0]?.speaker_id);
        if (userDocumentFileDataChanges[0]?.speaker_id) {
          SpeakerDetail(userDocumentFileDataChanges[0]?.speaker_id);
        } else {
          setSpeakerDetail({});
        }

        setUserDocumentFileDataChanges((prevData) => {
          return prevData?.map((file) => {
            if (file.id == userDocumentFileDataChanges[0]?.id) {
              return {
                ...file,
                id: userDocumentFileDataChanges[0]?.id,
                status: userDocumentFileDataChanges[0]?.status,
                doc_type_id: userDocumentFileDataChanges[0]?.doc_type_id,
                speaker_id: userDocumentFileDataChanges[0]?.speaker_id,
              };
            }
            return file;
          });
        });
      }
    } else {
      const selectedDoc = userDocumentFileDataChanges?.find(
        (doc) => doc.id === parseInt(e.target.value)
      );
      const selectedDocPath = showUserDocumentFileData?.find(
        (doc) => doc.id === parseInt(e.target.value)
      );

      setSelectDocumentId(e.target.value);
      setShowDocumentId(e.target.value);
      setSelectDocumentFileName(selectedDocPath?.filename);
      setEditUserStatus(selectedDoc?.status);
      setSelectDocumentType(selectedDoc?.doc_type_id);
      setSelectSpeakerId(selectedDoc?.speaker_id);
      if (selectedDoc?.speaker_id) {
        SpeakerDetail(selectedDoc?.speaker_id);
      } else {
        setSpeakerDetail({});
      }

      setUserDocumentFileDataChanges((prevData) => {
        return prevData?.map((file) => {
          if (file.id == e.target.value) {
            return {
              ...file,
              id: parseInt(e.target.value),
              status: selectedDoc?.status,
              doc_type_id: selectedDoc?.doc_type_id,
              speaker_id: selectedDoc?.speaker_id,
            };
          }
          return file;
        });
      });
    }
  };

  const handleSaveNext = async (e) => {
    setCurrentFileIndex(currentFileIndex + 1);
    saveSingle();
    handleNext();
  };

  const handleSaveDocSingle = async (e) => {
    saveSingle();
  };

  const saveSingle = async () => {
    try {
      var validateDocumentFileData = {
        files: userDocumentFileDataChanges,
        folder_name: showUserFolderName,
        company_name: showUserCompanyName,
        created_at: startDate ? startDate : "",
        last_modified_at: endDate ? endDate : "",
      };

      const response = await FilePageService.validate_document_files(
        id,
        validateDocumentFileData
      );
      if (response.data.status) {
        setFlashMessage({
          type: "success",
          message: "Document enregistré avec succès.",
        });
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleNext = () => {
    const currentIndex = userDocumentFileDataChanges.findIndex(
      (doc) => doc.id === parseInt(selectDocumentId)
    );
    if (currentIndex < userDocumentFileDataChanges.length - 1) {
      const nextDoc = userDocumentFileDataChanges[currentIndex + 1];
      setSelectDocumentFileName(nextDoc.filename);
      updateDocumentSelection(nextDoc);
    }
  };

  const handlePrevious = () => {
    const currentIndex = userDocumentFileDataChanges.findIndex(
      (doc) => doc.id === parseInt(selectDocumentId)
    );
    if (currentIndex > 0) {
      const prevDoc = userDocumentFileDataChanges[currentIndex - 1];
      setSelectDocumentFileName(prevDoc.filename);
      updateDocumentSelection(prevDoc);
    }
  };

  const updateDocumentSelection = (doc) => {
    if (doc) {
      setSelectDocumentId(doc.id);
      setShowDocumentId(doc.id);
      setEditUserStatus(doc.status);
      setSelectDocumentType(doc.doc_type_id);
      setSelectSpeakerId(doc.speaker_id);

      setUserDocumentFileDataChanges((prevData) =>
        prevData.map((file) => {
          if (file.id == doc.id) {
            return {
              ...file,
              id: doc.id,
              status: doc.status,
              doc_type_id: doc.doc_type_id,
              speaker_id: doc.speaker_id,
            };
          }
          return file;
        })
      );
    }
  };

  const HandleDeleteSpeaker = async () => {
    try {
      const response = await AcsManagerFileService.delete_speaker(
        id,
        showSpeakerId
      );
      if (response.data.status) {
        handleCloseDeleteModalSpeaker();
        const sortSpeaker = {
          key: "created_at",
          value: "asc",
        };
        ShowUserDocumentData(id);
        SpeakerList(id, sortSpeaker, currentPage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const HandleDeleteSpeakerDocument = async () => {
    try {
      const response = await AcsManagerFileService.delete_speaker_from_file(
        deleteSpeakerDocId
      );
      if (response.data.status) {
        handleCloseDeleteModalSpeakerDocument();
        ShowSpeakerDocument(id, sort, "", 1, "", "", showSpeakerId);
        PaperList(
          id,
          sort,
          currentPage,
          editUserStatus,
          selectDocumentType,
          selectSpeakerId
        );
        SpeakerList(id, sort, currentPage);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const HandleDeleteDocumentFile = async () => {
    try {
      const response = await FilePageService.delete_document_file(
        showDocumentId
      );
      if (response.data.status) {
        handleCloseDeleteModal();
        ShowUserDocumentData(id);
        setShowDocumentId("");
        if (activeTab === "intervenants") {
          if (activeSubTab === "documents") {
            ShowSpeakerDocument(id, sort, "", 1, "", "", showSpeakerId);
          }
        }
        if (activeTab === "document") {
          PaperList(
            id,
            sort,
            currentPage,
            editUserStatus,
            selectDocumentType,
            selectSpeakerId
          );
          DocumentTypeList();
          SpeakerDropDownList("", 1);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (dateString) => {
    if (dateString) {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
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

  const ValidateDocumentFile = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    try {
      var validateDocumentFileData = {
        files: userDocumentFileDataChanges,
        folder_name: showUserFolderName,
        company_name: showUserCompanyName,
        created_at: startDate ? startDate : "",
        last_modified_at: endDate ? endDate : "",
      };

      const response = await FilePageService.validate_document_files(
        id,
        validateDocumentFileData
      );
      if (response.data.status) {
        const sortSpeaker = {
          key: "company_name",
          value: "asc",
        };
        setIsLoading(false);
        handleCloseFinalModal();
        handleCheckClose();
        setActiveTab(activeTab);
        setShowDocumentId("");
        setEditUserStatus("");
        setSelectDocumentType("");
        setSelectSpeakerId("");
        setShowUserDocumentDataId(id);
        PaperList(id, sort, currentPage, "", "", "");
        ShowUserDocumentData(id);
        DocumentTypeList();
        SpeakerDropDownList("", 1);
        ShowUserDocumentData(id);
      } else {
        setIsLoading(false);
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      setFlashMessage({
        type: "error",
        message: error.response.data.message || t("somethingWentWrong"),
      });
    }
  };

  const NewDocumentTypeCreate = async (e) => {
    e.preventDefault();
    if (
      e.target.elements.siren_number.value == "" ||
      e.target.elements.companyname.value == "" ||
      e.target.elements.nic_number.value == "" ||
      e.target.elements.siret_number.value == "" ||
      e.target.elements.address.value == "" ||
      e.target.elements.city.value == "" ||
      e.target.elements.postcode.value == ""
    ) {
      setFlashMessage({
        type: "error",
        message: t("requriedErrorMessageLabel"),
      });
      return;
    }
    try {
      var useData = {
        siren_number: e.target.elements.siren_number.value,
        company_name: e.target.elements.companyname.value,
        nic_number: e.target.elements.nic_number.value,
        siret_number: e.target.elements.siret_number.value,
        address: e.target.elements.address.value,
        city: e.target.elements.city.value,
        postcode: e.target.elements.postcode.value,
      };

      const response = await AcsManagerFileService.create_speaker_type(
        id,
        useData
      );

      if (response.data.status) {
        const sort = {
          key: "company_name",
          value: "asc",
        };
        SpeakerList(id, sort, currentPage);
        ShowUserDocumentData(id);
        SpeakerDropDownList("", 1);
        handleModalClose();
      } else {
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setFlashMessage({
        type: "error",
        message: error.response?.data?.message || t("somethingWentWrong"),
      });
    }
  };

  const handleBack = () => {
    setHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      const previousTab = newHistory.pop();

      if (previousTab) {
        setActiveTab(previousTab);
        return newHistory;
      } else {
        navigate("/manager-files");
        return [];
      }
    });
  };

  const handlePaperCheckboxChange = (key) => {
    setPaperModalColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddPaperColSubmit = () => {
    const newSelectedColumns = Object.keys(paperModalColumns).filter(
      (key) => paperModalColumns[key]
    );
    setSelectedSpeakerColumns(newSelectedColumns);
    handleAddPaperColClose(); // Close the modal
  };

  const handleClickRotate = (column) => {
    const direction =
      sort.key === column ? (sort.value === "desc" ? "asc" : "desc") : "asc";
    setSort({ key: column, value: direction });
    setIsRotated(!isRotated); // Toggle the class on click
  };

  const docs = [
    {
      uri: `${process.env.REACT_APP_API}/file/${showUserFolderName}/${selectDocumentFileName}`,
    },
  ];

  const HandleDownloadFile = (data) => {
    const filePath = data.filepath;
    const fileName = data.file_name ?? data.filename;
    const fileExtension = fileName.split(".").pop().toLowerCase();

    if (fileExtension === "pdf") {
      const fileUrl = `${process.env.REACT_APP_API}/file/${showUserFolderName}/${fileName}`;
      // Fetch the PDF file as a Blob
      fetch(fileUrl)
        .then((response) => response.blob()) // Convert the response to a Blob
        .then((blob) => {
          // Create a URL for the Blob
          const blobUrl = URL.createObjectURL(blob);

          // Create a temporary link to download the Blob
          const tempLink = document.createElement("a");
          tempLink.href = blobUrl;
          tempLink.download = fileName;

          // Append the link to the body and trigger the download
          document.body.appendChild(tempLink);
          tempLink.click();

          // Clean up by removing the temporary link
          document.body.removeChild(tempLink);
          URL.revokeObjectURL(blobUrl); // Release the object URL after the download
        })
        .catch((error) => {
          console.error("Error downloading PDF:", error);
        });
    } else {
      const tempLink = document.createElement("a");
      tempLink.href = `${process.env.REACT_APP_IMAGE_URL}/${filePath}`;
      tempLink.download = fileName;

      document.body.appendChild(tempLink);
      tempLink.click();

      document.body.removeChild(tempLink);
    }
  };

  const handleSiteStatusChange = (status) => {
    setEditUserSiteStatus(status);
    handleSiteStatusChangeShow();
  };

  const HandleSiteStatusUpdate = async () => {
    try {
      var userData = {
        id: id,
        site_status: editUserSiteStatus,
      };
      const response = await FilePageService.sitestatusUpdate(userData);
      if (response.data.status) {
        handleSiteStatusChangeClose();
        ShowUserDocumentData(id);
        if (activeTab === "information") {
          FolderDetail(id);
          SpeakerDropDownList("", 1);
        }
        if (activeTab === "document") {
          PaperList(
            id,
            sort,
            currentPage,
            editUserStatus,
            selectDocumentType,
            selectSpeakerId
          );
          DocumentTypeList();
          SpeakerDropDownList("", 1);
        }
        if (activeTab === "intervenants") {
          SpeakerList(id, sort, currentPage);
        }
        if (activeTab === "missingdocument") {
          GetMissingDocumentList(id, sort, currentPage, selectIsRequired);
        }
        if (activeTab === "history") {
          GetHistoryListDocument(
            id,
            sort,
            search,
            currentPage,
            selectActionType
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
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

  const UpdateFolderInfo = async (e) => {
    e.preventDefault();

    const folderData = {
      folder_name: folderDetail.folder_name,
      final_start_date: finalStartDate ? finalStartDate : "",
      final_completion_date: finalCompletionDate ? finalCompletionDate : "",
      contract_no: contractNo ? contractNo : "",
      insurance_policyholder_name: policyholderName || "",
      estimated_start_date: estimatedStartDate ? estimatedStartDate : "",
      estimated_completion_date: estimatedCompletionDate
        ? estimatedCompletionDate
        : "",
      estimated_site_cost: estimatedSiteCost || "",
      final_site_cost: finalSiteCost || "",
      broker_id: selectBroker ? selectBroker : "",
    };

    try {
      const response = await FilePageService.folder_info_update(id, folderData);
      if (response.data.status) {
        setFlashMessage({
          type: "success",
          message: response.data.message || t("somethingWentWrong"),
        });
      } else {
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setFlashMessage({
        type: "error",
        message: t("somethingWentWrong"),
      });
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setContractNo(value);
  };

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

  const HandleGetDetails = async (siretNumber) => {
    setIsFormLoading(true);
    if (siretNumber == "" || siretNumber == null || siretNumber == undefined) {
      setIsFormLoading(false);
      setFlashMessage({
        type: "error",
        message: "veuillez saisir le numéro de siret",
      });
      return;
    }
    try {
      const response = await SpeakerManagementService.get_speaker_details(
        siretNumber
      );
      if (response.data.status) {
        setIsFormLoading(false);
        setShowSirenNumberDetail(response.data.data);
      } else {
        setIsFormLoading(false);
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setIsFormLoading(false);
      setFlashMessage({ type: "error", message: t("somethingWentWrong") });
    }
  };

  const GetDocumentFileNotesList = async (id, filter) => {
    setIsNoteLoading(true);
    try {
      let userData = null;

      if (filter == 0 || filter == 1) {
        userData = { is_important: filter };
      }

      const response = await FilePageService.document_file_notes(id, userData);

      if (response.data.status) {
        setIsNoteLoading(false);
        setInvalidReasonNoteList(response.data.data || []);
        setRecordsToShowNote(3);
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      }
    } catch (error) {
      setIsNoteLoading(false);
      console.log(error);
    }
  };

  const handleAddNoteModalOpen = (docId, docName) => {
    setSelectedAddNoteDocId(docId);
    setSelectedAddNoteDocName(docName);
    setShowAddNoteModal(true);
  };

  const handleAddNoteModalClose = () => {
    setShowAddNoteModal(false);
  };

  const handleScrollNote = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setRecordsToShowNote((prev) =>
        Math.min(prev + 3, invalidReasonNoteList?.length)
      );
    }
  };

  const displayedRecordsNote = invalidReasonNoteList?.slice(
    0,
    recordsToShowNOte
  );

  const NotesOptions = [
    { value: "", label: "Toutes les notes" },
    { value: "1", label: "Importante" },
    { value: "0", label: "Général" },
  ];

  return (
    <Fragment>
      <style>
        {" "}
        {` button.btn.btn-primary  { background-color: ${
          localStorage.getItem("button_color")
            ? JSON.parse(localStorage.getItem("button_color"))
            : "#e84455"
        } !Important};`}{" "}
      </style>

      <SidePanel
        sidebarLogo={
          logoImageShow == "" ||
          logoImageShow == null ||
          logoImageShow == undefined
            ? logo
            : `${process.env.REACT_APP_IMAGE_URL}/${logoImageShow}`
        }
      />
      <div
        className="dashboard-main-content manager-dashboard admin-dashboard"
        style={{ backgroundColor: rightPanelThemeColor }}
      >
        <div className="top-header mb-32">
          <div className="d-flex align-items-center">
            <Link onClick={handleBack} disabled={history.length === 0}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.7051 7.40996L11.1251 12L15.7051 16.59L14.2951 18L8.29508 12L14.2951 5.99996L15.7051 7.40996Z"
                  fill="#e84455"
                />
              </svg>
            </Link>
            <h4 className="m-0">
              <span>
                <Link to="/manager-files">Dossiers </Link>&nbsp; /{" "}
              </span>
              {showUserFolderName}{" "}
            </h4>
          </div>

          <div className="mt-3 d-md-flex justify-content-between align-items-center">
            <h1 className="m-0 mb-md-0 mb-3">Dossier {showUserFolderName}</h1>
          </div>
          <div
            className="detail-header"
            style={{ display: "flex", justifyContent: "right" }}
          >
            <div style={{ marginRight: "20px" }} className="div">
              <Link
                onClick={toggleDetail}
                className="fold-unfold-link link-wrap"
              >
                {isVisible ? "Fold Detail" : "Unfold Detail"}
              </Link>
            </div>
            <div style={{ marginRight: "20px" }}>
              <MissingDocument
                link={true}
                sort={sort}
                search={search}
                currentPage={currentPage}
                selectActionType={selectActionType}
                GetHistoryListDocument={GetHistoryListDocument}
              />
            </div>
            <Link
              className="link-wrap"
              style={{ marginRight: "20px" }}
              onClick={handleNoteShow}
            >
              Voir les raisons
            </Link>
            <p className="m-0" style={{ paddingRight: "10px" }}>
              Envoyer à :{" "}
            </p>
            <Form.Select
              aria-label="Etat du chantier"
              class="form-select"
              style={{ minHeight: "45px", width: "25%", fontFamily: "Manrope" }}
              value={sendToFileStatus}
              onChange={(e) => handleSendFileShow(e.target.value)}
            >
              <option value="" disabled selected>
                Envoyer à
              </option>
              <option value="transfer_to_insurer">
                Transfert à l'assureur
              </option>
              <option value="transfer_to_broker">Transfert au Courtier</option>
              <option value="to_be_decided">A statuer</option>
            </Form.Select>
          </div>
          <div
            className={`detail-header second-header ${isVisible ? "show" : ""}`}
          >
            <div className="d-flex align-items-center check-status">
              <div className="d-flex align-items-center check-status">
                <p className="m-0" style={{ paddingRight: "10px" }}>
                  Etat du chantier :{" "}
                </p>
                <div style={{ paddingRight: "10px" }}>
                  <Form.Select
                    aria-label="Etat du chantier"
                    style={{ minHeight: "45px" }}
                    value={editUserSiteStatus}
                    onChange={(e) => handleSiteStatusChange(e.target.value)}
                  >
                    <option value="on_site">En cours de chantier</option>
                    <option value="end_of_site">Fin de chantier</option>
                  </Form.Select>
                </div>
              </div>
              <p className="m-0">Statut : </p>
              <div className="status">
                {showUserDocumentData?.status === "to_be_checked"
                  ? t("toBeCheckedLabel")
                  : showUserDocumentData?.status === "validated"
                  ? t("validatedLabel")
                  : showUserDocumentData?.status === "transfer_to_insurer"
                  ? "Transfert à l'assureur"
                  : showUserDocumentData?.status === "transfer_to_broker"
                  ? "Transfert au Courtier"
                  : showUserDocumentData?.status === "transfer_to_manager"
                  ? "Transfert au Gestionnaire"
                  : showUserDocumentData?.status === "to_be_decided"
                  ? "A statuer"
                  : showUserDocumentData?.status === "formal_notice"
                  ? "Mise en demeure"
                  : t("invalidLabel")}
              </div>
            </div>
          </div>
        </div>
        <Tabs
          activeKey={activeTab}
          onSelect={handleSelect}
          defaultActiveKey="document"
          id="uncontrolled-tab-example"
          className=""
        >
          {/* Dashboard  Tab */}

          <Tab className="dashboard-tab" eventKey="dashboard" title="Dashboard">
            {isLoading && (
              <div className="loading-overlay">
                <Loading />
              </div>
            )}

            <div className="row">
              <div className="col-md-7">
                <h2 className="mb-3">Detailed Information</h2>
                <div className="custom-grid-card">
                  <h3>Documents # of registered documents</h3>
                  <div className="table-wrap mt-24">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Name of document</th>
                          <th>Number of document</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="file-type-icon">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M12.65 2.23994C12.4689 2.08503 12.2383 1.99992 12 1.99994H5C4.73478 1.99994 4.48043 2.1053 4.29289 2.29283C4.10536 2.48037 4 2.73472 4 2.99994V20.9999C4 21.2652 4.10536 21.5195 4.29289 21.7071C4.48043 21.8946 4.73478 21.9999 5 21.9999H19C19.2652 21.9999 19.5196 21.8946 19.7071 21.7071C19.8946 21.5195 20 21.2652 20 20.9999V8.99994C20 8.8555 19.9687 8.71277 19.9083 8.58157C19.8479 8.45038 19.7598 8.33383 19.65 8.23994L12.65 2.23994ZM13 5.16994L16.3 7.99994H13V5.16994ZM18 19.9999H6V3.99994H11V8.99994C11 9.26516 11.1054 9.51951 11.2929 9.70705C11.4804 9.89458 11.7348 9.99994 12 9.99994H18V19.9999Z"
                                    fill="white"
                                  />
                                </svg>
                              </span>
                              <span className="text-elips">
                                General documents
                              </span>
                            </div>
                          </td>
                          <td>2</td>
                          <td>
                            <span className="doc-status success"></span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            {" "}
                            <div className="d-flex align-items-center">
                              <span className="file-type-icon">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M12.65 2.23994C12.4689 2.08503 12.2383 1.99992 12 1.99994H5C4.73478 1.99994 4.48043 2.1053 4.29289 2.29283C4.10536 2.48037 4 2.73472 4 2.99994V20.9999C4 21.2652 4.10536 21.5195 4.29289 21.7071C4.48043 21.8946 4.73478 21.9999 5 21.9999H19C19.2652 21.9999 19.5196 21.8946 19.7071 21.7071C19.8946 21.5195 20 21.2652 20 20.9999V8.99994C20 8.8555 19.9687 8.71277 19.9083 8.58157C19.8479 8.45038 19.7598 8.33383 19.65 8.23994L12.65 2.23994ZM13 5.16994L16.3 7.99994H13V5.16994ZM18 19.9999H6V3.99994H11V8.99994C11 9.26516 11.1054 9.51951 11.2929 9.70705C11.4804 9.89458 11.7348 9.99994 12 9.99994H18V19.9999Z"
                                    fill="white"
                                  />
                                </svg>
                              </span>
                              <span className="text-elips">
                                General documents
                              </span>
                            </div>
                          </td>
                          <td>2</td>
                          <td>
                            <span className="doc-status warning"></span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            {" "}
                            <div className="d-flex align-items-center">
                              <span className="file-type-icon">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M12.65 2.23994C12.4689 2.08503 12.2383 1.99992 12 1.99994H5C4.73478 1.99994 4.48043 2.1053 4.29289 2.29283C4.10536 2.48037 4 2.73472 4 2.99994V20.9999C4 21.2652 4.10536 21.5195 4.29289 21.7071C4.48043 21.8946 4.73478 21.9999 5 21.9999H19C19.2652 21.9999 19.5196 21.8946 19.7071 21.7071C19.8946 21.5195 20 21.2652 20 20.9999V8.99994C20 8.8555 19.9687 8.71277 19.9083 8.58157C19.8479 8.45038 19.7598 8.33383 19.65 8.23994L12.65 2.23994ZM13 5.16994L16.3 7.99994H13V5.16994ZM18 19.9999H6V3.99994H11V8.99994C11 9.26516 11.1054 9.51951 11.2929 9.70705C11.4804 9.89458 11.7348 9.99994 12 9.99994H18V19.9999Z"
                                    fill="white"
                                  />
                                </svg>
                              </span>
                              <span className="text-elips">Studies Report</span>
                            </div>
                          </td>
                          <td>2</td>
                          <td>
                            <span className="doc-status danger"></span>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </div>

                <div className="custom-grid-card mt-3">
                  <h3>Intervenants # of registered Intervenants</h3>
                  <div className="table-wrap mt-24">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Name of Intervenants</th>
                          <th>Number of Intervenants</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="file-type-icon">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M12.65 2.23994C12.4689 2.08503 12.2383 1.99992 12 1.99994H5C4.73478 1.99994 4.48043 2.1053 4.29289 2.29283C4.10536 2.48037 4 2.73472 4 2.99994V20.9999C4 21.2652 4.10536 21.5195 4.29289 21.7071C4.48043 21.8946 4.73478 21.9999 5 21.9999H19C19.2652 21.9999 19.5196 21.8946 19.7071 21.7071C19.8946 21.5195 20 21.2652 20 20.9999V8.99994C20 8.8555 19.9687 8.71277 19.9083 8.58157C19.8479 8.45038 19.7598 8.33383 19.65 8.23994L12.65 2.23994ZM13 5.16994L16.3 7.99994H13V5.16994ZM18 19.9999H6V3.99994H11V8.99994C11 9.26516 11.1054 9.51951 11.2929 9.70705C11.4804 9.89458 11.7348 9.99994 12 9.99994H18V19.9999Z"
                                    fill="white"
                                  />
                                </svg>
                              </span>
                              <span className="text-elips">
                                General documents
                              </span>
                            </div>
                          </td>
                          <td>2</td>
                          <td>
                            <span className="doc-status success"></span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            {" "}
                            <div className="d-flex align-items-center">
                              <span className="file-type-icon">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M12.65 2.23994C12.4689 2.08503 12.2383 1.99992 12 1.99994H5C4.73478 1.99994 4.48043 2.1053 4.29289 2.29283C4.10536 2.48037 4 2.73472 4 2.99994V20.9999C4 21.2652 4.10536 21.5195 4.29289 21.7071C4.48043 21.8946 4.73478 21.9999 5 21.9999H19C19.2652 21.9999 19.5196 21.8946 19.7071 21.7071C19.8946 21.5195 20 21.2652 20 20.9999V8.99994C20 8.8555 19.9687 8.71277 19.9083 8.58157C19.8479 8.45038 19.7598 8.33383 19.65 8.23994L12.65 2.23994ZM13 5.16994L16.3 7.99994H13V5.16994ZM18 19.9999H6V3.99994H11V8.99994C11 9.26516 11.1054 9.51951 11.2929 9.70705C11.4804 9.89458 11.7348 9.99994 12 9.99994H18V19.9999Z"
                                    fill="white"
                                  />
                                </svg>
                              </span>
                              <span className="text-elips">
                                General documents
                              </span>
                            </div>
                          </td>
                          <td>2</td>
                          <td>
                            <span className="doc-status warning"></span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            {" "}
                            <div className="d-flex align-items-center">
                              <span className="file-type-icon">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M12.65 2.23994C12.4689 2.08503 12.2383 1.99992 12 1.99994H5C4.73478 1.99994 4.48043 2.1053 4.29289 2.29283C4.10536 2.48037 4 2.73472 4 2.99994V20.9999C4 21.2652 4.10536 21.5195 4.29289 21.7071C4.48043 21.8946 4.73478 21.9999 5 21.9999H19C19.2652 21.9999 19.5196 21.8946 19.7071 21.7071C19.8946 21.5195 20 21.2652 20 20.9999V8.99994C20 8.8555 19.9687 8.71277 19.9083 8.58157C19.8479 8.45038 19.7598 8.33383 19.65 8.23994L12.65 2.23994ZM13 5.16994L16.3 7.99994H13V5.16994ZM18 19.9999H6V3.99994H11V8.99994C11 9.26516 11.1054 9.51951 11.2929 9.70705C11.4804 9.89458 11.7348 9.99994 12 9.99994H18V19.9999Z"
                                    fill="white"
                                  />
                                </svg>
                              </span>
                              <span className="text-elips">Studies Report</span>
                            </div>
                          </td>
                          <td>2</td>
                          <td>
                            <span className="doc-status danger"></span>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
              <div className="col-md-5">
                <h2 className="mb-3">Events</h2>
                <div className="custom-grid-card">
                  <div className="last-event-card">
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {/* Type Filter */}
                      <select
                        className="form-select w-auto"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                      >
                        <option value="">Select Type</option>
                        <option value="notes">Notes</option>
                        <option value="action">Action</option>
                      </select>

                      {/* User Filter */}
                      <select
                        className="form-select w-auto"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                      >
                        <option value="">Select User</option>
                        <option value="user1">User 1</option>
                        <option value="user2">User 2</option>
                      </select>
                      {/* Date Filter */}
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        className="form-control"
                        placeholderText="Select Date"
                        dateFormat="dd/MM/yyyy"
                      />
                    </div>
                    5 last events
                    <div class="timeline">
                      <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                          <h5>January 2nd, 04:35 AM</h5>
                          <p>
                            {" "}
                            <strong>Note :-</strong> Illum omnis quo illum nisi.
                            Nesciunt est accusamus. Blanditiis nisi quae eum
                            nisi similique. Modi consequuntur totam
                          </p>
                        </div>
                      </div>

                      <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                          <h5>January 4th, 06:19 AM</h5>
                          <p>
                            <strong>Note :-</strong> Corrupti unde qui molestiae
                            labore ad adipisci veniam perspiciatis quasi. Quae
                            labore vel.
                          </p>
                        </div>
                      </div>

                      <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                          <h5>January 5th, 12:34 AM</h5>
                          <p>
                            <strong>Action :-</strong> Maiores doloribus qui.
                            Repellat accusamus minima ipsa ipsam aut debitis
                            quis sit voluptates. Amet necessitatibus non minus
                            quaerat et quis.
                          </p>
                          <p>
                            <strong>Action Name:-</strong>Lorem, ipsum dolor.
                          </p>
                          <p>
                            <strong>User id:-</strong>Ipsum115880
                          </p>
                        </div>
                      </div>
                    </div>
                    <button type="submit" class="btn-secondary btn btn-primary">
                      See All
                    </button>
                  </div>
                  <div className="last-msg-card">
                    3 Last Important Unread messages
                    <div class="timeline">
                      <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                          <h5>January 2nd, 04:35 AM</h5>
                          <p>
                            Illum omnis quo illum nisi. Nesciunt est accusamus.
                            Blanditiis nisi quae eum nisi similique. Modi
                            consequuntur totam
                          </p>
                        </div>
                      </div>

                      <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                          <h5>January 4th, 06:19 AM</h5>
                          <p>
                            Corrupti unde qui molestiae labore ad adipisci
                            veniam perspiciatis quasi. Quae labore vel.
                          </p>
                        </div>
                      </div>

                      <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                          <h5>January 5th, 12:34 AM</h5>
                          <p>
                            Maiores doloribus qui. Repellat accusamus minima
                            ipsa ipsam aut debitis quis sit voluptates. Amet
                            necessitatibus non minus quaerat et quis.
                          </p>
                        </div>
                      </div>
                    </div>
                    <button type="submit" class="btn-secondary btn btn-primary">
                      See All
                    </button>
                  </div>
                </div>
                <h2 className="mb-3 mt-3">Task</h2>
                <div className="custom-grid-card">
                  <h3>Coming Task - to be determined</h3>
                  <div className="table-wrap mt-24">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Name of Task</th>
                          <th>Dead line</th>
                          <th>Task description</th>
                          <th>Name of responsible</th>
                          <th>status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Task 1</td>
                          <td>dead line</td>
                          <td>Task description</td>
                          <td>Name of responsible</td>
                          <td>
                            <span class="checked badges">À vérifier</span>
                          </td>
                        </tr>
                        <tr>
                          <td>Task 1</td>
                          <td>dead line</td>
                          <td>Task description</td>
                          <td>Name of responsible</td>
                          <td>
                            <span class="checked badges">À vérifier</span>
                          </td>
                        </tr>
                        <tr>
                          <td>Task 1</td>
                          <td>dead line</td>
                          <td>Task description</td>
                          <td>Name of responsible</td>
                          <td>
                            <span class="checked badges">À vérifier</span>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </Tab>
          {/* Information Tab */}
          <Tab eventKey="information" title="Information dossier">
            {isLoading && (
              <div className="loading-overlay">
                <Loading />
              </div>
            )}
            <Form className="mt-24 " onSubmit={UpdateFolderInfo}>
              {flashMessage.message && (
                <div
                  className={`mt-3 mx-w-320 alert ${
                    flashMessage.type === "success"
                      ? "alert-success"
                      : "alert-danger"
                  } text-center`}
                  role="alert"
                >
                  {flashMessage.message}
                </div>
              )}
              <div className="table-wrapper mt-0 p-0">
                <h2 class="mb-3">Général</h2>

                <div className="form-grid-2x2">
                  <Form.Group className="mb-3" controlId="insurercode">
                    <Form.Label>Code assureur</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      placeholder="Code assureur"
                      value={folderDetail.insurer_code}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="filenumber">
                    <Form.Label>Numéro de dossier</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      placeholder="Numéro de dossier"
                      value={folderDetail.folder_name}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="insurername">
                    <Form.Label>Nom de l'assureur</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nom de l'assureur"
                      value={folderDetail.insurer_name}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="insurername">
                    <Form.Label className="d-block">
                      Date de création du fichier
                    </Form.Label>
                    <DatePicker
                      placeholderText="Selectionner une date"
                      selected={
                        startDate4 ? getFormattedDate(startDate4) : null
                      }
                      onChange={(date) => setStartDate4(formatDate(date))}
                      dateFormat="dd/MM/yyyy"
                      locale={fr}
                    />
                  </Form.Group>

                  <Form.Group
                    className="mb-4"
                    controlId="exampleForm.ControlInput1"
                  >
                    <Form.Label>Numéro de contrat</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Numéro de contrat"
                      name="contract_no"
                      value={contractNo}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formBasicEmail">
                    <Form.Label>Nom du courtier</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      placeholder="Nom du courtier"
                      value={
                        showUserDocumentData?.broker?.first_name
                          ? showUserDocumentData?.broker?.first_name
                          : "" + "" + showUserDocumentData?.broker?.last_name
                          ? showUserDocumentData?.broker?.last_name
                          : ""
                      }
                    />
                  </Form.Group>
                </div>

                <h2 class="mb-3">Police</h2>

                <div className="table-wrapper mt-0 p-0">
                  <div className="form-grid-2x2">
                    <Form.Group className="mb-3" controlId="names">
                      <Form.Label>Nom et prénom du demandeur</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nom et prénom du demandeur"
                        value={folderDetail.customer_name || "-"}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                      <Form.Label>Nom du preneur d'assurance</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nom du preneur d'assurance"
                        value={policyholderName}
                        onChange={(e) => setPolicyholderName(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlInput1"
                    >
                      <Form.Label>Coût prévisionnel du chantier</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez le coût estimé du site"
                        name="estimated_site_cost"
                        value={estimatedSiteCost}
                        onChange={(e) => {
                          const value = e.target.value;
                          const onlyNumbers = value.replace(/[^0-9.]/g, "");
                          setEstimatedSiteCost(onlyNumbers);
                        }}
                      />
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="exampleForm.ControlInput1"
                    >
                      <Form.Label>Coût définitif du chantier</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez le coût final du site"
                        name="final_site_cost"
                        value={finalSiteCost}
                        onChange={(e) => {
                          const value = e.target.value;
                          const onlyNumbers = value.replace(/[^0-9.]/g, "");
                          setFinaldSiteCost(onlyNumbers);
                        }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="names">
                      <Form.Label className="d-block">
                        Date de début prévisionnelle
                      </Form.Label>
                      <DatePicker
                        placeholderText="Selectionner une date de début prévisionnelle"
                        selected={
                          estimatedStartDate
                            ? getFormattedDate(estimatedStartDate)
                            : ""
                        }
                        onChange={(date) =>
                          setEstimatedStartDate(formatDate(date))
                        }
                        dateFormat="dd/MM/yyyy"
                        locale={fr}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="names">
                      <Form.Label className="d-block">
                        Date de début définitive
                      </Form.Label>
                      <DatePicker
                        placeholderText="Selectionner une date de début du site"
                        selected={
                          finalStartDate ? getFormattedDate(finalStartDate) : ""
                        }
                        onChange={(date) => setFinalStartDate(formatDate(date))}
                        dateFormat="dd/MM/yyyy"
                        locale={fr}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="names">
                      <Form.Label className="d-block">
                        Date de fin de chantier prévisionnelle
                      </Form.Label>
                      <DatePicker
                        placeholderText="Selectionner une date de fin de chantier prévisionnelle"
                        selected={
                          estimatedCompletionDate
                            ? getFormattedDate(estimatedCompletionDate)
                            : ""
                        }
                        onChange={(date) =>
                          setEstimatedCompletionDate(formatDate(date))
                        }
                        dateFormat="dd/MM/yyyy"
                        locale={fr}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="names">
                      <Form.Label className="d-block">
                        Date de fin de chantier définitive
                      </Form.Label>
                      <DatePicker
                        placeholderText="Selectionner une date de fin de chantier définitive"
                        selected={
                          finalCompletionDate
                            ? getFormattedDate(finalCompletionDate)
                            : ""
                        }
                        onChange={(date) =>
                          setFinalCompletionDate(formatDate(date))
                        }
                        dateFormat="dd/MM/yyyy"
                        locale={fr}
                      />
                    </Form.Group>
                  </div>
                  <Button
                    className="btn-secondary"
                    type="submit"
                    onClick={(e) => UpdateFolderInfo(e)}
                  >
                    Valider
                  </Button>
                  <Button
                    className="btn-secondary ms-2"
                    onClick={() => navigate("/manager-files")}
                  >
                    Annuler
                  </Button>
                </div>

                {/* <Form.Group className="mb-3" controlId="names">
                <Form.Label>Nom et prénom du demandeur</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nom et prénom du demandeur"
                  value={folderDetail.customer_name || "-"}
                />
              </Form.Group> */}

                {/* <Form.Group className="mb-3" controlId="start-date">
                <Form.Label className="d-block">Début du chantier</Form.Label>
                <DatePicker
                  placeholderText="Selectionner une date"
                  selected={startDate5 ? getFormattedDate(startDate5) : null}
                  onChange={(date) => setStartDate5(formatDate(date))}
                  dateFormat="dd/MM/yyyy"
                  locale={fr}
                />
              </Form.Group> */}

                {/* <Form.Group className="mb-3" controlId="end-date">
                <Form.Label className="d-block">Fin du chantier</Form.Label>
                <DatePicker
                  placeholderText="Selectionner une date"
                  selected={startDate6 ? getFormattedDate(startDate6) : null}
                  onChange={(date) => setStartDate6(formatDate(date))}
                  dateFormat="dd/MM/yyyy"
                  locale={fr}
                />
              </Form.Group> */}
              </div>
            </Form>
          </Tab>

          {/* Document  Tab */}

          <Tab
            className="update-inside-tab"
            eventKey="documents"
            title="Documents"
          >
            {isLoading && (
              <div className="loading-overlay">
                <Loading />
              </div>
            )}
            <Tabs defaultActiveKey="documentdddd" className="mt-0 mb-0 ">
              {/* Paper Tab */}
              <Tab
                eventKey="documentdddd"
                title={`Documents (${totalPaperRecords || 0})`}
              >
                <div className="table-wrapper mt-0 p-0">
                  <div class="d-md-flex align-items-center gap-2 justify-content-between">
                    <h2 class="m-md-0 mb-3">
                      {/* Documents ({totalPapers}) */}
                    </h2>
                    <div class="">
                      {endDate == null ? (
                        <div></div>
                      ) : (
                        <Button
                          className="d-flex align-items-center gap-2"
                          variant="primary"
                          onClick={handleCheckShow}
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M15.7549 14.2549H14.9649L14.6849 13.9849C15.6649 12.8449 16.2549 11.3649 16.2549 9.75488C16.2549 6.16488 13.3449 3.25488 9.75488 3.25488C6.16488 3.25488 3.25488 6.16488 3.25488 9.75488C3.25488 13.3449 6.16488 16.2549 9.75488 16.2549C11.3649 16.2549 12.8449 15.6649 13.9849 14.6849L14.2549 14.9649V15.7549L19.2549 20.7449L20.7449 19.2549L15.7549 14.2549ZM9.75488 14.2549C7.26488 14.2549 5.25488 12.2449 5.25488 9.75488C5.25488 7.26488 7.26488 5.25488 9.75488 5.25488C12.2449 5.25488 14.2549 7.26488 14.2549 9.75488C14.2549 12.2449 12.2449 14.2549 9.75488 14.2549Z"
                              fill="white"
                            />
                          </svg>
                          Vérifier les documents
                        </Button>
                      )}

                      <Offcanvas
                        className="add-folder-panel check-document-panel"
                        placement={"end"}
                        show={showCheck}
                        onHide={() => handleCheckClose()}
                      >
                        <Offcanvas.Header closeButton>
                          <div className="doc-header">
                            <p className="m-0">
                              Vérification dossier {showUserFolderName}
                            </p>
                            <div className="right-part">
                              <p className="m-0">
                                Dernière sauvegarde -{" "}
                                {showUserDocumentData?.last_updated}
                              </p>
                              <Button onClick={handleShowFinalModal}>
                                <svg
                                  width="18"
                                  height="14"
                                  viewBox="0 0 18 14"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M5.8002 10.8998L1.6002 6.6998L0.200195 8.0998L5.8002 13.6998L17.8002 1.6998L16.4002 0.299805L5.8002 10.8998Z"
                                    fill="white"
                                  />
                                </svg>
                                Transmettre
                              </Button>
                            </div>
                          </div>
                        </Offcanvas.Header>
                        <Offcanvas.Body className="update-canvas">
                          <div className="top-header d-md-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-start">
                              <div>
                                <Form.Select
                                  className="mb-3 mb-lg-0"
                                  aria-label="statusSelectAria"
                                  value={selectDocumentId}
                                  onChange={(e) => handleDocChange(e)}
                                  style={{
                                    width: "320px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {showUserDocumentFileData &&
                                  showUserDocumentFileData.length > 0 ? (
                                    showUserDocumentFileData.map((doc) => (
                                      <option key={doc.id} value={doc.id}>
                                        {doc.filename}
                                      </option>
                                    ))
                                  ) : (
                                    <option value="">
                                      {t("NorecordsfoundLabel")}
                                    </option>
                                  )}
                                </Form.Select>
                              </div>

                              <div
                                className="d-flex gap-2 ms-3"
                                style={{ marginTop: "4px" }}
                              >
                                <button
                                  className={`filter-btn ${
                                    validateDocumnetFilter === ""
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() => setValidateDocumnetFilter("")}
                                  style={{
                                    border: `2px solid ${buttonColor}`,
                                    backgroundColor:
                                      validateDocumnetFilter === ""
                                        ? buttonColor
                                        : "",
                                    color:
                                      validateDocumnetFilter === ""
                                        ? "white"
                                        : "#000",
                                  }}
                                >
                                  Tous
                                </button>
                                <button
                                  className={`filter-btn ${
                                    validateDocumnetFilter === "to_be_checked"
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    setValidateDocumnetFilter("to_be_checked")
                                  }
                                  style={{
                                    border: `2px solid ${buttonColor}`,
                                    backgroundColor:
                                      validateDocumnetFilter === "to_be_checked"
                                        ? buttonColor
                                        : "",
                                    color:
                                      validateDocumnetFilter === "to_be_checked"
                                        ? "white"
                                        : "#000",
                                  }}
                                >
                                  {t("toBeCheckedLabel")}
                                </button>
                                <button
                                  className={`filter-btn ${
                                    validateDocumnetFilter === "invalid"
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    setValidateDocumnetFilter("invalid")
                                  }
                                  style={{
                                    border: `2px solid ${buttonColor}`,
                                    backgroundColor:
                                      validateDocumnetFilter === "invalid"
                                        ? buttonColor
                                        : "",
                                    color:
                                      validateDocumnetFilter === "invalid"
                                        ? "white"
                                        : "#000",
                                  }}
                                >
                                  {t("invalidLabel")}
                                </button>
                              </div>
                            </div>

                            <MissingDocument
                              link={false}
                              sort={sort}
                              search={search}
                              currentPage={currentPage}
                              selectActionType={selectActionType}
                              GetHistoryListDocument={GetHistoryListDocument}
                            />
                          </div>

                          <div className="side-by-side-panel check-doc">
                            <div className="left-panel">
                              <div className="inner-detail">
                                <div className="header-part">
                                  <div className="div">
                                    <span>Attestation</span>Police{" "}
                                    {selectDocumentFileName ||
                                      t("NorecordsfoundLabel")}
                                  </div>
                                  <Dropdown>
                                    <Dropdown.Toggle
                                      variant="success"
                                      id="dropdown-basic"
                                    >
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z"
                                          fill="white"
                                        />
                                      </svg>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                      <Dropdown.Item
                                        onClick={() => handleShowDeleteModal()}
                                      >
                                        Supprimer
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                </div>
                                <div className="main-part">
                                  <div className="pdf-wrapper">
                                    <DocViewer
                                      style={{ height: "600px", width: "100%" }}
                                      documents={docs}
                                      pluginRenderers={DocViewerRenderers}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="right-panel">
                              <div className="inner-detail">
                                <button
                                  type="button"
                                  className="btn btn-primary me-3 show-doc-reader"
                                  onClick={toggleReader}
                                >
                                  {showReader ? "Hide Reader" : "Show Reader"}
                                </button>
                                <div className="main-part custom-tab">
                                  <Tabs
                                    defaultActiveKey="status"
                                    id="uncontrolled-tab-example"
                                    className=""
                                  >
                                    <Tab
                                      eventKey="status"
                                      title="Statuts & association"
                                    >
                                      <div className="main-part">
                                        {flashMessage.message && (
                                          <div
                                            className={`alert ${
                                              flashMessage.type === "success"
                                                ? "alert-success"
                                                : "alert-danger"
                                            } text-center`}
                                            role="alert"
                                          >
                                            {flashMessage.message}
                                          </div>
                                        )}
                                        <p className="mb-4">
                                          Vérifier, compléter les statuts du
                                          document et associer le si besoin à un
                                          intervenant
                                        </p>
                                        <Form.Label>
                                          Statut du document <span>*</span>
                                        </Form.Label>
                                        <Form.Select
                                          className="mb-3"
                                          aria-label="statusSelectAria"
                                          value={editUserStatus} // Bind the value to editUserStatus
                                          onChange={(e) =>
                                            handleStatusChange(e.target.value)
                                          }
                                        >
                                          <option value="to_be_checked">
                                            {t("toBeCheckedLabel")}
                                          </option>
                                          <option value="verified">
                                            {t("verified")}
                                          </option>
                                          <option value="invalid">
                                            {t("invalidLabel")}
                                          </option>
                                        </Form.Select>
                                        <InvalidDocument
                                          showmodal={showmodalInvalid}
                                          handleModalClose={
                                            handleModalCloseInvalid
                                          }
                                          selectDocumentId={selectDocumentId}
                                          selectDocumentFileName={
                                            selectDocumentFileName
                                          }
                                        />
                                        <Form.Label>
                                          Type de document
                                        </Form.Label>
                                        <Form.Select
                                          className="mb-3"
                                          aria-label="Choisir un type de document"
                                          value={selectDocumentType}
                                          onChange={handleDocumentTypeChange}
                                        >
                                          <option value="" disabled>
                                            Choisir un type de document
                                          </option>
                                          {documentTypeList?.length > 0 ? (
                                            documentTypeList?.map((doctype) => (
                                              <option
                                                key={doctype.id}
                                                value={doctype.id}
                                              >
                                                {doctype.name}
                                              </option>
                                            ))
                                          ) : (
                                            <option value="">
                                              {t("NorecordsfoundLabel")}
                                            </option>
                                          )}
                                        </Form.Select>

                                        <Form.Label>
                                          Relation Intervenant
                                        </Form.Label>
                                        <div
                                          className="d-flex"
                                          style={{ gap: "20px" }}
                                        >
                                          <Select
                                            options={options}
                                            value={
                                              options.find(
                                                (option) =>
                                                  option.value ==
                                                  selectSpeakerId
                                              ) || null
                                            }
                                            onChange={handleSpeakerChange}
                                            styles={{
                                              container: (provided) => ({
                                                ...provided,
                                                width: "50%",
                                              }),
                                              menu: (provided) => ({
                                                ...provided,
                                                width: "100%",
                                              }),
                                            }}
                                            placeholder={t("speakerLabel")}
                                            isSearchable={true}
                                          />
                                          <Button
                                            className="d-flex align-items-center add-intervenant"
                                            variant="primary"
                                            onClick={handleModalShow}
                                            title="Ajouter un intervenant"
                                          >
                                            <svg
                                              className="me-2"
                                              width="14"
                                              height="14"
                                              viewBox="0 0 14 14"
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path
                                                d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z"
                                                fill="white"
                                              />
                                            </svg>
                                            Ajouter un intervenant
                                          </Button>
                                        </div>

                                        {currentFileIndex <
                                        userDocumentFileDataChanges.length -
                                          1 ? (
                                          <>
                                            <Button
                                              className="mx-w-320 btn btn-primary mt-3"
                                              onClick={(e) => handleSaveNext(e)}
                                            >
                                              Enregistrer et Suivant
                                            </Button>
                                          </>
                                        ) : (
                                          <>
                                            <Button
                                              className="mx-w-320 btn btn-primary mt-3"
                                              onClick={(e) =>
                                                handleSaveDocSingle(e)
                                              }
                                            >
                                              Enregistrer
                                            </Button>
                                          </>
                                        )}
                                        <div
                                          className="d-lg-flex justify-content-between align-items-center mt-auto"
                                          style={{ marginTop: "50px" }}
                                        >
                                          <Link
                                            className="link-wrap d-block d-lg-inline"
                                            onClick={handlePrevious}
                                          >
                                            Document précédent
                                          </Link>
                                          <Link
                                            className="link-wrap d-block d-lg-inline"
                                            onClick={handleNext}
                                          >
                                            Document suivant
                                          </Link>
                                        </div>
                                      </div>
                                    </Tab>
                                    <Tab
                                      eventKey="file"
                                      title="Informations Dossier"
                                    >
                                      <div className="main-part">
                                        <p className="mb-4 small-font">
                                          Compléter les champs indiqués à partir
                                          des informations des documents
                                          ci-contre
                                        </p>
                                        <div className="d-flex mb-32">
                                          <ProgressBar
                                            dataSource={"Obligatoires : 2/3"}
                                            now={now}
                                            className="progress-bar-wrapper"
                                          />
                                          <ProgressBar
                                            dataSource={"Optionnels : 7/18"}
                                            now={nows}
                                            className="progress-bar-wrapper"
                                          />
                                        </div>

                                        <h2 className="mb-4">Police</h2>
                                        <div className="overflow">
                                          <Form.Group
                                            className="mb-2"
                                            controlId="filenumber"
                                          >
                                            <Form.Label>
                                              N° de dossier <span>*</span>
                                            </Form.Label>
                                            <Form.Control
                                              type="text"
                                              placeholder="N° de dossier"
                                              value={showUserFolderName}
                                              onChange={(e) =>
                                                setShowUserFolderName(
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </Form.Group>

                                          <Form.Group
                                            className="mb-2"
                                            controlId="names"
                                          >
                                            <Form.Label>
                                              Nom et prénom du demandeur
                                            </Form.Label>
                                            <Form.Control
                                              type="text"
                                              placeholder="Nom et prénom du demandeur"
                                              value={showUserCompanyName}
                                              onChange={(e) =>
                                                setShowUserCompanyName(
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </Form.Group>

                                          <Form.Group
                                            className="mb-2 mx-w-320"
                                            controlId="names"
                                          >
                                            <Form.Label className="d-block">
                                              Début de chantier
                                            </Form.Label>
                                            <DatePicker
                                              placeholderText="Selectionner une date"
                                              selected={
                                                startDate
                                                  ? getFormattedDate(startDate)
                                                  : null
                                              }
                                              onChange={(date) =>
                                                setStartDate(formatDate(date))
                                              }
                                              dateFormat="dd/MM/yyyy"
                                              locale={fr}
                                            />
                                          </Form.Group>

                                          <Form.Group
                                            className="mb-4 mx-w-320"
                                            controlId="names"
                                          >
                                            <Form.Label className="d-block">
                                              Fin de chantier
                                            </Form.Label>
                                            <DatePicker
                                              placeholderText="Selectionner une date"
                                              selected={
                                                endDate
                                                  ? getFormattedDate(endDate)
                                                  : null
                                              }
                                              onChange={(date) =>
                                                setEndDate(formatDate(date))
                                              }
                                              dateFormat="dd/MM/yyyy"
                                              locale={fr}
                                            />
                                          </Form.Group>
                                        </div>
                                      </div>
                                    </Tab>
                                    <Tab eventKey="speaker" title="Intervenant">
                                      <Form>
                                        <Form.Label>
                                          N° de SIRET <span>*</span>
                                        </Form.Label>
                                        <Form.Control
                                          className="mb-3"
                                          type="text"
                                          placeholder="SIRET"
                                          name="siren_number"
                                          disabled
                                          value={
                                            speakerDetail?.siren_number
                                              ? speakerDetail?.siren_number
                                              : "-"
                                          }
                                        />
                                        <Form.Label>
                                          Nom société <span>*</span>
                                        </Form.Label>
                                        <Form.Control
                                          className="mb-3"
                                          type="text"
                                          placeholder="Nom société"
                                          defaultValue="Mark"
                                          name="company_name"
                                          disabled
                                          value={
                                            speakerDetail?.company_name
                                              ? speakerDetail?.company_name
                                              : "-"
                                          }
                                        />
                                        <Form.Label>
                                          Adresse <span>*</span>
                                        </Form.Label>
                                        <Form.Control
                                          className="mb-3"
                                          type="text"
                                          placeholder="Adresse"
                                          name="address"
                                          disabled
                                          value={
                                            speakerDetail?.address
                                              ? speakerDetail?.address
                                              : "-"
                                          }
                                        />

                                        <div className="d-md-flex align-items-center side-col">
                                          <Form.Group
                                            className="post-code"
                                            controlId="postcode"
                                          >
                                            <Form.Label>
                                              Code postal <span>*</span>
                                            </Form.Label>
                                            <Form.Control
                                              className="mb-3"
                                              type="text"
                                              placeholder="Code postal"
                                              name="postcode"
                                              disabled
                                              value={
                                                speakerDetail?.postcode
                                                  ? speakerDetail?.postcode
                                                  : "-"
                                              }
                                            />
                                          </Form.Group>

                                          <Form.Group
                                            className=""
                                            controlId="city"
                                          >
                                            <Form.Label>
                                              Ville <span>*</span>
                                            </Form.Label>
                                            <Form.Control
                                              className="mb-3"
                                              type="text"
                                              placeholder="Ville"
                                              name="city"
                                              disabled
                                              value={
                                                speakerDetail?.city
                                                  ? speakerDetail?.city
                                                  : "-"
                                              }
                                            />
                                          </Form.Group>
                                        </div>
                                      </Form>
                                    </Tab>
                                  </Tabs>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Offcanvas.Body>
                      </Offcanvas>
                    </div>
                  </div>
                  {isLoading ? (
                    <Loading />
                  ) : (
                    <div className="table-wrap mt-24">
                      <Table responsive hover>
                        <thead>
                          <tr>
                            {selectedSpeakerColumns.includes(
                              "fileNameLabe"
                            ) && (
                              <th>
                                <div className="d-flex align-items-center">
                                  <span>Nom du fichier</span>
                                  <div>
                                    <Link
                                      className={`sorting-icon ms-2`}
                                      onClick={() =>
                                        handleClickRotate("filename")
                                      }
                                    >
                                      {sort.value === "asc" && (
                                        <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                            fill="black"
                                          />
                                          <path
                                            d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                            fill="black"
                                            fill-opacity="0.5"
                                          />
                                        </svg>
                                      )}

                                      {sort.value === "desc" && (
                                        <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                            fill="black"
                                            fill-opacity="0.5"
                                          />
                                          <path
                                            d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                            fill="black"
                                          />
                                        </svg>
                                      )}
                                    </Link>
                                  </div>
                                </div>
                              </th>
                            )}
                            {selectedSpeakerColumns.includes(
                              "speakerLabel"
                            ) && (
                              <th className="select-drop elips-dropdown">
                                <div className="d-flex align-items-center">
                                  <div>
                                    <Form.Select
                                      aria-label="statusSelectAria"
                                      value={selectSpeakerId}
                                      onChange={handleTableSpeakerChange}
                                    >
                                      <option value="">
                                        {t("speakerLabel")}
                                      </option>
                                      {speakerDropDownList?.length > 0 ? (
                                        speakerDropDownList?.map((speaker) => (
                                          <option
                                            key={speaker.id}
                                            value={speaker.id}
                                          >
                                            {speaker.company_name +
                                              " - " +
                                              speaker.siren_number}
                                          </option>
                                        ))
                                      ) : (
                                        <option value="">
                                          {t("NorecordsfoundLabel")}
                                        </option>
                                      )}
                                    </Form.Select>
                                  </div>
                                  <div>
                                    <Link
                                      className={`sorting-icon ms-2`}
                                      onClick={() =>
                                        handleClickRotate(
                                          "speaker.company_name"
                                        )
                                      }
                                    >
                                      {sort.value === "asc" && (
                                        <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                            fill="black"
                                          />
                                          <path
                                            d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                            fill="black"
                                            fill-opacity="0.5"
                                          />
                                        </svg>
                                      )}

                                      {sort.value === "desc" && (
                                        <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                            fill="black"
                                            fill-opacity="0.5"
                                          />
                                          <path
                                            d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                            fill="black"
                                          />
                                        </svg>
                                      )}
                                    </Link>
                                  </div>
                                </div>
                              </th>
                            )}
                            {selectedSpeakerColumns.includes(
                              "Type de document"
                            ) && (
                              <th className="select-drop elips-dropdown">
                                <div className="d-flex align-items-center">
                                  <div>
                                    <Form.Select
                                      aria-label="Choisir un type de document"
                                      value={selectDocumentType}
                                      onChange={handleDocumentTypeChange}
                                    >
                                      <option value="">Type de document</option>
                                      {documentTypeList?.length > 0 ? (
                                        documentTypeList?.map((doctype) => (
                                          <option
                                            key={doctype.id}
                                            value={doctype.id}
                                          >
                                            {doctype.name}
                                          </option>
                                        ))
                                      ) : (
                                        <option value="">
                                          {t("NorecordsfoundLabel")}
                                        </option>
                                      )}
                                    </Form.Select>
                                  </div>
                                  <div>
                                    <Link
                                      className={`sorting-icon ms-2`}
                                      onClick={() =>
                                        handleClickRotate("docType.name")
                                      }
                                    >
                                      {sort.value === "asc" && (
                                        <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                            fill="black"
                                          />
                                          <path
                                            d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                            fill="black"
                                            fill-opacity="0.5"
                                          />
                                        </svg>
                                      )}

                                      {sort.value === "desc" && (
                                        <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                            fill="black"
                                            fill-opacity="0.5"
                                          />
                                          <path
                                            d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                            fill="black"
                                          />
                                        </svg>
                                      )}
                                    </Link>
                                  </div>
                                </div>
                              </th>
                            )}
                            {selectedSpeakerColumns.includes("status") && (
                              <th className="select-drop elips-dropdown">
                                <div className="d-flex align-items-center">
                                  <div>
                                    <Form.Select
                                      aria-label="statusSelectAria"
                                      value={editUserStatus}
                                      onChange={(e) =>
                                        handleStatusChange(e.target.value)
                                      }
                                    >
                                      <option value="">{t("status")}</option>
                                      <option value="to_be_checked">
                                        {t("toBeCheckedLabel")}
                                      </option>
                                      <option value="verified">
                                        {t("verified")}
                                      </option>
                                      <option value="invalid">
                                        {t("invalidLabel")}
                                      </option>
                                    </Form.Select>
                                  </div>
                                  <div>
                                    <Link
                                      className={`sorting-icon ms-2`}
                                      onClick={() =>
                                        handleClickRotate("status")
                                      }
                                    >
                                      {sort.value === "asc" && (
                                        <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                            fill="black"
                                          />
                                          <path
                                            d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                            fill="black"
                                            fill-opacity="0.5"
                                          />
                                        </svg>
                                      )}

                                      {sort.value === "desc" && (
                                        <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                            fill="black"
                                            fill-opacity="0.5"
                                          />
                                          <path
                                            d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                            fill="black"
                                          />
                                        </svg>
                                      )}
                                    </Link>
                                  </div>
                                </div>
                              </th>
                            )}
                            {selectedSpeakerColumns.includes("Actions") && (
                              <th>Actions</th>
                            )}
                            <th style={{ textAlign: "right" }}>
                              <Link onClick={handleAddPaperColShow}>
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
                          {paperList?.length > 0 &&
                          selectedSpeakerColumns?.length > 0 ? (
                            paperList?.map((data) => (
                              <tr>
                                {selectedSpeakerColumns.includes(
                                  "fileNameLabe"
                                ) && (
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <span className="file-type-icon">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                        >
                                          <path
                                            d="M12.65 2.23994C12.4689 2.08503 12.2383 1.99992 12 1.99994H5C4.73478 1.99994 4.48043 2.1053 4.29289 2.29283C4.10536 2.48037 4 2.73472 4 2.99994V20.9999C4 21.2652 4.10536 21.5195 4.29289 21.7071C4.48043 21.8946 4.73478 21.9999 5 21.9999H19C19.2652 21.9999 19.5196 21.8946 19.7071 21.7071C19.8946 21.5195 20 21.2652 20 20.9999V8.99994C20 8.8555 19.9687 8.71277 19.9083 8.58157C19.8479 8.45038 19.7598 8.33383 19.65 8.23994L12.65 2.23994ZM13 5.16994L16.3 7.99994H13V5.16994ZM18 19.9999H6V3.99994H11V8.99994C11 9.26516 11.1054 9.51951 11.2929 9.70705C11.4804 9.89458 11.7348 9.99994 12 9.99994H18V19.9999Z"
                                            fill="white"
                                          />
                                        </svg>
                                      </span>
                                      <span className="text-elips">
                                        {data.file_name}
                                      </span>
                                    </div>
                                  </td>
                                )}
                                {selectedSpeakerColumns.includes(
                                  "speakerLabel"
                                ) && (
                                  <td>
                                    {data.speaker
                                      ? data.speaker?.company_name +
                                        " - " +
                                        data.speaker?.siren_number
                                      : "-"}
                                  </td>
                                )}
                                {selectedSpeakerColumns.includes(
                                  "Type de document"
                                ) && <td>{data.docType.name}</td>}
                                {selectedSpeakerColumns.includes("status") && (
                                  <td>
                                    {data.status == "to_be_checked" ? (
                                      <span className="checked badges">
                                        {t("toBeCheckedLabel")}
                                      </span>
                                    ) : data.status == "verified" ? (
                                      <span className="verified badges">
                                        {t("verified")}
                                      </span>
                                    ) : (
                                      <span className="incomplete badges">
                                        {t("invalidLabel")}
                                      </span>
                                    )}
                                  </td>
                                )}
                                {selectedSpeakerColumns.includes("Actions") && (
                                  <td>
                                    <div class="action-btn">
                                      <Link
                                        onClick={() => {
                                          handleViewShowPaperDoc(data.id);
                                        }}
                                        class="view"
                                        data-discover="true"
                                      >
                                        <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M12 6.5C15.79 6.5 19.17 8.63 20.82 12C19.17 15.37 15.8 17.5 12 17.5C8.2 17.5 4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5C10.62 14.5 9.5 13.38 9.5 12C9.5 10.62 10.62 9.5 12 9.5ZM12 7.5C9.52 7.5 7.5 9.52 7.5 12C7.5 14.48 9.52 16.5 12 16.5C14.48 16.5 16.5 14.48 16.5 12C16.5 9.52 14.48 7.5 12 7.5Z"
                                            fill="#00366B"
                                          />
                                        </svg>
                                      </Link>
                                      <Link
                                        class="addnote"
                                        href="/user-management"
                                        data-discover="true"
                                        onClick={() =>
                                          handleAddNoteModalOpen(
                                            data.id,
                                            data.file_name
                                          )
                                        }
                                      >
                                        <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <rect
                                            x="4"
                                            y="3"
                                            width="16"
                                            height="18"
                                            rx="2"
                                            stroke="#e84455"
                                            stroke-width="2"
                                          />
                                          <line
                                            x1="8"
                                            y1="7"
                                            x2="16"
                                            y2="7"
                                            stroke="#e84455"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                          />
                                          <line
                                            x1="8"
                                            y1="11"
                                            x2="16"
                                            y2="11"
                                            stroke="#e84455"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                          />
                                          <line
                                            x1="8"
                                            y1="15"
                                            x2="13"
                                            y2="15"
                                            stroke="#e84455"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                          />
                                        </svg>
                                      </Link>
                                      <Link
                                        class="download"
                                        href="/user-management"
                                        data-discover="true"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          setShowDocumentId(data.id);
                                          HandleDownloadFile(data);
                                        }}
                                      >
                                        <svg
                                          width="24px"
                                          height="24px"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M23 22C23 22.5523 22.5523 23 22 23H2C1.44772 23 1 22.5523 1 22C1 21.4477 1.44772 21 2 21H22C22.5523 21 23 21.4477 23 22Z"
                                            fill="#e84455"
                                          />
                                          <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M13.3099 18.6881C12.5581 19.3396 11.4419 19.3396 10.6901 18.6881L5.87088 14.5114C4.47179 13.2988 5.32933 11 7.18074 11L9.00001 11V3C9.00001 1.89543 9.89544 1 11 1L13 1C14.1046 1 15 1.89543 15 3L15 11H16.8193C18.6707 11 19.5282 13.2988 18.1291 14.5114L13.3099 18.6881ZM11.3451 16.6091C11.7209 16.9348 12.2791 16.9348 12.6549 16.6091L16.8193 13H14.5C13.6716 13 13 12.3284 13 11.5V3L11 3V11.5C11 12.3284 10.3284 13 9.50001 13L7.18074 13L11.3451 16.6091Z"
                                            fill="#e84455"
                                          />
                                        </svg>
                                      </Link>
                                      {/* {data.status !== "verified" && */}
                                      <Link
                                        class="doc"
                                        href="/user-management"
                                        data-discover="true"
                                        onClick={() => {
                                          handleCheckShow();
                                          setShowDocumentId(data.id);
                                        }}
                                      >
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
                                      {/* } */}
                                      <Link
                                        class="delete"
                                        href="/user-management"
                                        data-discover="true"
                                        onClick={() => {
                                          handleShowDeleteModal();
                                          setShowDocumentId(data.id);
                                        }}
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
                            <tr style={{ textAlign: "center" }}>
                              <td colSpan="6">{t("NorecordsfoundLabel")}</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  )}
                  {totalPaperRecords > 10 && (
                    <Paginations
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </Tab>
              {/* Missing Documnet Tab */}
              <Tab
                eventKey="missingdocument"
                title={`Documents manquants (${totalMissingRecords || 0})`}
              >
                <div className="table-wrapper mt-16 p-0">
                  <div className="d-md-flex align-items-center gap-2 justify-content-between">
                    {/* <h2 className="m-md-0 mb-3">Documents manquants ({totalMissingRecords})</h2> */}
                    <div className="">
                      <Offcanvas
                        className="add-folder-panel"
                        placement={"end"}
                        show={showMissingDoc}
                        onHide={() => handleMissingDocClose()}
                      >
                        <Offcanvas.Header closeButton>
                          <Offcanvas.Title>
                            Ajouter un document manquants
                          </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                          <div className="step-1">
                            <div className="div">
                              <div className="step-2">
                                <h2>
                                  Ajouter un document manquants <span>*</span>
                                </h2>
                                {flashMessageStoreDoc.message && (
                                  <div
                                    className={`mt-3 alert ${
                                      flashMessageStoreDoc.type === "success"
                                        ? "alert-success"
                                        : "alert-danger"
                                    } text-center`}
                                    role="alert"
                                  >
                                    {flashMessageStoreDoc.message}
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
                                        handleUpdateFileChange({
                                          target: { files },
                                        });
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
                                      <span className="browse-link">
                                        {t("browsemyfilesLabel")}
                                      </span>
                                    </p>
                                    <span>
                                      {t("documentsAcceptedLabel")}: mot,
                                      exceller, pdf, PowerPoint
                                    </span>
                                    <Form.Control
                                      type="file"
                                      className="file-input"
                                      multiple
                                      onChange={handleUpdateFileChange}
                                    />
                                  </div>
                                </Form.Group>
                                {fileList.length > 0 && (
                                  <div className="upload-file-list">
                                    {fileList.map((file, index) => (
                                      <div key={index} className="upload-file">
                                        <span>{file.name}</span>
                                        <Link onClick={() => setFileList([])}>
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
                            </div>
                          </div>
                        </Offcanvas.Body>
                        <div className="offcanvas-footer text-end">
                          <button
                            className="btn btn-primary"
                            disabled={
                              documentUploading || !fileList?.length > 0
                            }
                            onClick={(e) => AddMissingDocument(e)}
                          >
                            {documentUploading ? "Suivant..." : "Suivant"}
                          </button>
                        </div>
                      </Offcanvas>
                    </div>
                  </div>
                  {isLoading ? (
                    <Loading />
                  ) : (
                    <div className="table-wrap mt-24">
                      <Table responsive hover>
                        <thead>
                          <tr>
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Type de document</span>
                                <div>
                                  <Link
                                    className={`sorting-icon ms-2`}
                                    onClick={() =>
                                      handleClickRotate("documentType.name")
                                    }
                                  >
                                    {sort.value === "asc" && (
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                          fill="black"
                                        />
                                        <path
                                          d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                          fill="black"
                                          fill-opacity="0.5"
                                        />
                                      </svg>
                                    )}

                                    {sort.value === "desc" && (
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                          fill="black"
                                          fill-opacity="0.5"
                                        />
                                        <path
                                          d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                          fill="black"
                                        />
                                      </svg>
                                    )}
                                  </Link>
                                </div>
                              </div>
                            </th>
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Intervenant</span>
                                <div>
                                  <Link
                                    className={`sorting-icon ms-2`}
                                    onClick={() =>
                                      handleClickRotate("speaker.company_name")
                                    }
                                  >
                                    {sort.value === "asc" && (
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                          fill="black"
                                        />
                                        <path
                                          d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                          fill="black"
                                          fill-opacity="0.5"
                                        />
                                      </svg>
                                    )}

                                    {sort.value === "desc" && (
                                      <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                          fill="black"
                                          fill-opacity="0.5"
                                        />
                                        <path
                                          d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                          fill="black"
                                        />
                                      </svg>
                                    )}
                                  </Link>
                                </div>
                              </div>
                            </th>
                            <th>
                              <div className="d-flex align-items-center">
                                <div>
                                  <Form.Select
                                    aria-label="statusSelectAria"
                                    value={selectIsRequired}
                                    onChange={handleTableIsRequiredChange}
                                  >
                                    <option value="">Tout</option>
                                    <option value="0">Non requis</option>
                                    <option value="1">Requis</option>
                                  </Form.Select>
                                </div>
                              </div>
                            </th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {missingDocumentList?.length > 0 ? (
                            missingDocumentList?.map((data) => (
                              <tr>
                                <td>{data.documentType.name}</td>
                                <td className="bold-font">
                                  {data.speaker.company_name != ""
                                    ? data.speaker.company_name
                                    : "-"}
                                </td>
                                <td>
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={data.is_required === 0}
                                    onChange={() => {
                                      handleNotRequiredChangeShow();
                                      setSelectDocumentId(data.id);
                                      setShowSpeakerId(data.speaker.id);
                                    }}
                                  />
                                </td>
                                <td>
                                  <div className="action-btn">
                                    <Link
                                      onClick={() => {
                                        handleMissingDocShow();
                                        setShowSpeakerId(data?.speaker?.id);
                                        setMissingDocumentId(data.id);
                                      }}
                                      className="doc"
                                      href="/user-management"
                                      data-discover="true"
                                      title="Ajouter un Document"
                                    >
                                      <svg
                                        width="16"
                                        height="20"
                                        viewBox="0 0 16 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M9 9H7V12H4V14H7V17H9V14H12V12H9V9ZM10 0H2C0.9 0 0 0.9 0 2V18C0 19.1 0.89 20 1.99 20H14C15.1 20 16 19.1 16 18V6L10 0ZM14 18H2V2H9V7H14V18Z"
                                          fill="black"
                                        />
                                      </svg>
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr style={{ textAlign: "center" }}>
                              <td colSpan="4">{t("NorecordsfoundLabel")}</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  )}
                  {totalMissingRecords > 10 && (
                    <Paginations
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </Tab>
            </Tabs>
          </Tab>

          {/* Speakers Tab */}
          <Tab
            eventKey="intervenants"
            title={`Intervenants (${totalSpeakerRecords || 0})`}
          >
            {showSepeakerInner ? (
              <div className="inner-tab-screen">
                <div className="d-md-flex">
                  <div className="me-0 me-md-4">
                    {flashMessage.message && (
                      <div
                        className={`alert ${
                          flashMessage.type === "success"
                            ? "alert-success"
                            : "alert-danger"
                        } text-center`}
                        role="alert"
                      >
                        {flashMessage.message}
                      </div>
                    )}
                    {flashMessageStoreDoc.message && (
                      <div
                        className={`mt-3 alert ${
                          flashMessageStoreDoc.type === "success"
                            ? "alert-success"
                            : "alert-danger"
                        } text-center`}
                        role="alert"
                      >
                        {flashMessageStoreDoc.message}
                      </div>
                    )}
                    {isLoading ? (
                      <Loading />
                    ) : (
                      <Form>
                        <div className="d-block mb-2">
                          <span
                            className="back-screen"
                            onClick={() => setShowSpeakerInner(false)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="23"
                              viewBox="0 0 18 23"
                              fill="none"
                            >
                              <path
                                d="M17.4148 11.8702C17.0398 11.4952 16.5311 11.2846 16.0008 11.2846C15.4705 11.2846 14.9619 11.4952 14.5868 11.8702L11.0008 15.4562V2.28418C11.0008 1.75375 10.7901 1.24504 10.415 0.869966C10.04 0.494893 9.53125 0.28418 9.00081 0.28418C8.47038 0.28418 7.96167 0.494893 7.5866 0.869966C7.21153 1.24504 7.00081 1.75375 7.00081 2.28418V15.4562L3.41481 11.8702C3.03761 11.5059 2.53241 11.3043 2.00801 11.3088C1.48362 11.3134 0.981993 11.5237 0.611177 11.8945C0.240361 12.2654 0.0300231 12.767 0.0254662 13.2914C0.0209094 13.8158 0.222498 14.321 0.586814 14.6982L7.58681 21.6982C7.96187 22.0731 8.47049 22.2838 9.00081 22.2838C9.53114 22.2838 10.0398 22.0731 10.4148 21.6982L17.4148 14.6982C17.7898 14.3231 18.0004 13.8145 18.0004 13.2842C18.0004 12.7539 17.7898 12.2452 17.4148 11.8702Z"
                                fill="#00366B"
                              />
                            </svg>
                          </span>
                        </div>
                        <Form.Label>
                          N° de SIRET <span>*</span>
                        </Form.Label>
                        <Form.Control
                          className="mb-3"
                          type="text"
                          placeholder="SIRET"
                          name="siren_number"
                          disabled
                          value={
                            speakerDetail?.siren_number
                              ? speakerDetail?.siren_number
                              : "-"
                          }
                          onChange={(e) =>
                            setSpeakerDetail({
                              ...speakerDetail,
                              siren_number: e.target.value,
                            })
                          }
                        />
                        <Form.Label>
                          Nom société <span>*</span>
                        </Form.Label>
                        <Form.Control
                          className="mb-3"
                          type="text"
                          placeholder="Nom société"
                          defaultValue="Mark"
                          name="company_name"
                          disabled
                          value={
                            speakerDetail?.company_name
                              ? speakerDetail?.company_name
                              : "-"
                          }
                          onChange={(e) =>
                            setSpeakerDetail({
                              ...speakerDetail,
                              company_name: e.target.value,
                            })
                          }
                        />
                        <Form.Label>
                          Adresse <span>*</span>
                        </Form.Label>
                        <Form.Control
                          className="mb-3"
                          type="text"
                          placeholder="Adresse"
                          name="address"
                          disabled
                          value={
                            speakerDetail?.address
                              ? speakerDetail?.address
                              : "-"
                          }
                          onChange={(e) =>
                            setSpeakerDetail({
                              ...speakerDetail,
                              address: e.target.value,
                            })
                          }
                        />

                        <div className="d-md-flex align-items-center side-col">
                          <Form.Group
                            className="post-code"
                            controlId="postcode"
                          >
                            <Form.Label>
                              Code postal <span>*</span>
                            </Form.Label>
                            <Form.Control
                              className="mb-3"
                              type="text"
                              placeholder="Code postal"
                              name="postcode"
                              disabled
                              value={
                                speakerDetail?.postcode
                                  ? speakerDetail?.postcode
                                  : "-"
                              }
                              onChange={(e) =>
                                setSpeakerDetail({
                                  ...speakerDetail,
                                  postcode: e.target.value,
                                })
                              }
                            />
                          </Form.Group>

                          <Form.Group className="" controlId="city">
                            <Form.Label>
                              Ville <span>*</span>
                            </Form.Label>
                            <Form.Control
                              className="mb-3"
                              type="text"
                              placeholder="Ville"
                              name="city"
                              disabled
                              value={
                                speakerDetail?.city ? speakerDetail?.city : "-"
                              }
                              onChange={(e) =>
                                setSpeakerDetail({
                                  ...speakerDetail,
                                  city: e.target.value,
                                })
                              }
                            />
                          </Form.Group>
                        </div>
                      </Form>
                    )}
                  </div>
                  <div className="flex-fill">
                    <Tabs
                      onSelect={handleSubTabSelect}
                      defaultActiveKey="documents"
                      id="uncontrolled-tab-example"
                    >
                      <Tab
                        eventKey="documents"
                        title={`Documents (${totalSpeakerDocument})`}
                      >
                        {isLoading ? (
                          <Loading />
                        ) : (
                          <div className="table-wrapper mt-16 p-0">
                            <div className="table-wrap mt-24">
                              <Table responsive hover>
                                <thead>
                                  <tr>
                                    <th>Nom du fichier</th>
                                    <th>Type de document</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {showSpeakerDocument?.length > 0 ? (
                                    showSpeakerDocument?.map((data) => (
                                      <tr>
                                        <td>{data.filename}</td>
                                        <td>{data.docType?.name}</td>
                                        <td>
                                          {data.status == "to_be_checked" ? (
                                            <span className="checked badges">
                                              {t("toBeCheckedLabel")}
                                            </span>
                                          ) : data.status == "verified" ? (
                                            <span className="verified badges">
                                              {t("verified")}
                                            </span>
                                          ) : (
                                            <span className="incomplete badges">
                                              {t("invalidLabel")}
                                            </span>
                                          )}
                                        </td>
                                        <td>
                                          <Link
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              HandleDownloadFile(data);
                                            }}
                                            className="download"
                                            href="/user-management"
                                            data-discover="true"
                                            title="Télécharger"
                                          >
                                            <svg
                                              width="24"
                                              height="24"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path
                                                d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"
                                                fill="#e84455"
                                              />
                                              <path
                                                d="M8 14L12 18L16 14"
                                                stroke="#e84455"
                                                stroke-width="1.5"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                              />
                                              <path
                                                d="M12 11V18"
                                                stroke="#e84455"
                                                stroke-width="1.5"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                              />
                                            </svg>
                                          </Link>
                                          {/* {data.status !== "verified" && */}
                                          <Link
                                            className="delete"
                                            data-discover="true"
                                            title="Supprimer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleShowDeleteModal();
                                              setShowDocumentId(data.id);
                                            }}
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
                                                fill="#e84455"
                                              />
                                            </svg>
                                          </Link>
                                          {/* } */}
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr style={{ textAlign: "center" }}>
                                      <td colSpan="4">
                                        {t("NorecordsfoundLabel")}
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </Table>
                            </div>
                            {totalSpeakerDocument > 10 && (
                              <Paginations
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChangeView}
                              />
                            )}
                          </div>
                        )}
                      </Tab>
                      <Tab
                        eventKey="documentType"
                        title={`Documents manquants (${totalMissingDocument})`}
                      >
                        {flashMessage.message && (
                          <div
                            className={`alert ${
                              flashMessage.type === "success"
                                ? "alert-success"
                                : "alert-danger"
                            } text-center`}
                            role="alert"
                          >
                            {flashMessage.message}
                          </div>
                        )}
                        {isLoading ? (
                          <Loading />
                        ) : (
                          <div className="table-wrapper mt-16 p-0">
                            <div className="table-wrap mt-24">
                              <Table responsive hover>
                                <thead>
                                  <tr>
                                    <th>Type de document</th>
                                    <th>Non Requis</th>
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {speakerDocumentTypeList?.length > 0 ? (
                                    speakerDocumentTypeList?.map((data) => (
                                      <tr>
                                        <td>{data.documentType.name}</td>
                                        <td>
                                          <div style={{ marginTop: "4px" }}>
                                            <input
                                              type="checkbox"
                                              checked={data.is_required === 0}
                                              onChange={() =>
                                                handleCheckboxChange(data.id)
                                              }
                                              className="form-check-input"
                                            />
                                          </div>
                                        </td>
                                        <td>
                                          <Link
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleMissingDocShow();
                                              setMissingDocumentId(data.id);
                                            }}
                                            className="doc"
                                            href="/user-management"
                                            data-discover="true"
                                            title="Ajouter un document manquants"
                                          >
                                            <svg
                                              width="16"
                                              height="20"
                                              viewBox="0 0 16 20"
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path
                                                d="M9 9H7V12H4V14H7V17H9V14H12V12H9V9ZM10 0H2C0.9 0 0 0.9 0 2V18C0 19.1 0.89 20 1.99 20H14C15.1 20 16 19.1 16 18V6L10 0ZM14 18H2V2H9V7H14V18Z"
                                                fill="#e84455"
                                              />
                                            </svg>
                                          </Link>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr style={{ textAlign: "center" }}>
                                      <td colSpan="3">
                                        {t("NorecordsfoundLabel")}
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </Table>
                            </div>
                            {speakerDocumentTypeList?.length > 0 && (
                              <div class="">
                                <Button onClick={() => DocumentTypeUpdate()}>
                                  Valider
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </Tab>
                    </Tabs>
                  </div>
                </div>
              </div>
            ) : (
              <div className="table-wrapper mt-0 p-0">
                <div class="d-md-flex align-items-center gap-2 justify-content-between">
                  <h2 class="m-md-0 mb-3">
                    {/* Intervenants ({totalSpeaker}) */}
                  </h2>
                  <div class="d-flex">
                    <Button
                      className="d-flex align-items-center gap-3 add-speaker-btn"
                      variant="primary"
                      onClick={handleModalShow}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z"
                          fill="white"
                        />
                      </svg>
                      Ajouter un intervenant
                    </Button>
                    <Modal show={show} onHide={handleModalClose}>
                      <Form onSubmit={NewDocumentTypeCreate}>
                        <Modal.Header closeButton>
                          <Modal.Title>Ajout intervenant</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <h2>Nouvel intervenant</h2>
                          {flashMessage.message && (
                            <div
                              className={`alert ${
                                flashMessage.type === "success"
                                  ? "alert-success"
                                  : "alert-danger"
                              } text-center`}
                              role="alert"
                            >
                              {flashMessage.message}
                            </div>
                          )}
                          <Form.Group
                            className="mt-16 mb-4"
                            controlId="siret_number"
                          >
                            <Form.Label>
                              N° de SIRET <span>*</span>
                            </Form.Label>
                            <InputGroup>
                              <Form.Control
                                type="text"
                                placeholder="SIRET"
                                defaultValue={
                                  showSirenNumberDetail?.siret_number
                                }
                                name="siret_number"
                                onChange={(e) => setSIRETNumber(e.target.value)}
                              />
                              <Button
                                variant="primary"
                                onClick={() => HandleGetDetails(SIRETNumber)}
                                style={{
                                  height: "62px",
                                  borderTopLeftRadius: 0,
                                  borderBottomLeftRadius: 0,
                                }}
                              >
                                Obtenir des détails
                              </Button>
                            </InputGroup>
                          </Form.Group>
                          {isFormLoading ? (
                            <Loading />
                          ) : (
                            <Fragment>
                              <Form.Group
                                className="mt-16"
                                controlId="companyname"
                              >
                                <Form.Label>
                                  {t("companyname")} <span>*</span>
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder={t("companyname")}
                                  defaultValue={
                                    showSirenNumberDetail?.company_name
                                  }
                                  name="companyname"
                                />
                              </Form.Group>

                              <Form.Group
                                className="mt-16"
                                controlId="nic_number"
                              >
                                <Form.Label>
                                  N° de NIC <span>*</span>
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="NIC"
                                  defaultValue={
                                    showSirenNumberDetail?.nic_number
                                  }
                                  name="nic_number"
                                />
                              </Form.Group>

                              <Form.Group
                                className="mt-16"
                                controlId="siren_number"
                              >
                                <Form.Label>
                                  N° de SIREN <span>*</span>
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="SIREN"
                                  defaultValue={
                                    showSirenNumberDetail?.siren_number
                                  }
                                  name="siren_number"
                                />
                              </Form.Group>

                              <Form.Group className="mt-16" controlId="address">
                                <Form.Label>
                                  {t("address")} <span>*</span>
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder={t("address")}
                                  name="address"
                                  defaultValue={showSirenNumberDetail?.address}
                                />
                              </Form.Group>

                              <div className="d-md-flex align-items-center side-col">
                                <Form.Group
                                  className="mt-16 post-code"
                                  controlId="postcode"
                                >
                                  <Form.Label>
                                    {t("postcode")} <span>*</span>
                                  </Form.Label>
                                  <Form.Control
                                    type="text"
                                    placeholder={t("postcode")}
                                    name="postcode"
                                    defaultValue={
                                      showSirenNumberDetail?.postcode
                                    }
                                  />
                                </Form.Group>

                                <Form.Group className="mt-16" controlId="city">
                                  <Form.Label>
                                    {t("city")} <span>*</span>
                                  </Form.Label>
                                  <Form.Control
                                    type="text"
                                    placeholder={t("city")}
                                    name="city"
                                    defaultValue={showSirenNumberDetail?.city}
                                  />
                                </Form.Group>
                              </div>
                            </Fragment>
                          )}
                        </Modal.Body>
                        <Modal.Footer>
                          <div className="text-end">
                            <Button variant="primary" type="submit">
                              Ajouter
                            </Button>
                          </div>
                        </Modal.Footer>
                      </Form>
                    </Modal>
                  </div>
                </div>
                {isLoading ? (
                  <Loading />
                ) : (
                  <div className="table-wrap mt-24">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>
                            <div className="d-flex align-items-center">
                              <span>N° de SIRET</span>
                              <div>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() =>
                                    handleClickRotate("siren_number")
                                  }
                                >
                                  {sort.value === "asc" && (
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                        fill="black"
                                      />
                                      <path
                                        d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                        fill="black"
                                        fill-opacity="0.5"
                                      />
                                    </svg>
                                  )}

                                  {sort.value === "desc" && (
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                        fill="black"
                                        fill-opacity="0.5"
                                      />
                                      <path
                                        d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                        fill="black"
                                      />
                                    </svg>
                                  )}
                                </Link>
                              </div>
                            </div>
                          </th>
                          <th>
                            <div className="d-flex align-items-center">
                              <span>Intervenant</span>
                              <div>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() =>
                                    handleClickRotate("company_name")
                                  }
                                >
                                  {sort.value === "asc" && (
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                        fill="black"
                                      />
                                      <path
                                        d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                        fill="black"
                                        fill-opacity="0.5"
                                      />
                                    </svg>
                                  )}

                                  {sort.value === "desc" && (
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                        fill="black"
                                        fill-opacity="0.5"
                                      />
                                      <path
                                        d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                        fill="black"
                                      />
                                    </svg>
                                  )}
                                </Link>
                              </div>
                            </div>
                          </th>
                          <th>
                            <div className="d-flex align-items-center">
                              <span>Dernière MaJ</span>
                              <div>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() =>
                                    handleClickRotate("updated_at")
                                  }
                                >
                                  {sort.value === "asc" && (
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                        fill="black"
                                      />
                                      <path
                                        d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                        fill="black"
                                        fill-opacity="0.5"
                                      />
                                    </svg>
                                  )}

                                  {sort.value === "desc" && (
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                        fill="black"
                                        fill-opacity="0.5"
                                      />
                                      <path
                                        d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                        fill="black"
                                      />
                                    </svg>
                                  )}
                                </Link>
                              </div>
                            </div>
                          </th>
                          <th>Status</th>
                          <th>
                            <div className="d-flex align-items-center">
                              <span>Doc. associés</span>
                              <div>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() =>
                                    handleClickRotate("user_document_count")
                                  }
                                >
                                  {sort.value === "asc" && (
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                        fill="black"
                                      />
                                      <path
                                        d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                        fill="black"
                                        fill-opacity="0.5"
                                      />
                                    </svg>
                                  )}

                                  {sort.value === "desc" && (
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                        fill="black"
                                        fill-opacity="0.5"
                                      />
                                      <path
                                        d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                        fill="black"
                                      />
                                    </svg>
                                  )}
                                </Link>
                              </div>
                            </div>
                          </th>
                          <th>
                            <div className="d-flex align-items-center">
                              <span>Doc. Manquants</span>
                              <div>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() =>
                                    handleClickRotate("user_document_count")
                                  }
                                >
                                  {sort.value === "asc" && (
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                        fill="black"
                                      />
                                      <path
                                        d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                        fill="black"
                                        fill-opacity="0.5"
                                      />
                                    </svg>
                                  )}

                                  {sort.value === "desc" && (
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z"
                                        fill="black"
                                        fill-opacity="0.5"
                                      />
                                      <path
                                        d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                        fill="black"
                                      />
                                    </svg>
                                  )}
                                </Link>
                              </div>
                            </div>
                          </th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {speakerList?.length > 0 ? (
                          speakerList?.map((data) => (
                            <tr onClick={() => setShowSpeakerInner(true)}>
                              <td>{data.siren_number}</td>
                              <td>
                                <span className="text-elips">
                                  {data.company_name}
                                </span>
                              </td>
                              <td>{data.updated_at}</td>
                              <td>
                                <span className="doc-status success"></span>
                              </td>
                              <td>{data.user_document_count}</td>
                              <td>{data.missing_document_count}</td>
                              <td>
                                <div class="action-btn">
                                  <Link
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewShowSpeaker();
                                      setActiveSubTab("speaker");
                                      setShowSpeakerId(data.id);
                                      setTotalSpeakerDocument(
                                        data.user_document_count
                                      );
                                      setTotalMissingDocument(
                                        data.missing_document_count
                                      );
                                    }}
                                    class="view"
                                    href="/user-management"
                                    data-discover="true"
                                  >
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M12 6.5C15.79 6.5 19.17 8.63 20.82 12C19.17 15.37 15.8 17.5 12 17.5C8.2 17.5 4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5C10.62 14.5 9.5 13.38 9.5 12C9.5 10.62 10.62 9.5 12 9.5ZM12 7.5C9.52 7.5 7.5 9.52 7.5 12C7.5 14.48 9.52 16.5 12 16.5C14.48 16.5 16.5 14.48 16.5 12C16.5 9.52 14.48 7.5 12 7.5Z"
                                        fill="#00366B"
                                      />
                                    </svg>
                                  </Link>
                                  <Link
                                    class="delete"
                                    href="/user-management"
                                    data-discover="true"
                                    onClick={() => {
                                      handleShowDeleteModalSpeaker();
                                      setShowSpeakerId(data.id);
                                    }}
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
                            </tr>
                          ))
                        ) : (
                          <tr style={{ textAlign: "center" }}>
                            <td colSpan="6">{t("NorecordsfoundLabel")}</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
                {totalSpeakerRecords > 10 && (
                  <Paginations
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            )}
          </Tab>

          {/* History Tab */}
          {/* <Tab eventKey="history" title="Historique">
            <div className="mb-3 d-md-flex justify-content-between align-items-center">
              {markIsReadCount > 0 && (
                <button
                  className="custom-btn"
                  onClick={() => MarkHistoryAsReadAllDocument(id)}
                >
                  Marquer comme tout lu
                </button>
              )}
            </div>
            {isLoading ? (
              <Loading />
            ) : (
              <div
                className="scroll-container" // Set a scrollable container
                onScroll={handleScroll}
                style={{
                  maxHeight: "240px", // Set container height
                  overflowY: "auto", // Enable scrolling
                  scrollbarWidth: "thin",
                }}
              >
                {displayedRecords?.length > 0 ? (
                  displayedRecords?.map((data) => (
                    <Fragment>
                      <div className="note-box mb-3">
                        <div className="d-flex justify-content-between align-items-center top-part">
                          <p className="m-0">
                            {data.type == "note"
                              ? "Note"
                              : "Invalide"}
                          </p>
                          <p className="m-0 create-date">
                            créé le {data.created_on}
                          </p>
                        </div>
                        <div
                          className="inner-box"
                          style={{
                            backgroundColor:
                              data.is_read === 0 ? "#b0f0fa" : "#e3f0f2",
                          }}
                        >
                          <div className="d-md-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center mb-3">
                              {data.type != "note" && (
                                <div className="icon d-flex">
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 8 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M6.42457 3.36368V10.3334C6.42457 11.6728 5.33972 12.7576 4.00033 12.7576C2.66093 12.7576 1.57608 11.6728 1.57608 10.3334V2.75762C1.57608 1.92125 2.25487 1.24246 3.09123 1.24246C3.9276 1.24246 4.60639 1.92125 4.60639 2.75762V9.12125C4.60639 9.45459 4.33366 9.72731 4.00033 9.72731C3.66699 9.72731 3.39426 9.45459 3.39426 9.12125V3.36368H2.48517V9.12125C2.48517 9.95762 3.16396 10.6364 4.00033 10.6364C4.83669 10.6364 5.51548 9.95762 5.51548 9.12125V2.75762C5.51548 1.41822 4.43063 0.333374 3.09123 0.333374C1.75184 0.333374 0.666992 1.41822 0.666992 2.75762V10.3334C0.666992 12.1758 2.1579 13.6667 4.00033 13.6667C5.84275 13.6667 7.33366 12.1758 7.33366 10.3334V3.36368H6.42457Z"
                                      fill="#683191"
                                    ></path>
                                  </svg>
                                </div>
                              )}
                              <div className="file-names">
                                {data.user_document_filename}
                              </div>
                            </div>
                            {data.is_read != 1 && (
                              <button
                                className="custom-btn"
                                onClick={() =>
                                  MarkHistoryAsReadDocument(data.id)
                                }
                              >
                                Marquer Comme lu
                              </button>
                            )}
                          </div>
                          <p className="">{data.reason}</p>
                        </div>
                      </div>
                    </Fragment>
                  ))
                ) : (
                  <div className="inner-box">{t("NorecordsfoundLabel")}</div>
                )}
              </div>
            )}
          </Tab> */}

          <Tab eventKey="history" title="Historique">
            <div className="table-wrapper mt-16 p-0">
              <div className="d-md-flex align-items-center gap-2 justify-content-between">
                <div className=""></div>
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
                    onClick={() => handleSearchChange(search, 1)}
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
              {isLoading ? (
                <Loading />
              ) : (
                <div className="table-wrap mt-24">
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th className="select-drop elips-dropdown">
                          <div className="d-flex align-items-center">
                            <Form.Select
                              aria-label="Choisir un type de document"
                              value={selectActionType}
                              onChange={handleActionTypeChange}
                            >
                              <option value="">Type d'action</option>
                              <option value="Message">Message</option>
                              <option value="Changement de statut">
                                Changement de statut
                              </option>
                              <option value="Transmission">Transmission</option>
                            </Form.Select>
                          </div>
                        </th>
                        <th>Détails de l'action</th>
                        <th>Transférer par</th>
                        <th>Nom du document</th>
                        <th>Type de document</th>
                        <th>Note</th>
                        <th>Créé à</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyDocumentList?.length > 0 ? (
                        historyDocumentList?.map((data) => (
                          <tr>
                            <td>{data.action_type || "-"}</td>
                            <td>{data.action_details || "-"}</td>
                            <td>
                              {data.transfer_by ? data.transfer_by.name : "-"}
                            </td>
                            <td>
                              {data.user_document_file
                                ? data.user_document_file.filename
                                : "-"}
                            </td>
                            <td>
                              {data.user_document_file
                                ? data.user_document_file.document_type
                                : "-"}
                            </td>
                            <td>
                              {data.disability_reason
                                ? data.disability_reason.reason
                                : "-"}
                            </td>
                            <td>{data.created_at || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr style={{ textAlign: "left" }}>
                          <td colSpan={7}>{t("NorecordsfoundLabel")}</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              )}

              {totalHistoryRecords > 10 && (
                <Paginations
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </Tab>
        </Tabs>

        <AddNote
          showmodal={showAddNoteModal}
          handleModalClose={handleAddNoteModalClose}
          selectDocumentId={selectedAddNoteDocId}
          selectDocumentFileName={selectedAddNoteDocName}
        />

        {/* View Show Paper Document */}
        <Offcanvas
          className="add-folder-panel"
          placement={"end"}
          show={showViewPaperDoc}
          onHide={handleViewClosePaperDoc}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Informations sur les documents</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div className="div">
              <h2>Document</h2>
              <div className="table-wrapper mt-16 p-0">
                {isLoading ? (
                  <Loading />
                ) : (
                  <div className="table-wrap mt-24">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Nom du fichier</th>
                          <th>Type de document</th>
                          <th>Intervenant</th>
                          <th>Statut</th>
                          <th>Télécharger</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{fileDetail?.filename}</td>
                          <td>{fileDetail?.doc_type?.name}</td>
                          <td>
                            {fileDetail?.speaker
                              ? fileDetail?.speaker?.company_name +
                                " - " +
                                fileDetail?.speaker?.siren_number
                              : "-"}
                          </td>

                          <td>
                            {fileDetail?.status === "to_be_checked" ? (
                              <span className="checked badges">
                                {t("toBeCheckedLabel")}
                              </span>
                            ) : fileDetail?.status === "verified" ? (
                              <span className="verified badges">
                                {t("verified")}
                              </span>
                            ) : (
                              <span className="incomplete badges">
                                {t("incomplete")}
                              </span>
                            )}
                          </td>
                          <td>
                            <Link
                              class="download"
                              href="/user-management"
                              data-discover="true"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                HandleDownloadFile(fileDetail);
                              }}
                            >
                              <svg
                                width="24px"
                                height="24px"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M23 22C23 22.5523 22.5523 23 22 23H2C1.44772 23 1 22.5523 1 22C1 21.4477 1.44772 21 2 21H22C22.5523 21 23 21.4477 23 22Z"
                                  fill="#e84455"
                                />
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M13.3099 18.6881C12.5581 19.3396 11.4419 19.3396 10.6901 18.6881L5.87088 14.5114C4.47179 13.2988 5.32933 11 7.18074 11L9.00001 11V3C9.00001 1.89543 9.89544 1 11 1L13 1C14.1046 1 15 1.89543 15 3L15 11H16.8193C18.6707 11 19.5282 13.2988 18.1291 14.5114L13.3099 18.6881ZM11.3451 16.6091C11.7209 16.9348 12.2791 16.9348 12.6549 16.6091L16.8193 13H14.5C13.6716 13 13 12.3284 13 11.5V3L11 3V11.5C11 12.3284 10.3284 13 9.50001 13L7.18074 13L11.3451 16.6091Z"
                                  fill="#e84455"
                                />
                              </svg>
                            </Link>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </Offcanvas.Body>
          <div className="offcanvas-footer text-end">
            {/* <button
            className="btn btn-primary"
          >
            Suivant
          </button> */}
          </div>
        </Offcanvas>

        {/* Delete Confirmation Popup */}
        <Modal
          className="final-modal"
          show={showDeleteModal}
          onHide={handleCloseDeleteModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <h2>Confirmation</h2>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Etes-vous sûr de vouloir supprimer le fichier?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="cancel-btn"
              variant="primary"
              onClick={handleCloseDeleteModal}
            >
              Annuler
            </Button>
            <Button variant="primary" onClick={HandleDeleteDocumentFile}>
              {t("confirmbtnLabel")}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          className="final-modal"
          show={showFinalModal}
          onHide={handleCloseFinalModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>Transmettre dossier</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h2 className="mb-3">
              Finalisation du dossier {folderDetail.folder_name}
            </h2>
            <p>
              En finalisant le dossier, vous garantissez avoir effectuer les
              informations suivantes:
            </p>
            <ul>
              <li>Renseigner tous les champs obligatoires</li>
              <li>Renseigner un maximum de champs optionnels</li>
              <li>Vérifier la validité de chaque document</li>
              <li>
                Vérifier la présence de tous les documents nécessaires au
                traitement du dossier
              </li>
            </ul>
            <p className="mb-5">
              Après confirmation, les éléments du dossier seront envoyés au
              système d'information ACTURIS.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="cancel-btn"
              variant="primary"
              onClick={handleCloseFinalModal}
            >
              Annuler
            </Button>
            <Button variant="primary" onClick={ValidateDocumentFile}>
              Confirmer et finalizer
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Speaker Popup */}
        <Modal
          className="final-modal"
          show={showDeleteModalSpeaker}
          onHide={handleCloseDeleteModalSpeaker}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <h2>Confirmation</h2>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Etes-vous sûr de vouloir supprimer le intervenant?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="cancel-btn"
              variant="primary"
              onClick={handleCloseDeleteModalSpeaker}
            >
              Annuler
            </Button>
            <Button variant="primary" onClick={HandleDeleteSpeaker}>
              {t("confirmbtnLabel")}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Popup Document from speaker */}
        <Modal
          className="final-modal"
          show={showDeleteModalSpeakerDocument}
          onHide={handleCloseDeleteModalSpeakerDocument}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <h2>Confirmation</h2>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Etes-vous sûr de vouloir supprimer le fichier?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="cancel-btn"
              variant="primary"
              onClick={handleCloseDeleteModalSpeakerDocument}
            >
              Annuler
            </Button>
            <Button variant="primary" onClick={HandleDeleteSpeakerDocument}>
              {t("confirmbtnLabel")}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* View Speaker Pop Up Design */}
        <Offcanvas
          className="add-folder-panel"
          placement={"end"}
          show={showViewSpeaker}
          onHide={handleViewCloseSpeaker}
        >
          <Offcanvas.Header className="" closeButton>
            <Offcanvas.Title>Détail intervenant</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Tabs
              activeKey={activeSubTab}
              onSelect={handleSubTabSelect}
              id="uncontrolled-tab-example"
            >
              <Tab eventKey="speaker" title="Informations générales ">
                {flashMessage.message && (
                  <div
                    className={`alert ${
                      flashMessage.type === "success"
                        ? "alert-success"
                        : "alert-danger"
                    } text-center`}
                    role="alert"
                  >
                    {flashMessage.message}
                  </div>
                )}
                {flashMessageStoreDoc.message && (
                  <div
                    className={`mt-3 alert ${
                      flashMessageStoreDoc.type === "success"
                        ? "alert-success"
                        : "alert-danger"
                    } text-center`}
                    role="alert"
                  >
                    {flashMessageStoreDoc.message}
                  </div>
                )}
                {isLoading ? (
                  <Loading />
                ) : (
                  <Form>
                    <Form.Label>
                      N° de SIRET <span>*</span>
                    </Form.Label>
                    <Form.Control
                      className="mb-3"
                      type="text"
                      placeholder="SIRET"
                      name="siren_number"
                      disabled
                      value={
                        speakerDetail?.siren_number
                          ? speakerDetail?.siren_number
                          : "-"
                      }
                      onChange={(e) =>
                        setSpeakerDetail({
                          ...speakerDetail,
                          siren_number: e.target.value,
                        })
                      }
                    />
                    <Form.Label>
                      Nom société <span>*</span>
                    </Form.Label>
                    <Form.Control
                      className="mb-3"
                      type="text"
                      placeholder="Nom société"
                      defaultValue="Mark"
                      name="company_name"
                      disabled
                      value={
                        speakerDetail?.company_name
                          ? speakerDetail?.company_name
                          : "-"
                      }
                      onChange={(e) =>
                        setSpeakerDetail({
                          ...speakerDetail,
                          company_name: e.target.value,
                        })
                      }
                    />
                    <Form.Label>
                      Adresse <span>*</span>
                    </Form.Label>
                    <Form.Control
                      className="mb-3"
                      type="text"
                      placeholder="Adresse"
                      name="address"
                      disabled
                      value={
                        speakerDetail?.address ? speakerDetail?.address : "-"
                      }
                      onChange={(e) =>
                        setSpeakerDetail({
                          ...speakerDetail,
                          address: e.target.value,
                        })
                      }
                    />

                    <div className="d-md-flex align-items-center side-col">
                      <Form.Group className="post-code" controlId="postcode">
                        <Form.Label>
                          Code postal <span>*</span>
                        </Form.Label>
                        <Form.Control
                          className="mb-3"
                          type="text"
                          placeholder="Code postal"
                          name="postcode"
                          disabled
                          value={
                            speakerDetail?.postcode
                              ? speakerDetail?.postcode
                              : "-"
                          }
                          onChange={(e) =>
                            setSpeakerDetail({
                              ...speakerDetail,
                              postcode: e.target.value,
                            })
                          }
                        />
                      </Form.Group>

                      <Form.Group className="" controlId="city">
                        <Form.Label>
                          Ville <span>*</span>
                        </Form.Label>
                        <Form.Control
                          className="mb-3"
                          type="text"
                          placeholder="Ville"
                          name="city"
                          disabled
                          value={
                            speakerDetail?.city ? speakerDetail?.city : "-"
                          }
                          onChange={(e) =>
                            setSpeakerDetail({
                              ...speakerDetail,
                              city: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </div>
                  </Form>
                )}
              </Tab>
              <Tab
                eventKey="documents"
                title={`Documents (${totalSpeakerDocument})`}
              >
                {isLoading ? (
                  <Loading />
                ) : (
                  <div className="table-wrapper mt-16 p-0">
                    <div className="table-wrap mt-24">
                      <Table responsive hover>
                        <thead>
                          <tr>
                            <th>Nom du fichier</th>
                            <th>Type de document</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {showSpeakerDocument?.length > 0 ? (
                            showSpeakerDocument?.map((data) => (
                              <tr>
                                <td>{data.filename}</td>
                                <td>{data.docType?.name}</td>
                                <td>
                                  {data.status == "to_be_checked" ? (
                                    <span className="checked badges">
                                      {t("toBeCheckedLabel")}
                                    </span>
                                  ) : data.status == "verified" ? (
                                    <span className="verified badges">
                                      {t("verified")}
                                    </span>
                                  ) : (
                                    <span className="incomplete badges">
                                      {t("invalidLabel")}
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <Link
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      HandleDownloadFile(data);
                                    }}
                                    className="download"
                                    href="/user-management"
                                    data-discover="true"
                                    title="Télécharger"
                                  >
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"
                                        fill="#e84455"
                                      />
                                      <path
                                        d="M8 14L12 18L16 14"
                                        stroke="#e84455"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      />
                                      <path
                                        d="M12 11V18"
                                        stroke="#e84455"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      />
                                    </svg>
                                  </Link>
                                  {/* {data.status !== "verified" && */}
                                  <Link
                                    className="delete"
                                    data-discover="true"
                                    title="Supprimer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShowDeleteModal();
                                      setShowDocumentId(data.id);
                                    }}
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
                                        fill="#e84455"
                                      />
                                    </svg>
                                  </Link>
                                  {/* } */}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr style={{ textAlign: "center" }}>
                              <td colSpan="4">{t("NorecordsfoundLabel")}</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                    {totalSpeakerDocument > 10 && (
                      <Paginations
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChangeView}
                      />
                    )}
                  </div>
                )}
              </Tab>
              <Tab
                eventKey="documentType"
                title={`Documents manquants (${totalMissingDocument})`}
              >
                {flashMessage.message && (
                  <div
                    className={`alert ${
                      flashMessage.type === "success"
                        ? "alert-success"
                        : "alert-danger"
                    } text-center`}
                    role="alert"
                  >
                    {flashMessage.message}
                  </div>
                )}
                {isLoading ? (
                  <Loading />
                ) : (
                  <div className="table-wrapper mt-16 p-0">
                    <div className="table-wrap mt-24">
                      <Table responsive hover>
                        <thead>
                          <tr>
                            <th>Type de document</th>
                            <th>Non Requis</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {speakerDocumentTypeList?.length > 0 ? (
                            speakerDocumentTypeList?.map((data) => (
                              <tr>
                                <td>{data.documentType.name}</td>
                                <td>
                                  <div style={{ marginTop: "4px" }}>
                                    <input
                                      type="checkbox"
                                      checked={data.is_required === 0}
                                      onChange={() =>
                                        handleCheckboxChange(data.id)
                                      }
                                      className="form-check-input"
                                    />
                                  </div>
                                </td>
                                <td>
                                  <Link
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMissingDocShow();
                                      setMissingDocumentId(data.id);
                                    }}
                                    className="doc"
                                    href="/user-management"
                                    data-discover="true"
                                    title="Ajouter un document manquants"
                                  >
                                    <svg
                                      width="16"
                                      height="20"
                                      viewBox="0 0 16 20"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9 9H7V12H4V14H7V17H9V14H12V12H9V9ZM10 0H2C0.9 0 0 0.9 0 2V18C0 19.1 0.89 20 1.99 20H14C15.1 20 16 19.1 16 18V6L10 0ZM14 18H2V2H9V7H14V18Z"
                                        fill="#e84455"
                                      />
                                    </svg>
                                  </Link>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr style={{ textAlign: "center" }}>
                              <td colSpan="3">{t("NorecordsfoundLabel")}</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                    {speakerDocumentTypeList?.length > 0 && (
                      <div class="">
                        <Button onClick={() => DocumentTypeUpdate()}>
                          Valider
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Tab>
            </Tabs>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Speaker Add Col Modal */}
        <Modal show={showAddPaperCol} onHide={handleAddPaperColClose}>
          <Modal.Header closeButton>
            <Modal.Title>Ajouter une colonne</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h2 className="mb-4">Liste des colonnes</h2>
            {/* Select All Checkbox */}
            <Form.Check
              id="select-all-checkbox"
              label="Sélectionner tout"
              checked={Object.values(paperModalColumns).every((value) => value)} // All true
              onChange={(e) => {
                const isChecked = e.target.checked;
                setPaperModalColumns((prev) =>
                  Object.fromEntries(
                    Object.keys(prev).map((key) => [key, isChecked])
                  )
                );
              }}
            />

            {/* Individual Column Checkboxes */}
            {Object.keys(paperModalColumns).map((key) => (
              <Form.Check
                key={key}
                id={`checkbox-${key}`}
                label={
                  <label
                    style={{ cursor: "pointer" }}
                    htmlFor={`checkbox-${key}`}
                  >
                    {t(key)}
                  </label>
                }
                checked={paperModalColumns[key]}
                onChange={() => handlePaperCheckboxChange(key)}
              />
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleAddPaperColSubmit}>
              Ajouter
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Etat du chantier Change Confirmation Popup */}
        <Modal
          className="missing-doc-modal"
          show={showSiteStatusChange}
          onHide={() => setShowSiteStatusChange(true)}
        >
          <Modal.Header closeButton onHide={handleSiteStatusChangeClose}>
            <Modal.Title>
              <h2>Confirmer</h2>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span className="complete-process">
              Êtes-vous sûr de vouloir modifier le statut?
            </span>
          </Modal.Body>
          <Modal.Footer>
            <div className="text-end">
              <Button
                variant="primary"
                onClick={() => HandleSiteStatusUpdate()}
              >
                {t("confirmbtnLabel")}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>

      {/* Send To Manager, Broker, file  */}
      <Modal
        className="missing-doc-modal"
        show={showSendFileChange}
        onHide={() => setShowSendFileChange(true)}
      >
        <Modal.Header closeButton onHide={handleSendFileClose}>
          <Modal.Title>
            <h2>Confirmer</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span className="complete-process">
            Êtes-vous sûr de vouloir transférer ceci ?
          </span>
        </Modal.Body>
        <Modal.Footer>
          <div className="text-end">
            <Button variant="primary" onClick={() => SendFileToUpdate()}>
              {t("confirmbtnLabel")}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Requried & Not Requried Change Confirmation Popup */}
      <Modal
        className="missing-doc-modal"
        show={showNotRequiredStatusChange}
        onHide={() => setShowNotRequiredStatusChange(true)}
      >
        <Modal.Header closeButton onHide={handleNotRequiredChangeClose}>
          <Modal.Title>
            <h2>Confirmer</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span className="complete-process">
            Êtes-vous sûr de vouloir modifier le document requis ?
          </span>
        </Modal.Body>
        <Modal.Footer>
          <div className="text-end">
            <Button
              variant="primary"
              onClick={() =>
                DocumentTypeUpdateSingle(selectDocumentId, showSpeakerId)
              }
            >
              {t("confirmbtnLabel")}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Note List Canvas */}
      <Offcanvas
        className="add-folder-panel broker-add-panel"
        placement={"end"}
        show={showNote}
        onHide={handleNoteClose}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Dossier incomplet</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="step-1">
            <div className="div">
              <div className="step-2">
                <h2>Liste de notes</h2>
                <Select
                  options={NotesOptions}
                  onChange={(selectedOption) =>
                    GetDocumentFileNotesList(id, selectedOption?.value)
                  }
                  styles={{
                    container: (provided) => ({
                      ...provided,
                      width: "50%",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      width: "100%",
                    }),
                  }}
                  placeholder={"Sélectionnez le type de note"}
                  isSearchable={true}
                  className={isNoteLoading ? "mb-5" : ""}
                />

                {isNoteLoading ? (
                  <Loading />
                ) : displayedRecordsNote?.length > 0 ? (
                  <div
                    ref={scrollRef}
                    className="scroll-container mt-3"
                    onScroll={handleScrollNote}
                    style={{
                      maxHeight: "calc(100vh - 250px)",
                      overflowY: "auto",
                      paddingRight: "5px",
                      scrollbarWidth: "thin",
                    }}
                  >
                    {displayedRecordsNote?.map((data) => (
                      <Fragment key={data.id}>
                        <div className="note-box mb-3">
                          <div className="d-flex justify-content-between align-items-center top-part">
                            <p className="m-0">
                              {data.type == "note" ? "Note" : "Invalide"}
                            </p>
                            <div className="d-flex align-items-center gap-2">
                              {data.is_important == 1 && (
                                <BsPatchExclamation
                                  style={{
                                    color: "red",
                                    fontSize: "1.0rem",
                                    cursor: "pointer",
                                  }}
                                  title="Remarque importante"
                                />
                              )}
                              <p className="m-0 create-date">
                                créé le {data.created_on}
                              </p>
                            </div>
                          </div>
                          <div className="inner-box">
                            {data.type == "note" &&
                              data.user_document_filename && (
                                <div className="d-flex align-items-center mb-3">
                                  <div className="icon d-flex">
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 8 14"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M6.42457 3.36368V10.3334C6.42457 11.6728 5.33972 12.7576 4.00033 12.7576C2.66093 12.7576 1.57608 11.6728 1.57608 10.3334V2.75762C1.57608 1.92125 2.25487 1.24246 3.09123 1.24246C3.9276 1.24246 4.60639 1.92125 4.60639 2.75762V9.12125C4.60639 9.45459 4.33366 9.72731 4.00033 9.72731C3.66699 9.72731 3.39426 9.45459 3.39426 9.12125V3.36368H2.48517V9.12125C2.48517 9.95762 3.16396 10.6364 4.00033 10.6364C4.83669 10.6364 5.51548 9.95762 5.51548 9.12125V2.75762C5.51548 1.41822 4.43063 0.333374 3.09123 0.333374C1.75184 0.333374 0.666992 1.41822 0.666992 2.75762V10.3334C0.666992 12.1758 2.1579 13.6667 4.00033 13.6667C5.84275 13.6667 7.33366 12.1758 7.33366 10.3334V3.36368H6.42457Z"
                                        fill="#683191"
                                      ></path>
                                    </svg>
                                  </div>
                                  <span className="file-names">
                                    {data.user_document_filename}
                                  </span>
                                </div>
                              )}

                            {data.added_by && (
                              <p
                                className="position-absolute"
                                style={{
                                  bottom: "5px",
                                  right: "10px",
                                  fontSize: "0.875rem",
                                  color: "#999",
                                  margin: 0,
                                }}
                              >
                                —{" "}
                                {`${data.added_by?.first_name ?? ""} ${
                                  data.added_by?.last_name ?? ""
                                }`}
                              </p>
                            )}
                            <p className="">{data.reason}</p>
                          </div>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3">{t("NorecordsfoundLabel")}</div>
                )}
              </div>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </Fragment>
  );
};

export default AdminFileDetail;
