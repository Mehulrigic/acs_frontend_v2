import React, { Fragment, useEffect, useRef } from "react";
import "./FileDetails.css";
import SidePanel from "../../Components/SidePanel/SidePanel";
import Table from "react-bootstrap/Table";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { Button, Form, Offcanvas } from "react-bootstrap";
import FilePageService from "../../API/FilePage/FilePageService";
import { useTranslation } from "react-i18next";
import AddFolderPanelService from "../../API/AddFolderPanel/AddFolderPanelService";
import DatePicker from "react-datepicker";
import { fr } from "date-fns/locale";
import Modal from "react-bootstrap/Modal";
import Paginations from "../../Components/Paginations/Paginations";
import logo from "../../ass-logo.png";
import Loading from "../../Common/Loading";
import "@cyntler/react-doc-viewer/dist/index.css";
import AcsManagerFileService from "../../API/AcsManager/AcsManagerFileService";
import AddNote from "../../Components/AddNote/AddNote";
import Select from "react-select";
import { BsPatchExclamation } from "react-icons/bs";
import { parse, format } from "date-fns";
import DashboardManagementService from "../../API/DashboardManagement/DashboardManagementService";
import TaskManagementService from "../../API/TaskManagement/TaskManagementService";

const FileDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const scrollRef = useRef(null);

  const [showSepeakerInner, setShowSpeakerInner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const toggleDetail = (e) => {
    e.preventDefault(); // prevent page reload if using <a>
    setIsVisible(!isVisible);
  };
  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSpeakerLoading, setIsSpeakerLoading] = useState(false);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeDocumentTab, setActiveDocumentTab] = useState("otherdocument");
  const [activeSubTab, setActiveSubTab] = useState("documents");
  const [showSpeakerId, setShowSpeakerId] = useState("");
  const [history, setHistory] = useState([
    {
      activeTab: "dashboard",
      activeDocumentTab: "otherdocument",
      activeSubTab: "documents",
    },
  ]);
  const [showUserDocumentData, setShowUserDocumentData] = useState([]);
  const [showUserFolderName, setShowUserFolderName] = useState("");
  const [showOtherDocument, setShowOtherDocument] = useState([]);
  const [showSpeakerDocument, setShowSpeakerDocument] = useState([]);
  const [speakerList, setSpeakerList] = useState([]);
  const [speakerDocumentTypeList, setSpeakerDocumentTypeList] = useState([]);
  const [speakerDetail, setSpeakerDetail] = useState();
  const [historyDocumentList, setHistoryDocumentList] = useState([]);
  const [totalHistoryRecords, setTotalHistoryRecords] = useState(0);
  const [totalMissingRecords, setTotalMissingRecords] = useState(0);
  const [missingDocumentList, setMissingDocumentList] = useState([]);
  const [showUserDocumentFileData, setShowUserDocumentFileData] = useState([]);
  const [userDocumentFileDataChanges, setUserDocumentFileDataChanges] =
    useState({
      id: "",
      status: "",
      doc_type_id: "",
    });
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });
  const [flashMessageStoreDoc, setFlashMessageStoreDoc] = useState({
    type: "",
    message: "",
  });
  const [fileList, setFileList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSpeaker, setTotalSpeaker] = useState(0);
  const [totalSpeakerDocument, setTotalSpeakerDocument] = useState(0);
  const [totalMissingDocument, setTotalMissingDocument] = useState(0);
  const [totalRecordOther, setTotalRecordOther] = useState(0);
  const [editUserStatus, setEditUserStatus] = useState("");
  const [documentTypeList, setDocumentTypeList] = useState([]);
  const [viewRowData, setViewRowData] = useState([]);
  const [selectDocumentType, setSelectDocumentType] = useState("");
  const [selectActionType, setSelectActionType] = useState("");
  const [selectDocumentId, setSelectDocumentId] = useState("");
  const [selectDocumentFileName, setSelectDocumentFileName] = useState("");
  const [missingDocumentId, setMissingDocumentId] = useState("");
  const [showDocumentId, setShowDocumentId] = useState("");
  const [showDocumentName, setShowDocumentName] = useState("");
  const [brokerList, setBrokerList] = useState([]);
  const [selectBroker, setSelectBroker] = useState("");
  const [recordsToShow, setRecordsToShow] = useState(2);
  const [invalidReasonNoteList, setInvalidReasonNoteList] = useState([]);
  const [recordsToShowNOte, setRecordsToShowNote] = useState(3);
  const [logoImageShow, setLogoImageShow] = useState("");
  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
  const [search, setSearch] = useState("");
  const [isRotated, setIsRotated] = useState(false);
  const [sort, setSort] = useState({ key: "created_at", value: "desc" });
  const [selectSpeakerId, setSelectSpeakerId] = useState("");
  const [speakerDropDownList, setSpeakerDropDownList] = useState([]);

  const [policyholderName, setPolicyholderName] = useState("");
  const [estimatedStartDate, setEstimatedStartDate] = useState(null);
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState(null);
  const [sendToFileStatus, setSendToFileStatus] = useState("");
  const [estimatedSiteCost, setEstimatedSiteCost] = useState("");
  const [finalSiteCost, setFinaldSiteCost] = useState("");

  const [showSendFileChange, setShowSendFileChange] = useState(false);
  const handleSendFileShow = (status) => {
    setSendToFileStatus(status);
    setShowSendFileChange(true);
  };
  const handleSendFileClose = () => setShowSendFileChange(false);

  const [speakerModalColumns, setSpeakerModalColumns] = useState({
    "N° de SIRET": true,
    Intervenant: true,
    "Dernière MaJ": true,
    "Doc. associés": true,
    "Doc. Manquants": true,
    Actions: true,
  });

  const [selectedSpeakerColumns, setSelectedSpeakerColumns] = useState(
    Object.keys(speakerModalColumns).filter((key) => speakerModalColumns[key])
  );

  const [otherDocModalColumns, setOtherDocModalColumns] = useState({
    fileNameLabe: true,
    speakerLabel: true,
    "Type de document": true,
    status: true,
    Actions: true,
  });

  const [selectedOtherDocColumns, setSelectedOtherDocColumns] = useState(
    Object.keys(otherDocModalColumns).filter((key) => otherDocModalColumns[key])
  );

  const [showMissingDoc, setShowMissingDoc] = useState(false);
  const handleMissingDocShow = () => setShowMissingDoc(true);
  const handleMissingDocClose = () => {
    setShowMissingDoc(false);
    setFileList([]);
  };

  const [showAddSpeakerCol, setShowAddSpeakerCol] = useState(false);
  const handleAddSpeakerColClose = () => setShowAddSpeakerCol(false);
  const handleAddSpeakerColShow = () => setShowAddSpeakerCol(true);

  const [showAddOtherCol, setShowAddOtherCol] = useState(false);
  const handleAddOtherColClose = () => setShowAddOtherCol(false);
  const handleAddOtherColShow = () => setShowAddOtherCol(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const [showDeleteSpeakerModal, setShowDeleteSpeakerModal] = useState(false);
  const handleShowDeleteSpeakerModal = () => setShowDeleteSpeakerModal(true);
  const handleCloseDeleteSpeakerModal = () => setShowDeleteSpeakerModal(false);

  const [showViewSpeaker, setShowViewSpeaker] = useState(false);

  const [showmodal, setShowmodal] = useState(false);
  const handleModalShow = () => setShowmodal(true);
  const handleModalClose = () => setShowmodal(false);

  const [documentUploading, setDocumentUploading] = useState(false);

  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setDocumentUploading(false);
    setFileList([]);
    if (activeTab === "dashboard") {
      DashboardRegisteredDocument(id);
      DashboardSpeakerRegisteredDocument(id);
      EventUserList(id);
      DashboardLastFiveEvent(id);
      DashboardLastThreeNote(id);
      TaskList(search, sort, currentPage, taskStatus, taskPriority);
    }
    if (activeTab === "contactinfo") {
      ShowUserDocumentData(id);
      BrokerList();
    }
    if (activeTab === "speakerdocument") {
      SpeakerList(id, sort, search, currentPage);
    }
    if (activeTab === "otherdocument") {
      if (activeDocumentTab === "missingdocument") {
        GetMissingDocumentList(id, sort, currentPage);
      } else {
        ShowOtherDocument(id, sort, currentPage, editUserStatus, selectDocumentType);
        SpeakerDropDownList("", 1);
        DocumentTypeList();
      }
    }
    if (activeTab === "history") {
      GetHistoryListDocument(id, sort, search, currentPage, selectActionType);
    }
  };

  const [showReplace, setShowReplace] = useState(false);
  const handleReplaceShow = () => setShowReplace(true);
  const handleReplaceClose = () => {
    setFileList([]);
    setShowReplace(false);
  };

  const [showView, setShowView] = useState(false);
  const handleViewClose = () => setShowView(false);
  const handleViewShow = () => setShowView(true);

  const [invalidReasonList, setInvalidReasonList] = useState([]);
  const [invalidResonModal, setInvalidReasonModal] = useState(false);
  const handleInvalidReasonModalOpen = () => setInvalidReasonModal(true);
  const handleInvalidReasonModalClose = () => setInvalidReasonModal(false);

  const [contractNo, setContractNo] = useState("");

  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [selectedAddNoteDocId, setSelectedAddNoteDocId] = useState(null);
  const [selectedAddNoteDocName, setSelectedAddNoteDocName] = useState("");

  const [showNote, setShowNote] = useState(false);
  const handleNoteShow = () => setShowNote(true);
  const handleNoteClose = () => setShowNote(false);

  // File Dashboard
  const [dashboardDocumentFileList, setDashboardDocumentFileList] = useState([]);
  const [speakerDocumentFileList, setSpeakerDocumentFileList] = useState(null);
  const [lastFiveEventList, setLastFiveEventList] = useState([]);
  const [lastThreeNoteList, setLastThreeNoteList] = useState([]);
  const [eventHistoryUserList, setEventHistoryUserList] = useState([]);

  const [taskListData, setTaskListData] = useState([]);
  const [taskStatus, setTaskStatus] = useState("");
  const [taskPriority, setTaskPriority] = useState("");
  const [currentTaskPage, setCurrentTaskPage] = useState(1);
  const [totalTaskPages, setTotalTaskPages] = useState(1);
  const [totalTaskRecords, setTotalTaskRecords] = useState(0);

  const [fileType, setFileType] = useState("");
  const [exportDocumentOpen, setExportDocumentOpen] = useState(false);
  const handleExportDocumentShow = (type) => {
    if (type) {
      setFileType(type);
      setExportDocumentOpen(true);
    }
  };
  const handleExportDocumentClose = () => setExportDocumentOpen(false);

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
        setShow(false);
        handleMissingDocClose();
        handleReplaceClose();
        clearTimeout(timer);
      };
    }
  }, [flashMessage, flashMessageStoreDoc]);

  useEffect(() => {
    const userRole = JSON.parse(localStorage.getItem("userRole"));
    const token = localStorage.getItem("authToken");
    if (token && userRole.includes("Assureur")) {
      const logo_image = JSON.parse(localStorage.getItem("logo_image"));
      const right_panel_color = JSON.parse(localStorage.getItem("right_panel_color"));
      setRightPanelThemeColor(right_panel_color);
      setLogoImageShow(logo_image);
      ShowUserDocumentData(id);
    } else {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    if (activeTab === "dashboard") {
      DashboardRegisteredDocument(id);
      DashboardSpeakerRegisteredDocument(id);
      EventUserList(id);
      DashboardLastFiveEvent(id);
      DashboardLastThreeNote(id);
      TaskList(search, sort, currentPage, taskStatus, taskPriority);
    }
    if (activeTab === "contactinfo") {
      ShowUserDocumentData(id);
      BrokerList();
    }
    if (activeTab === "otherdocument") {
      if (activeDocumentTab === "missingdocument") {
        GetMissingDocumentList(id, sort, 1);
      } else {
        ShowOtherDocument(id, sort, 1, editUserStatus, selectDocumentType);
        SpeakerDropDownList("", 1);
        DocumentTypeList();
      }
    }
    if (activeTab === "speakerdocument") {
      SpeakerList(id, sort, search, 1);
    }
    if (activeTab === "history") {
      GetHistoryListDocument(id, sort, search, currentPage, selectActionType);
    }
  }, [activeTab, activeDocumentTab, sort, selectedType, selectedDate, selectedUser]);

  useEffect(() => {
    if (showViewSpeaker && activeTab === "speakerdocument") {
      if (activeSubTab === "documents") {
        ShowSpeakerDocument(id, sort, search, currentPage, editUserStatus, selectDocumentType, showSpeakerId);
      }
      if (activeSubTab === "documentType") {
        SpeakerDocumentTypeList(id, showSpeakerId);
      }
    }
  }, [activeTab, showViewSpeaker, activeSubTab]);

  const [showCheck, setShowCheck] = useState(false);
  const handleCheckShow = () => {
    setShowCheck(true);
    DocumentTypeList();
  };

  const handleCheckClose = () => {
    setShowCheck(false);
    setActiveTab(activeTab);
    setShowDocumentId("");
    setEditUserStatus("");
    setSelectDocumentType("");
    setCurrentFileIndex(0);
    setFileList([]);
    if (activeTab === "dashboard") {
      DashboardRegisteredDocument(id);
      DashboardSpeakerRegisteredDocument(id);
      EventUserList(id);
      DashboardLastFiveEvent(id);
      DashboardLastThreeNote(id);
      TaskList(search, sort, currentPage, taskStatus, taskPriority);
    }
    if (activeTab === "contactinfo") {
      ShowUserDocumentData(id);
      BrokerList();
    }
    if (activeTab === "speakerdocument") {
      SpeakerList(id, sort, search, currentPage);
    }
    if (activeTab === "otherdocument") {
      if (activeDocumentTab === "missingdocument") {
        GetMissingDocumentList(id, sort, currentPage);
      } else {
        ShowOtherDocument(id, sort, currentPage, "", "");
        SpeakerDropDownList("", 1);
        DocumentTypeList();
      }
    }
    if (activeTab === "history") {
      GetHistoryListDocument(id, sort, search, currentPage, selectActionType);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (activeTab === "dashboard") {
      TaskList(search, sort, page, taskStatus, taskPriority);
    }
    if (activeTab === "otherdocument") {
      if (activeDocumentTab === "missingdocument") { 
        GetMissingDocumentList(id, sort, page);
      } else {
        ShowOtherDocument(id, sort, page, editUserStatus, selectDocumentType);
        SpeakerDropDownList("", 1);
        DocumentTypeList();
      }
    }
    if (activeTab === "speakerdocument") {
      SpeakerList(id, sort, search, page);
    }
    if (activeTab === "history") {
      GetHistoryListDocument(id, sort, search, page, selectActionType);
    }
  };

  const handlePageChangeView = (page) => {
    setCurrentPage(page);
    if (activeSubTab === "documents") {
      ShowSpeakerDocument(
        id,
        sort,
        search,
        page,
        editUserStatus,
        selectDocumentType,
        showSpeakerId
      );
    }
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

  const handleBrokerChange = (e) => {
    setSelectBroker(e.target.value);
  };

  const ShowUserDocumentData = async (id) => {
    setIsLoading(true);
    try {
      const response = await FilePageService.show_user_document(id);
      if (response.data.status) {
        setIsLoading(false);
        const fileDataChanges = response.data.documents.user_document_files.map(
          (file) => ({
            id: file.id,
            status: file.status,
            filename: file.filename,
            doc_type_id: file.docType?.id,
          })
        );

        setContractNo(response.data.documents.contract_no);
        setShowUserDocumentData(response.data.documents);
        setStartDate(response.data.documents.final_start_date);
        setEndDate(response.data.documents.final_completion_date);
        setPolicyholderName(
          response.data.documents.insurance_policyholder_name
        );
        setEstimatedSiteCost(response.data.documents.estimated_site_cost);
        setFinaldSiteCost(response.data.documents.final_site_cost);
        if (
          response.data.documents.status == "transfer_to_manager" ||
          response.data.documents.status == "transfer_to_broker" ||
          response.data.documents.status == "formal_notice"
        ) {
          setSendToFileStatus(response.data.documents.status);
        } else {
          setSendToFileStatus("");
        }
        setEstimatedStartDate(response.data.documents.estimated_start_date);
        setEstimatedCompletionDate(
          response.data.documents.estimated_completion_date
        );
        setShowUserFolderName(response.data.documents.folder_name);
        setSelectBroker(response.data.documents?.broker?.id);
        setTotalRecordOther(
          response.data.documents.user_document_files?.length
        );
        setTotalMissingRecords(response.data.documents.total_missing_doc);
        setShowUserDocumentFileData(
          response.data.documents.user_document_files
        );
        setTotalSpeaker(response.data.documents.total_speakers);
        setUserDocumentFileDataChanges(fileDataChanges);
        setShowDocumentId(fileDataChanges[0].id);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const ShowOtherDocument = async (
    id,
    sort,
    page = 1,
    status,
    type,
    speaker_id
  ) => {
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
      const response = await FilePageService.show_other_document(id, userData);
      if (response.data.status) {
        setIsLoading(false);
        setShowOtherDocument(response.data.other_documents.data);
        setCurrentPage(response.data.other_documents.meta.current_page);
        setTotalPages(response.data.other_documents.meta.last_page);
        setTotalRecordOther(response.data.other_documents.meta.total);
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
    try {
      var userData = {
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

      const response = await FilePageService.speaker_document(id, userData);

      if (response.data.status) {
        setIsLoading(false);
        const documents = response.data.speaker_documents.data;
        setShowSpeakerDocument(documents);
        setCurrentPage(response.data.speaker_documents.meta.current_page);
        setTotalPages(response.data.speaker_documents.meta.last_page);
        setTotalSpeakerDocument(response.data.speaker_documents.meta.total);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const SpeakerList = async (id, sort, search, page = 1) => {
    setIsLoading(true);
    try {
      var userData = {
        search,
        sort: {
          key: sort.key,
          value: sort.value,
        },
        page,
      };

      const response = await AcsManagerFileService.speakerList(id, userData);

      if (response.data.status) {
        setIsLoading(false);
        setSpeakerList(response.data.speakers.data);
        setCurrentPage(response.data.speakers.meta.current_page);
        setTotalPages(response.data.speakers.meta.last_page);
        setTotalSpeaker(response.data.speakers.meta.total);
      } else {
        setIsLoading(false);
        console.log(response.data.message);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
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
        message: t("somethingWentWrong"),
      });
    }
  };

  const SpeakerDetail = async (showSpeakerId) => {
    setIsLoading(true);
    setIsSpeakerLoading(true);
    try {
      const response = await AcsManagerFileService.speakerdetail(showSpeakerId);
      if (response.data.status) {
        setIsLoading(false);
        setIsSpeakerLoading(false);
        setSpeakerDetail(response.data);
      } else {
        setIsLoading(false);
        setIsSpeakerLoading(false);
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setIsSpeakerLoading(false);
      setIsLoading(false);
      setFlashMessage({
        type: "error",
        message: t("somethingWentWrong"),
      });
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
      console.log(error);
    }
  };

  const HandleDeleteDocumentFile = async (e) => {
    e.preventDefault();
    try {
      const response = await FilePageService.delete_document_file(
        showDocumentId
      );
      if (response.data.status) {
        handleCloseDeleteModal();
        ShowUserDocumentData(id);
        if (activeTab === "speakerdocument") {
          if (activeSubTab === "documents") {
            ShowSpeakerDocument(
              id,
              sort,
              search,
              1,
              editUserStatus,
              selectDocumentType,
              showSpeakerId
            );
          }
        }
        if (activeTab === "otherdocument") {
          if (activeDocumentTab === "missingdocument") {
            GetMissingDocumentList(id, sort, 1);
          } else {
            ShowOtherDocument(id, sort, 1, editUserStatus, selectDocumentType);
            SpeakerDropDownList("", 1);
            DocumentTypeList();
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const HandleDeleteSpeaker = async () => {
    try {
      const response = await AcsManagerFileService.delete_speaker(
        id,
        showSpeakerId
      );
      if (response.data.status) {
        handleCloseDeleteSpeakerModal();
        ShowUserDocumentData(id);
        setActiveTab(activeTab);
        SpeakerList(id, sort, search, 1);
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  const GetMissingDocumentList = async (id, sort, page = 1) => {
    setIsLoading(true);
    try {
      var userData = {
        sort: sort,
        page,
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

  const formatDate = (dateString) => {
    if (dateString) {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else {
      return "";
    }
  };

  const getFormattedDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(`${month}/${day}/${year}`);
  };

  const UpdateFolderInfo = async (e) => {
    e.preventDefault();

    var folderData = {
      folder_name: showUserFolderName || "",
      final_start_date: startDate ? startDate : "",
      final_completion_date: endDate ? endDate : "",
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

  const ValidateDocumentFile = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    try {
      var validateDocumentFileData = {
        files: userDocumentFileDataChanges,
      };
      const response = await FilePageService.validate_document_files(
        id,
        validateDocumentFileData
      );
      if (response.data.status) {
        setIsLoading(false);
        ShowUserDocumentData(id);
        setShowCheck(false);
        setActiveTab(activeTab);
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

  const HandleAddDocument = async (e) => {
    e.preventDefault();

    setDocumentUploading(true);
    if (fileList.length === 0) {
      handleClose();
      return;
    }

    try {
      const formData = new FormData();
      const filterDocType = documentTypeList?.find(
        (doctype) => doctype.name === "Police"
      );

      fileList.forEach((file, index) => {
        formData.append(`documents[${index}][file]`, file);
        formData.append(`documents[${index}][filename]`, file.name);
        formData.append(
          `documents[${index}][doc_type_id]`,
          filterDocType?.id || "1"
        );
      });

      const response = await FilePageService.add_document_files(id, formData);

      if (response.data.status) {
        setFileList([]);
        ShowUserDocumentData(id);
        if (activeTab === "dashboard") {
          DashboardRegisteredDocument(id);
          DashboardSpeakerRegisteredDocument(id);
          EventUserList(id);
          DashboardLastFiveEvent(id);
          DashboardLastThreeNote(id);
          TaskList(search, sort, currentPage, taskStatus, taskPriority);
        }
        if (activeTab === "contactinfo") {
          ShowUserDocumentData(id);
          BrokerList();
        }
        if (activeTab === "otherdocument") {
          if (activeDocumentTab === "missingdocument") {
            GetMissingDocumentList(id, sort, 1);
          } else {
            ShowOtherDocument(id, sort, 1, editUserStatus, selectDocumentType);
            SpeakerDropDownList("", 1);
            DocumentTypeList();
          }
        }
        if (activeTab === "speakerdocument") {
          SpeakerList(id, sort, search, 1);
        }
        if (activeTab === "history") {
          GetHistoryListDocument(id, sort, search, currentPage, selectActionType);
        }

        handleClose();
        setFlashMessage({
          type: "success",
          message: response.data.message || t("somethingWentWrong"),
        });
      } else {
        setDocumentUploading(false);
        setFlashMessage({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setDocumentUploading(false);
      console.error(error);
      setFlashMessage({
        type: "error",
        message: t("somethingWentWrong"),
      });
    }
  };

  const AddMissingDocument = async (e) => {
    e.preventDefault();
    setDocumentUploading(true);

    try {
      const formData = new FormData();
      formData.append("speaker_id", showSpeakerId);
      formData.append("missing_document_id", missingDocumentId);
      fileList.forEach((file) => {
        console.log(file, file instanceof File);
        formData.append("documents[]", file); // must be File
      });

      const response = await FilePageService.add_missing_document(id, formData); // no headers

      if (response.data.status) {
        setFileList([]);
        ShowUserDocumentData(id);
        GetMissingDocumentList(id, sort, currentPage);
        setDocumentUploading(false);
        setFlashMessageStoreDoc({
          type: "success",
          message: response.data.message,
        });
      } else {
        setDocumentUploading(false);
        setFlashMessageStoreDoc({
          type: "error",
          message: response.data.message,
        });
      }
    } catch (error) {
      setDocumentUploading(false);
      setFlashMessageStoreDoc({
        type: "error",
        message: "Something went wrong.",
      });
    }
  };

  const HandleUpdateDocument = async (e) => {
    e.preventDefault();
    setDocumentUploading(true);

    try {
      if (fileList.length === 0) return;

      const formData = new FormData();

      // Use same key names: `filename` and `file`
      formData.append("filename", fileList[0].name); // plain text name
      formData.append("file", fileList[0]); // actual binary file

      const response = await FilePageService.update_document_files(
        showDocumentId,
        formData
      );

      if (response.data.status) {
        setDocumentUploading(false);
        setFileList([]);
        setShowDocumentName(fileList[0].name);
        ShowUserDocumentData(id);
        setFlashMessageStoreDoc({
          type: "success",
          message: response.data.message || t("somethingWentWrong"),
        });

        if (activeTab === "otherdocument") {
          if (activeDocumentTab === "missingdocument") { 
            GetMissingDocumentList(id, sort, currentPage);
          } else {
            ShowOtherDocument(id, sort, currentPage, editUserStatus, selectDocumentType);
            SpeakerDropDownList("", 1);
            DocumentTypeList();
          }
        }
        if (activeTab === "speakerdocument") {
          if (activeSubTab === "documentType") {
            SpeakerDocumentTypeList(id, showSpeakerId);
          }
        }
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
        if (activeTab === "dashboard") {
          DashboardRegisteredDocument(id);
          DashboardSpeakerRegisteredDocument(id);
          EventUserList(id);
          DashboardLastFiveEvent(id);
          DashboardLastThreeNote(id);
          TaskList(search, sort, currentPage, taskStatus, taskPriority);
        }
        if (activeTab === "contactinfo") {
          ShowUserDocumentData(id);
          BrokerList();
        }
        if (activeTab === "otherdocument") {
          if (activeDocumentTab === "missingdocument") {
            GetMissingDocumentList(id, sort, 1);
          } else {
            ShowOtherDocument(id, sort, 1, editUserStatus, selectDocumentType);
            SpeakerDropDownList("", 1);
            DocumentTypeList();
          }
        }
        if (activeTab === "speakerdocument") {
          SpeakerList(id, sort, search, 1);
        }
        if (activeTab === "history") {
          GetHistoryListDocument(id, sort, search, currentPage, selectActionType);
        }
      }
    } catch (error) {
      console.log(error);
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

  const handleFileChange = (e) => {
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

      newFiles.push(file);
    }

    if (newFiles.length > 0) {
      setFileList((prevFiles) => [...prevFiles, ...newFiles]);
    }

    e.target.value = ""; // Reset the file input
  };

  const handleUpdateFileChange = (event) => {
    const files = Array.from(event.target.files);

    const validFiles = [];

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

      validFiles.push(file); // store native File directly
    }

    if (validFiles.length > 0) {
      setFileList((prevFiles) => [...prevFiles, ...validFiles]);
    }

    event.target.value = ""; // reset input
  };

  const handleRemoveFile = (index) => {
    setFileList((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSelect = (key) => {
    setHistory((prevHistory) => [
      ...prevHistory,
      { activeTab, activeDocumentTab, activeSubTab }
    ]);
    setSearch("");
    setActiveTab(key);
  };

  const handleSelectDocument = (key) => {
    setHistory((prevHistory) => [
      ...prevHistory,
      { activeTab, activeDocumentTab, activeSubTab },
    ]);
    setActiveDocumentTab(key);
  };

  const handleSubTabSelect = (key) => {
    setHistory((prevHistory) => [
      ...prevHistory,
      { activeTab, activeDocumentTab, activeSubTab },
    ]);
    setActiveSubTab(key);
  };

  const safeHistoryEntry = (entry) => {
    if (!entry) {
      return {
        activeTab: null,
        activeDocumentTab: null,
        activeSubTab: null,
      };
    }

    if (typeof entry === "string") {
      return {
        activeTab: entry,
        activeDocumentTab: null,
        activeSubTab: null,
      };
    }

    return {
      activeTab: entry.activeTab || null,
      activeDocumentTab: entry.activeDocumentTab || null,
      activeSubTab: entry.activeSubTab || null,
    };
  };

  const handleBack = () => {
    setHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      const rawEntry = newHistory.pop();
      const previousTab = safeHistoryEntry(rawEntry);

      const hasValidTab =
        previousTab.activeTab ||
        previousTab.activeDocumentTab ||
        previousTab.activeSubTab;

      if (hasValidTab) {
        if (previousTab.activeTab) setActiveTab(previousTab.activeTab);
        if (previousTab.activeDocumentTab)
          setActiveDocumentTab(previousTab.activeDocumentTab);
        if (previousTab.activeSubTab) setActiveSubTab(previousTab.activeSubTab);
        return newHistory;
      } else {
        navigate("/insurers-file");
        return [];
      }
    });
  };

  const handleStatusChange = (status) => {
    if (status === "invalid") {
      handleModalShow();
    }
    setEditUserStatus(status);
    if (!showCheck) {
      ShowOtherDocument(id, sort, 1, status, selectDocumentType);
      SpeakerList(id, sort, search, currentPage);
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

  const handleTableSpeakerChange = (e) => {
    const selectedValue = e.target.value;
    setSelectSpeakerId(selectedValue);
    ShowOtherDocument(
      id,
      sort,
      currentPage,
      editUserStatus,
      selectDocumentType,
      selectedValue
    );
  };

  const handleDocumentTypeChange = (e) => {
    const selectedValue = e.target.value;
    const selectedDocument = documentTypeList.find(
      (doctype) => doctype.id == selectedValue
    );
    setSelectDocumentType(selectedDocument?.id || "");
    if (!showCheck) {
      ShowOtherDocument(
        id,
        sort,
        currentPage,
        editUserStatus,
        selectedDocument?.id
      );
      SpeakerList(id, sort, search, currentPage);
    }

    setUserDocumentFileDataChanges((prevData) => {
      return prevData?.map((file) => {
        if (file.id == selectDocumentId) {
          return { ...file, doc_type_id: selectedDocument?.id };
        }
        return file;
      });
    });
  };

  const handleActionTypeChange = (e) => {
    const selectedValue = e.target.value;
    setSelectActionType(selectedValue);
    GetHistoryListDocument(id, sort, search, currentPage, selectedValue);
  };

  useEffect(() => {
    if (showCheck && !showDeleteModal) {
      handleDocChange();
    }
  }, [showCheck, showDeleteModal]);

  const handleDocChange = (e) => {
    if (e === undefined) {
      setSelectDocumentId(userDocumentFileDataChanges[0]?.id);
      setShowDocumentId(userDocumentFileDataChanges[0]?.id);
      setSelectDocumentFileName(showUserDocumentFileData?.[0]?.filename);
      setEditUserStatus(userDocumentFileDataChanges[0]?.status);
      setSelectDocumentType(userDocumentFileDataChanges[0]?.doc_type_id);

      setUserDocumentFileDataChanges((prevData) => {
        return prevData.map((file) => {
          if (file.id == userDocumentFileDataChanges[0]?.id) {
            return {
              ...file,
              id: userDocumentFileDataChanges[0]?.id,
              status: userDocumentFileDataChanges[0]?.status,
              doc_type_id: userDocumentFileDataChanges[0]?.doc_type_id,
            };
          }
          return file;
        });
      });
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

      setUserDocumentFileDataChanges((prevData) => {
        return prevData.map((file) => {
          if (file.id == e.target.value) {
            return {
              ...file,
              id: parseInt(e.target.value),
              status: selectedDoc?.status,
              doc_type_id: selectedDoc?.doc_type_id,
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
        setFlashMessage({
          type: "error",
          message: t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setFlashMessage({
        type: "error",
        message: t("somethingWentWrong"),
      });
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

      setUserDocumentFileDataChanges((prevData) =>
        prevData.map((file) => {
          if (file.id == doc.id) {
            return {
              ...file,
              id: doc.id,
              status: doc.status,
              doc_type_id: doc.doc_type_id,
            };
          }
          return file;
        })
      );
    }
  };

  const handleSearchChange = (search, page) => {
    setSearch(search);
    if (activeTab === "speakerdocument") {
      SpeakerList(id, sort, search, page);
    } else if (activeTab === "history") {
      GetHistoryListDocument(id, sort, search, page, selectActionType);
    } else {
      return;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchChange(search, 1);
    }
  };

  const handleScrollInvalid = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setRecordsToShow((prev) => Math.min(prev + 2, invalidReasonList.length));
    }
  };

  const handleScrollNote = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setRecordsToShowNote((prev) =>
        Math.min(prev + 3, invalidReasonNoteList.length)
      );
    }
  };

  // const displayedRecords = historyDocumentList.slice(0, recordsToShow);
  const displayedRecordsNoteInvalid = invalidReasonList.slice(0, recordsToShow);
  const displayedRecordsNote = invalidReasonNoteList.slice(
    0,
    recordsToShowNOte
  );

  const handleSpeakerCheckboxChange = (key) => {
    setSpeakerModalColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddSpeakerColSubmit = () => {
    const newSelectedColumns = Object.keys(speakerModalColumns).filter(
      (key) => speakerModalColumns[key]
    );
    setSelectedSpeakerColumns(newSelectedColumns);
    handleAddSpeakerColClose(); // Close the modal
  };

  const handleOtherCheckboxChange = (key) => {
    setOtherDocModalColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddOtherColSubmit = () => {
    const newSelectedColumns = Object.keys(otherDocModalColumns).filter(
      (key) => otherDocModalColumns[key]
    );
    setSelectedOtherDocColumns(newSelectedColumns);
    handleAddOtherColClose(); // Close the modal
  };

  const handleClickRotate = (column) => {
    const direction =
      sort.key === column ? (sort.value === "desc" ? "asc" : "desc") : "asc";
    setSort({ key: column, value: direction });
    setIsRotated(!isRotated); // Toggle the class on click
  };

  const handleInvalidReason = async (id) => {
    try {
      const response = await FilePageService.invalidreson(id);
      if (response.data.status) {
        setIsLoading(false);
        setInvalidReasonList(response.data.data);
        handleInvalidReasonModalOpen();
      } else {
        setIsLoading(false);
        console.log(response.data.message);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const docs = [
    {
      uri: `${process.env.REACT_APP_API}/file/${showUserFolderName}/${selectDocumentFileName}`,
    },
  ];

  const HandleDownloadFile = (data) => {
    const filePath = data.filepath;
    const fileName = data.filename;
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
    setViewRowData(data);
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

  const handleChange = (e) => {
    const value = e.target.value;
    setContractNo(value);
  };

  const handleAddNoteModalOpen = (docId, docName) => {
    if (docId && docName) {
      setSelectedAddNoteDocId(docId);
      setSelectedAddNoteDocName(docName);
      setShowAddNoteModal(true);
    } else {
      setSelectedAddNoteDocId(null);
      setSelectedAddNoteDocName("");
      setShowAddNoteModal(true);
    }
  };

  const handleAddNoteModalClose = () => {
    setShowAddNoteModal(false);
  };

  const handleAddNoteModalCloseAfterAPICall = () => {
    setShowAddNoteModal(false);
    if (activeTab === "dashboard") {
      DashboardRegisteredDocument(id);
      DashboardSpeakerRegisteredDocument(id);
      EventUserList(id);
      DashboardLastFiveEvent(id);
      DashboardLastThreeNote(id);
      TaskList(search, sort, currentPage, taskStatus, taskPriority);
    }
    if (activeTab === "contactinfo") {
      ShowUserDocumentData(id);
      BrokerList();
    }
    if (activeTab === "otherdocument") {
      if (activeDocumentTab === "missingdocument") {
        GetMissingDocumentList(id, sort, 1);
      } else {
        ShowOtherDocument(id, sort, 1, editUserStatus, selectDocumentType);
        SpeakerDropDownList("", 1);
        DocumentTypeList();
      }
    }
    if (activeTab === "speakerdocument") {
      SpeakerList(id, sort, search, 1);
    }
    if (activeTab === "history") {
      GetHistoryListDocument(id, sort, search, currentPage, selectActionType);
    }
  };

  const NotesOptions = [
    { value: "", label: "Toutes les notes" },
    { value: "1", label: "Importante" },
    { value: "0", label: "Général" },
  ];

  const handleNoteAddOrShow = (seletedValue) => {
    if (seletedValue == "add_note") {
      handleAddNoteModalOpen();
    } else if (seletedValue == "view_note") {
      handleNoteShow();
    } else {
      return;
    }
  };

  const DashboardRegisteredDocument = async (id) => {
    try {
      const response =
        await DashboardManagementService.dashboard_registered_document_file(id);

      if (response.data.status) {
        setDashboardDocumentFileList(response.data.blocks);
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

  const DashboardSpeakerRegisteredDocument = async (id) => {
    try {
      const response =
        await DashboardManagementService.speaker_registered_document_file(id);

      if (response.data.status) {
        setSpeakerDocumentFileList(response.data.overall_statistics);
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

  const DashboardLastFiveEvent = async (id) => {
    try {
      var userData = {
        user_id: selectedUser,
        action_type: selectedType,
        date: selectedDate
      };

      const response =
        await DashboardManagementService.dashboard_last_five_event(
          id,
          userData
        );

      if (response.data.status) {
        setLastFiveEventList(response.data.data);
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

  const DashboardLastThreeNote = async (id) => {
    try {
      const response = await DashboardManagementService.dashboard_last_three_note(id);

      if (response.data.status) {
        setLastThreeNoteList(response.data.data);
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

  const EventUserList = async (id) => {
    setIsLoading(true);
    try {
      const response = await DashboardManagementService.event_history_users(id);

      if (response.data.status) {
        setIsLoading(false);
        setEventHistoryUserList(response.data.user.data);
      }
    } catch (error) {
      setIsLoading(false);
      setFlashMessage({
        type: "error",
        message: t("somethingWentWrong"),
      });
    }
  };

  const formatCreatedAt = (dateStr) => {
    try {
      const parsedDate = parse(dateStr, "dd/MM/yyyy", new Date());
      return format(parsedDate, "MMMM do, hh:mm a");
    } catch (e) {
      return dateStr;
    }
  };

  const ExportDocumentFile = async (
    id,
    format = "pdf",
    onFinish = () => { }
  ) => {
    try {
      const response = await DashboardManagementService.export_folder(
        id,
        format
      );
      const blob = response.data;

      const extension = format === "pdf" ? "pdf" : "xlsx";
      const filename = `${showUserFolderName}.${extension}`;

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      onFinish();
    } catch (error) {
      console.error("Export failed", error);
      setFlashMessage({
        type: "error",
        message: t("somethingWentWrong"),
      });
    }
  };

  const TaskList = async (search, sort, page = 1, status, priority) => {
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
        priority: priority ?? ""
      };

      const response = await TaskManagementService.task_index(userData);

      if (response.data.status) {
        setIsLoading(false);
        setTaskListData(response.data.task.data);
        setCurrentTaskPage(response.data.task.meta.current_page);
        setTotalTaskPages(response.data.task.meta.last_page);
        setTotalTaskRecords(response.data.task.meta.total);
      }
    } catch (error) {
      setIsLoading(false);
      setFlashMessage({
        type: "error",
        message: t("somethingWentWrong"),
      });
    }
  };

  return (
    <Fragment>
      <style>
        {" "}
        {` button.btn.btn-primary  { background-color: ${localStorage.getItem("button_color")
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
        className="dashboard-main-content insurers-dashboard"
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
              <span>Dossiers &nbsp; / </span>Dossier{" "}
              {showUserDocumentData?.folder_name}{" "}
            </h4>
          </div>

          <div className="mt-3 d-md-flex justify-content-between align-items-center">
            <h1 className="m-0 mb-md-0 mb-3">
              Dossier {showUserDocumentData?.folder_name}
            </h1>
          </div>

          <div className="detail-header new-update-header">
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="left-part">
                <div className="d-flex gap-2 align-items-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 7H13V9H11V7ZM11 11H13V17H11V11ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                      fill="#00366B"
                    />
                  </svg>
                  <span>Dossier à vérifier</span>
                </div>

              </div>
              <div className="right-part">
                <div className="my-1 my-md-0">
                  <Link
                    onClick={toggleDetail}
                    className="fold-unfold-link link-wrap"
                  >
                    {isVisible ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="50"
                        height="50"
                        viewBox="0 0 50 50"
                        fill="none"
                      >
                        <path
                          d="M25.0007 2.08325C20.4682 2.08325 16.0375 3.42729 12.2688 5.94541C8.50022 8.46352 5.56293 12.0426 3.82842 16.2301C2.09391 20.4176 1.64009 25.0253 2.52433 29.4707C3.40858 33.9161 5.59118 37.9995 8.79613 41.2044C12.0011 44.4094 16.0844 46.592 20.5298 47.4762C24.9752 48.3605 29.583 47.9067 33.7705 46.1722C37.958 44.4376 41.5371 41.5004 44.0552 37.7317C46.5733 33.9631 47.9173 29.5324 47.9173 24.9999C47.9102 18.9242 45.4934 13.0995 41.1973 8.8033C36.9011 4.50715 31.0763 2.09042 25.0007 2.08325ZM25.0007 43.7499C21.2923 43.7499 17.6671 42.6502 14.5837 40.59C11.5003 38.5297 9.09706 35.6013 7.67792 32.1752C6.25878 28.7491 5.88746 24.9791 6.61094 21.342C7.33441 17.7048 9.12017 14.3639 11.7424 11.7417C14.3646 9.11943 17.7056 7.33367 21.3427 6.61019C24.9799 5.88672 28.7499 6.25803 32.176 7.67718C35.6021 9.09632 38.5304 11.4996 40.5907 14.583C42.651 17.6664 43.7507 21.2915 43.7507 24.9999C43.7452 29.971 41.7679 34.737 38.2528 38.2521C34.7377 41.7672 29.9718 43.7444 25.0007 43.7499Z"
                          fill="#464255"
                        ></path>
                        <path
                          d="M33.334 22.9167H16.6673C16.1148 22.9167 15.5849 23.1362 15.1942 23.5269C14.8035 23.9176 14.584 24.4476 14.584 25.0001C14.584 25.5526 14.8035 26.0825 15.1942 26.4732C15.5849 26.8639 16.1148 27.0834 16.6673 27.0834H33.334C33.8865 27.0834 34.4164 26.8639 34.8071 26.4732C35.1978 26.0825 35.4173 25.5526 35.4173 25.0001C35.4173 24.4476 35.1978 23.9176 34.8071 23.5269C34.4164 23.1362 33.8865 22.9167 33.334 22.9167Z"
                          fill="#464255"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="50"
                        height="50"
                        viewBox="0 0 50 50"
                        fill="none"
                      >
                        <path
                          d="M25.0007 2.0835C20.4682 2.0835 16.0375 3.42753 12.2688 5.94565C8.50022 8.46377 5.56293 12.0429 3.82842 16.2303C2.09391 20.4178 1.64009 25.0256 2.52433 29.471C3.40858 33.9164 5.59118 37.9997 8.79613 41.2047C12.0011 44.4096 16.0844 46.5922 20.5298 47.4765C24.9752 48.3607 29.583 47.9069 33.7705 46.1724C37.958 44.4379 41.5371 41.5006 44.0552 37.732C46.5733 33.9634 47.9173 29.5326 47.9173 25.0002C47.9102 18.9245 45.4934 13.0997 41.1973 8.80355C36.9011 4.50739 31.0763 2.09066 25.0007 2.0835ZM25.0007 43.7502C21.2923 43.7502 17.6671 42.6505 14.5837 40.5902C11.5003 38.5299 9.09706 35.6016 7.67792 32.1755C6.25878 28.7494 5.88746 24.9794 6.61094 21.3422C7.33441 17.7051 9.12017 14.3641 11.7424 11.7419C14.3646 9.11968 17.7056 7.33391 21.3427 6.61044C24.9799 5.88697 28.7499 6.25828 32.176 7.67742C35.6021 9.09656 38.5304 11.4998 40.5907 14.5832C42.651 17.6666 43.7507 21.2918 43.7507 25.0002C43.7446 29.9711 41.7672 34.7367 38.2522 38.2517C34.7372 41.7667 29.9716 43.7441 25.0007 43.7502Z"
                          fill="#464255"
                        ></path>
                        <path
                          d="M33.334 22.9168H27.084V16.6668C27.084 16.1143 26.8645 15.5844 26.4738 15.1937C26.0831 14.803 25.5532 14.5835 25.0007 14.5835C24.4481 14.5835 23.9182 14.803 23.5275 15.1937C23.1368 15.5844 22.9173 16.1143 22.9173 16.6668V22.9168H16.6673C16.1148 22.9168 15.5849 23.1363 15.1942 23.527C14.8035 23.9177 14.584 24.4476 14.584 25.0002C14.584 25.5527 14.8035 26.0826 15.1942 26.4733C15.5849 26.864 16.1148 27.0835 16.6673 27.0835H22.9173V33.3335C22.9173 33.886 23.1368 34.4159 23.5275 34.8066C23.9182 35.1973 24.4481 35.4168 25.0007 35.4168C25.5532 35.4168 26.0831 35.1973 26.4738 34.8066C26.8645 34.4159 27.084 33.886 27.084 33.3335V27.0835H33.334C33.8865 27.0835 34.4164 26.864 34.8071 26.4733C35.1978 26.0826 35.4173 25.5527 35.4173 25.0002C35.4173 24.4476 35.1978 23.9177 34.8071 23.527C34.4164 23.1363 33.8865 22.9168 33.334 22.9168Z"
                          fill="#464255"
                        ></path>
                      </svg>
                    )}
                  </Link>
                </div>
              </div>
            </div>
            <div className={`second-header ${isVisible ? "show" : ""}`}>
              <div className="dropdown-part">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label class="form-label">Export As</label>
                    <Form.Select
                      aria-label="Export As"
                      onChange={(e) => handleExportDocumentShow(e.target.value)}
                      defaultValue=""
                    >
                      <option value="">Sélectionner...</option>
                      <option value="pdf">PDF</option>
                      <option value="excel">Exceller</option>
                    </Form.Select>
                  </div>
                  <div className="col-md-3">
                    <label class="form-label">{t("addDocumentLabel")}</label>
                    <Form.Select name="Ajouter" onChange={(e) => {
                      if (e.target.value == "adddocument") {
                        handleShow();
                      }
                    }}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="adddocument">{t("addDocumentLabel")}</option>
                    </Form.Select>
                  </div>
                  <div className="col-md-3">
                    <label class="form-label">Ajouter une note</label>
                    <Form.Select name="Ajouter" onChange={(e) => handleNoteAddOrShow(e.target.value)}>
                      <option value="">Sélectionner...</option>
                      <option value="add_note">Ajouter une note</option>
                      <option value="view_note">Voir les raisons</option>
                    </Form.Select>
                  </div>
                  <div className="col-md-3">
                    <label class="form-label">Envoyer à</label>
                    <Form.Select
                      aria-label="Etat du chantier"
                      value={sendToFileStatus}
                      onChange={(e) => handleSendFileShow(e.target.value)}
                    >
                      <option value="" disabled selected>
                        Envoyer à
                      </option>
                      <option value="transfer_to_manager">
                        Transfert au Gestionnaire
                      </option>
                      <option value="transfer_to_broker">
                        Transfert au Courtier
                      </option>
                      <option value="formal_notice">Mise en demeure</option>
                    </Form.Select>
                  </div>
                </div>
                <div className="grid-view">
                  <div className="row mb-0 check-status">
                    <div className="col-md-3 mb-3">
                      <div className="d-flex align-items-start flex-column gap-2">
                        <p className="m-0">Etat du chantier </p>
                        <div className="status">
                          {showUserDocumentData?.site_status === "on_site"
                            ? "En cours de chantier"
                            : "Fin de chantier"}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="d-flex align-items-start flex-column gap-2">
                        <p className="m-0">Statut </p>
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
                    <div className="col-md-3 mb-3">
                      <div className="d-flex align-items-start flex-column gap-2">
                        <p className="m-0">DOC </p>
                        <div className="status">{showUserDocumentData?.created_at || ""}</div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="d-flex align-items-start flex-column gap-2">
                        <p className="m-0">Date fin prévisionnelle </p>
                        <div className="status">{showUserDocumentData?.estimated_completion_date || ""}</div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="d-flex align-items-start flex-column gap-2">
                        <p className="m-0">Coût prévisionnel </p>
                        <div className="status">{showUserDocumentData?.estimated_site_cost || ""}</div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="d-flex align-items-start flex-column gap-2">
                        <p className="m-0">Nom du preneur assurance </p>
                        <div className="status">{showUserDocumentData?.insurance_policyholder_name || ""}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Tabs
          activeKey={activeTab}
          onSelect={handleSelect}
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
              <div className="col-md-6">
                <h2 className="mb-3">Informations détaillées</h2>
                <div className="custom-grid-card">
                  <h3>Documents enregistrés</h3>
                  <div className="table-wrap mt-24">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Nom du bloc logique</th>
                          <th>Nombre de blocs logiques</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardDocumentFileList?.length > 0 ? (
                          dashboardDocumentFileList?.map((data) => (
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
                                    {data.logical_block_name}
                                  </span>
                                </div>
                              </td>
                              <td>{`${data.registered}/${data.expected}`}</td>
                            </tr>
                          ))
                        ) : (
                          <tr style={{ textAlign: "center" }}>
                            <td colSpan="2">{t("NorecordsfoundLabel")}</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>

                <div className="custom-grid-card mt-3">
                  <h3>Intervenants enregistrés</h3>
                  <div className="table-wrap mt-24">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Intervenants</th>
                          <th>Total Intervenants</th>
                        </tr>
                      </thead>
                      <tbody>
                        {speakerDocumentFileList ? (
                          <>
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
                                    Nombre total de fichiers invalides
                                  </span>
                                </div>
                              </td>
                              <td>
                                {speakerDocumentFileList?.total_invalid_files}
                              </td>
                            </tr>
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
                                    Nombre total de fichiers manquants
                                  </span>
                                </div>
                              </td>
                              <td>
                                {speakerDocumentFileList?.total_missing_files}
                              </td>
                            </tr>
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
                                    Nombre total d'intervenants connectés
                                  </span>
                                </div>
                              </td>
                              <td>
                                {
                                  speakerDocumentFileList?.total_speakers_attached
                                }
                              </td>
                            </tr>
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
                                    Nombre total de fichiers à valider
                                  </span>
                                </div>
                              </td>
                              <td>
                                {
                                  speakerDocumentFileList?.total_to_be_validated_files
                                }
                              </td>
                            </tr>
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
                                    Nombre total de fichiers validés
                                  </span>
                                </div>
                              </td>
                              <td>
                                {speakerDocumentFileList?.total_validated_files}
                              </td>
                            </tr>
                          </>
                        ) : (
                          <tr style={{ textAlign: "center" }}>
                            <td colSpan="2">{t("NorecordsfoundLabel")}</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>

                <h2 className="mb-3 mt-3">Tâche</h2>
                <div className="custom-grid-card">
                  <h3>Tâche à venir - à déterminer</h3>
                  <div className="table-wrap mt-24">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Nom de la tâche</th>
                          <th className="custom-field">Date limite</th>
                          <th>Description de la tâche</th>
                          <th>Attribué par</th>
                          <th>Attribué à</th>
                          <th>{t("status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taskListData?.length > 0 ? (
                          taskListData?.map((data) => (
                            <tr>
                              <td>
                                <span className="text-elips">{data.title}</span>
                              </td>
                              <td>{data.due_date}</td>
                              <td>
                                <span className="text-elips">{data.description}</span>
                              </td>
                              <td>{(data.assigned_by?.first_name || "") + " " + (data.assigned_by?.last_name || "")}</td>
                              <td>{(data.assigned_to?.first_name || "") + " " + (data.assigned_to?.last_name || "")}</td>
                              <td>
                                {/* {data.status == "to_be_checked" ? (
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
                                )} */}
                                <span className="checked badges">{data.status}</span>
                              </td>
                            </tr>
                          ))) : (
                          <tr style={{ textAlign: "center" }}>
                            <td colSpan="6">{t("NorecordsfoundLabel")}</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                  {totalTaskRecords > 10 && (
                    <Paginations
                      currentPage={currentTaskPage}
                      totalPages={totalTaskPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={10}
                      totalItems={totalTaskRecords}
                    />
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <h2 className="mb-3">Événements</h2>
                <div className="custom-grid-card">
                  <div className="last-event-card">
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {/* Type Filter */}
                      <select
                        className="form-select w-auto"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                      >
                        <option value="">Sélectionnez le type</option>
                        <option value="notes">Remarques</option>
                        <option value="action">Action</option>
                      </select>

                      {/* User Filter */}
                      <select
                        className="form-select w-auto"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                      >
                        {eventHistoryUserList?.length > 0 ? (
                          <>
                            <option value="">Sélectionnez un utilisateur</option>
                            {eventHistoryUserList.map((data, index) => (
                              <option key={index} value={data.id}>
                                {(data?.first_name || "") + " " + (data?.last_name || "")}
                              </option>
                            ))}
                          </>
                        ) : (
                          <>
                            <option value="">Sélectionnez un utilisateur</option>
                            <option value="" disabled>{t("NorecordsfoundLabel")}</option>
                          </>
                        )}
                      </select>

                      {/* Date Filter */}
                      <DatePicker
                        placeholderText="Sélectionnez une date"
                        selected={selectedDate ? getFormattedDate(selectedDate) : null}
                        onChange={(date) => setSelectedDate(formatDate(date))}
                        dateFormat="dd/MM/yyyy"
                        locale={fr}
                        isClearable
                      />
                    </div>
                    <span>5 derniers événements</span>
                    <div className="timeline">
                      {lastFiveEventList?.length > 0 ? (
                        lastFiveEventList.map((data) => {
                          const createdAt = formatCreatedAt(data.created_at);

                          // Split at first " - "
                          const dashIndex = data.action_details.indexOf(" - ");
                          const firstPart = dashIndex !== -1
                            ? data.action_details.slice(0, dashIndex).trim()
                            : data.action_details.trim();
                          const secondPart = dashIndex !== -1
                            ? data.action_details.slice(dashIndex + 3).trim()
                            : "";

                          // Function to split by colon and bold before-colon part
                          const renderColonBold = (text) => {
                            const colonIndex = text.indexOf(":");
                            if (colonIndex !== -1) {
                              const beforeColon = text.slice(0, colonIndex).trim();
                              const afterColon = text.slice(colonIndex + 1).trim();
                              return (
                                <>
                                  <strong>{beforeColon}:</strong> {afterColon}
                                </>
                              );
                            }
                            return text;
                          };

                          return (
                            <div className="timeline-item" key={data.id}>
                              <div className="timeline-dot"></div>
                              <div className="timeline-content">
                                <h5>{createdAt}</h5>
                                <p>
                                  {renderColonBold(firstPart)}
                                  {secondPart && (
                                    <>
                                      <br />
                                      {renderColonBold(secondPart)}
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="timeline-item">{t("NorecordsfoundLabel")}</div>
                      )}
                    </div>
                    <button
                      className="btn-secondary btn btn-primary"
                      onClick={() => setActiveTab("history")}
                    >
                      Tout voir
                    </button>
                  </div>
                  <div className="last-msg-card">
                    3 derniers messages importants non lus
                    <div className="timeline">
                      {lastThreeNoteList?.length > 0 ? (
                        lastThreeNoteList?.map((data) => (
                          <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <h5>{formatCreatedAt(data.created_on)}</h5>
                              <p>{data.reason}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="timeline-item">
                          {t("NorecordsfoundLabel")}
                        </div>
                      )}
                    </div>
                    <button
                      className="btn-secondary btn btn-primary"
                      onClick={handleNoteShow}
                    >
                      Tout voir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Tab>

          {/* Information Tab */}
          <Tab eventKey="contactinfo" title="Information dossier">
            {isLoading ? (
              <Loading />
            ) : (
              <Form className="mt-24 " onSubmit={UpdateFolderInfo}>
                {flashMessage.message && (
                  <div
                    className={`mt-3 mx-w-320 alert ${flashMessage.type === "success"
                        ? "alert-success"
                        : "alert-danger"
                      } text-center`}
                    role="alert"
                  >
                    {flashMessage.message}
                  </div>
                )}
                <div className="d-flex gap-4 flex-wrap">
                  <div className="flex-fill" style={{ minWidth: "300px" }}>
                    <Form.Group
                      className="mb-4"
                      controlId="exampleForm.ControlInput1"
                    >
                      <Form.Label>
                        N° de dossier <span>*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="N° de dossier"
                        value={showUserFolderName}
                        onChange={(e) => setShowUserFolderName(e.target.value)}
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

                    <Form.Group
                      className="mb-4"
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

                    <Form.Group className="mb-4" controlId="names">
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

                    <Form.Group className="mb-4" controlId="names">
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
                  </div>

                  <div className="flex-fill" style={{ minWidth: "300px" }}>
                    <Form.Group className="mb-4" controlId="formBasicEmail">
                      <Form.Label>Nom du preneur d'assurance</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nom du preneur d'assurance"
                        value={policyholderName}
                        onChange={(e) => setPolicyholderName(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formBasicEmail">
                      <Form.Label>Choisir un Courtier</Form.Label>
                      <Form.Select
                        className="full-width mb-3"
                        aria-label={"statusSelectAria"}
                        value={selectBroker}
                        onChange={handleBrokerChange}
                      >
                        <option value="" disabled selected>
                          Choisir un Courtier
                        </option>
                        {brokerList?.length > 0 ? (
                          brokerList?.map((broker) => (
                            <option value={broker.id}>
                              {broker.first_name}
                            </option>
                          ))
                        ) : (
                          <option value="">{t("NorecordsfoundLabel")}</option>
                        )}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group
                      className="mb-4"
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

                    <Form.Group className="mb-4" controlId="names">
                      <Form.Label className="d-block">
                        Date de début définitive
                      </Form.Label>
                      <DatePicker
                        placeholderText="Selectionner une date de début du site"
                        selected={startDate ? getFormattedDate(startDate) : ""}
                        onChange={(date) => setStartDate(formatDate(date))}
                        dateFormat="dd/MM/yyyy"
                        locale={fr}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="names">
                      <Form.Label className="d-block">
                        Date de fin de chantier définitive
                      </Form.Label>
                      <DatePicker
                        placeholderText="Selectionner une date de fin de chantier définitive"
                        selected={endDate ? getFormattedDate(endDate) : ""}
                        onChange={(date) => setEndDate(formatDate(date))}
                        dateFormat="dd/MM/yyyy"
                        locale={fr}
                      />
                    </Form.Group>
                  </div>
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
                  onClick={() => navigate("/insurers-file")}
                >
                  Annuler
                </Button>
              </Form>
            )}
          </Tab>

          {/* Documents Tab */}
          <Tab
            className="update-inside-tab"
            eventKey="otherdocument"
            title="Documents"
          >
            {isLoading && (
              <div className="loading-overlay">
                <Loading />
              </div>
            )}
            <Tabs
              defaultActiveKey="otherdocument"
              className="mt-0 mb-0 "
              activeKey={activeDocumentTab}
              onSelect={handleSelectDocument}
            >
              {/* Other Tab */}
              <Tab
                eventKey="otherdocument"
                title={`Documents (${totalRecordOther || 0})`}
              >
                <div className="table-wrapper mt-16 p-0">
                  <div className="d-md-flex align-items-center gap-2 justify-content-between"></div>
                  {isLoading ? (
                    <Loading />
                  ) : (
                    <div className="table-wrap mt-24">
                      <Table responsive hover>
                        <thead>
                          <tr>
                            {selectedOtherDocColumns.includes(
                              "fileNameLabe"
                            ) && (
                                <th>
                                  <div className="d-flex align-items-center">
                                    <span>{t("fileNameLabe")}</span>
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
                                            fillOpacity="0.5"
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
                                            fillOpacity="0.5"
                                          />
                                          <path
                                            d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z"
                                            fill="black"
                                          />
                                        </svg>
                                      )}
                                    </Link>
                                  </div>
                                </th>
                              )}
                            {selectedOtherDocColumns.includes(
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
                                              fillOpacity="0.5"
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
                                              fillOpacity="0.5"
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
                            {selectedOtherDocColumns.includes(
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
                                              fillOpacity="0.5"
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
                                              fillOpacity="0.5"
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
                            {selectedOtherDocColumns.includes("status") && (
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
                                            fillOpacity="0.5"
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
                                            fillOpacity="0.5"
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
                            {selectedOtherDocColumns.includes("Actions") && (
                              <th>Actions</th>
                            )}
                            <th style={{ textAlign: "right" }}>
                              <Link onClick={handleAddOtherColShow}>
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
                          {showOtherDocument?.length > 0 &&
                            selectedOtherDocColumns?.length > 0 ? (
                            showOtherDocument?.map((data) => (
                              <tr
                                style={{
                                  cursor:
                                    data.status === "invalid" && "pointer",
                                }}
                                onClick={(e) => {
                                  if (data.status === "invalid" && !e.target.closest(".action-btn")) {
                                    handleInvalidReason(data.id);
                                  }
                                }}
                              >
                                {selectedOtherDocColumns.includes(
                                  "fileNameLabe"
                                ) && (
                                    <td>
                                      <span className="text-elips">
                                        {data.filename}
                                      </span>
                                    </td>
                                  )}
                                {selectedOtherDocColumns.includes(
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
                                {selectedOtherDocColumns.includes(
                                  "Type de document"
                                ) && <td>{data.docType.name}</td>}
                                {selectedOtherDocColumns.includes("status") && (
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
                                {selectedOtherDocColumns.includes(
                                  "Actions"
                                ) && (
                                    <td>
                                      <div className="action-btn">
                                        <Link
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewShow();
                                            setViewRowData(data);
                                          }}
                                          className="view"
                                          href="/user-management"
                                          data-discover="true"
                                          title="Voir"
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
                                          className="addnote"
                                          href="/user-management"
                                          data-discover="true"
                                          onClick={() =>
                                            handleAddNoteModalOpen(
                                              data.id,
                                              data.filename
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
                                              stroke="#00366B"
                                              stroke-width="2"
                                            />
                                            <line
                                              x1="8"
                                              y1="7"
                                              x2="16"
                                              y2="7"
                                              stroke="#00366B"
                                              stroke-width="2"
                                              stroke-linecap="round"
                                            />
                                            <line
                                              x1="8"
                                              y1="11"
                                              x2="16"
                                              y2="11"
                                              stroke="#00366B"
                                              stroke-width="2"
                                              stroke-linecap="round"
                                            />
                                            <line
                                              x1="8"
                                              y1="15"
                                              x2="13"
                                              y2="15"
                                              stroke="#00366B"
                                              stroke-width="2"
                                              stroke-linecap="round"
                                            />
                                          </svg>
                                        </Link>
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
                                              fill="#00366B"
                                            />
                                            <path
                                              d="M8 14L12 18L16 14"
                                              stroke="#00366B"
                                              stroke-width="1.5"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                            />
                                            <path
                                              d="M12 11V18"
                                              stroke="#00366B"
                                              stroke-width="1.5"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"
                                            />
                                          </svg>
                                        </Link>
                                        <Link
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleReplaceShow();
                                            setShowDocumentId(data.id);
                                            setShowDocumentName(data.filename);
                                          }}
                                          className="doc"
                                          href="/user-management"
                                          data-discover="true"
                                          title="Téléverser"
                                        >
                                          <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 15.01L9.41 16.42L11 14.84V19H13V14.84L14.59 16.43L16 15.01L12.01 11L8 15.01Z"
                                              fill="#00366B"
                                            />
                                          </svg>
                                        </Link>
                                        <Link
                                          className="delete"
                                          href="/user-management"
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
                  {totalRecordOther > 10 && (
                    <Paginations
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={10}
                      totalItems={totalRecordOther}
                    />
                  )}
                </div>
              </Tab>

              {/* Missing Document Tab */}
              <Tab
                eventKey="missingdocument"
                title={`Documents manquants (${totalMissingRecords || 0})`}
              >
                <div className="table-wrapper mt-16 p-0">
                  <div className="d-md-flex align-items-center gap-2 justify-content-between">
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
                                    className={`mt-3 alert ${flashMessageStoreDoc.type === "success"
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
                                          fillOpacity="0.5"
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
                                          fillOpacity="0.5"
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
                                          fillOpacity="0.5"
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
                                          fillOpacity="0.5"
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
                              <td colSpan="3">{t("NorecordsfoundLabel")}</td>
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
                      itemsPerPage={10}
                      totalItems={totalMissingRecords}
                    />
                  )}
                </div>
              </Tab>
            </Tabs>
          </Tab>

          {/* Speakers Tab */}
          <Tab
            eventKey="speakerdocument"
            title={`Intervenants (${totalSpeaker || 0})`}
          >
            {showSepeakerInner ? (
              <div className="inner-tab-screen">
                <div className="row">
                  <div className="col-md-4">
                    {flashMessage.message && (
                      <div
                        className={`alert ${flashMessage.type === "success"
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
                        className={`mt-3 alert ${flashMessageStoreDoc.type === "success"
                            ? "alert-success"
                            : "alert-danger"
                          } text-center`}
                        role="alert"
                      >
                        {flashMessageStoreDoc.message}
                      </div>
                    )}
                    {isSpeakerLoading ? (
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
                  <div className="col-md-8 flex-fill">
                    <Tabs
                      onSelect={handleSubTabSelect}
                      defaultActiveKey="speakerdocument"
                      activeKey={activeSubTab}
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
                                              {data.filename}
                                            </span>
                                          </div>
                                        </td>
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
                                                fill="#00366B"
                                              />
                                              <path
                                                d="M8 14L12 18L16 14"
                                                stroke="#00366B"
                                                stroke-width="1.5"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                              />
                                              <path
                                                d="M12 11V18"
                                                stroke="#00366B"
                                                stroke-width="1.5"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                              />
                                            </svg>
                                          </Link>
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
                                                fill="#00366B"
                                              />
                                            </svg>
                                          </Link>
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
                                itemsPerPage={10}
                                totalItems={totalSpeakerDocument}
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
                            className={`alert ${flashMessage.type === "success"
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
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {speakerDocumentTypeList?.length > 0 ? (
                                    speakerDocumentTypeList?.map((data) => (
                                      <tr>
                                        <td>{data.documentType.name}</td>
                                        <td>
                                          <Link
                                            onClick={() => {
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
                                                fill="black"
                                              />
                                            </svg>
                                          </Link>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr style={{ textAlign: "center" }}>
                                      <td colSpan="2">
                                        {t("NorecordsfoundLabel")}
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </Tab>
                    </Tabs>
                  </div>
                </div>
              </div>
            ) : (
              <div className="table-wrapper mt-10 p-0">
                <div className="d-md-flex align-items-center gap-2 justify-content-between">
                  <h2 className="m-md-0 mb-3">
                    {/* Intervenants ({totalSpeaker}) */}
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
                          {selectedSpeakerColumns.includes("N° de SIRET") && (
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
                                          fillOpacity="0.5"
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
                                          fillOpacity="0.5"
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
                          {selectedSpeakerColumns.includes("Intervenant") && (
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
                                          fillOpacity="0.5"
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
                                          fillOpacity="0.5"
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
                          {selectedSpeakerColumns.includes("Dernière MaJ") && (
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
                                          fillOpacity="0.5"
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
                                          fillOpacity="0.5"
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
                          <th>Status</th>
                          {selectedSpeakerColumns.includes("Doc. associés") && (
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
                                          fillOpacity="0.5"
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
                                          fillOpacity="0.5"
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
                            "Doc. Manquants"
                          ) && (
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
                                            fillOpacity="0.5"
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
                                            fillOpacity="0.5"
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
                            <Link onClick={handleAddSpeakerColShow}>
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
                        {speakerList?.length > 0 &&
                          selectedSpeakerColumns.length > 0 ? (
                          speakerList?.map((data) => (
                            <tr>
                              {selectedSpeakerColumns.includes(
                                "N° de SIRET"
                              ) && <td>{data.siren_number}</td>}
                              {selectedSpeakerColumns.includes(
                                "Intervenant"
                              ) && (
                                  <td>
                                    <span className="text-elips">
                                      {data.company_name}
                                    </span>
                                  </td>
                                )}
                              {selectedSpeakerColumns.includes(
                                "Dernière MaJ"
                              ) && <td>{data.updated_at}</td>}
                              <td>
                                <span className="doc-status success"></span>
                              </td>
                              {selectedSpeakerColumns.includes(
                                "Doc. associés"
                              ) && <td>{data.user_document_count}</td>}
                              {selectedSpeakerColumns.includes(
                                "Doc. Manquants"
                              ) && <td>{data.missing_document_count}</td>}
                              {selectedSpeakerColumns.includes("Actions") && (
                                <td>
                                  <div className="action-btn">
                                    <Link
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowViewSpeaker(true);
                                        setShowSpeakerId(data.id);
                                        SpeakerDetail(data.id);
                                        setTotalSpeakerDocument(data.user_document_count);
                                        setTotalMissingDocument(data.missing_document_count);
                                        setShowSpeakerInner(true);
                                      }}
                                      className="view"
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
                                      className="delete"
                                      href="/user-management"
                                      data-discover="true"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleShowDeleteSpeakerModal();
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
                              )}
                              <td></td>
                            </tr>
                          ))
                        ) : (
                          <tr style={{ textAlign: "center" }}>
                            <td colSpan="8">{t("NorecordsfoundLabel")}</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                )}
                {totalSpeaker > 10 && (
                  <Paginations
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={10}
                    totalItems={totalSpeaker}
                  />
                )}
              </div>
            )}
          </Tab>

          {/* History Tab */}
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
                          <td colSpan="7">{t("NorecordsfoundLabel")}</td>
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
                  itemsPerPage={10}
                  totalItems={totalHistoryRecords}
                />
              )}
            </div>
          </Tab>
        </Tabs>
      </div>

      <AddNote
        showmodal={showAddNoteModal}
        handleModalClose={handleAddNoteModalClose}
        selectDocumentId={selectedAddNoteDocId}
        selectDocumentFileName={selectedAddNoteDocName}
        handleAddNoteModalCloseAfterAPICall={handleAddNoteModalCloseAfterAPICall}
      />

      {/* Add Document */}
      <Offcanvas
        className="add-folder-panel"
        placement={"end"}
        show={show}
        onHide={handleClose}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t("addDocumentLabel")}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="step-1">
            <div className="div">
              <div className="step-2">
                <h2>
                  Ajouter un document au dossier <span>*</span>
                </h2>
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
                        handleFileChange({ target: { files } });
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
                      {t("documentsAcceptedLabel")}: mot, exceller,
                      pdf, PowerPoint
                    </span>
                    <Form.Control
                      type="file"
                      className="file-input"
                      multiple
                      onChange={handleFileChange}
                    />
                  </div>
                </Form.Group>
                {fileList.length > 0 && (
                  <div className="upload-file-list">
                    {fileList.map((file, index) => (
                      <div key={index} className="upload-file">
                        <span>{file.name}</span>

                        <Link
                          onClick={() => handleRemoveFile(index)}
                        >
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
            type="submit"
            className="btn btn-primary"
            disabled={documentUploading || !fileList.length > 0}
            onClick={HandleAddDocument}
          >
            {documentUploading ? "Suivant..." : "Suivant"}
          </button>
        </div>
      </Offcanvas>

      {/* Update Speaker Documents */}
      <Offcanvas
        className="add-folder-panel"
        placement={"end"}
        show={showReplace}
        onHide={handleReplaceClose}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Remplacer un document</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="step-1">
            <div className="div">
              <div className="step-2">
                <h2>
                  Remplacer un document <span>*</span>
                </h2>
                {showReplace && (
                  <div className="replace-document mt-32">
                    Document remplacé : <span>{showDocumentName}</span>
                  </div>
                )}
                {flashMessageStoreDoc.message && (
                  <div
                    className={`mt-3 alert ${flashMessageStoreDoc.type === "success"
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
                        handleUpdateFileChange({ target: { files } });
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
                      {t("documentsAcceptedLabel")}: mot, exceller, pdf,
                      PowerPoint
                    </span>
                    <Form.Control
                      type="file"
                      className="file-input"
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
            disabled={documentUploading || !fileList.length > 0}
            onClick={(e) => HandleUpdateDocument(e)}
          >
            {documentUploading ? "Suivant..." : "Suivant"}
          </button>
        </div>
      </Offcanvas>

      {/* View Pop Up Design */}
      <Offcanvas
        className="add-folder-panel"
        placement={"end"}
        show={showView}
        onHide={handleViewClose}
      >
        <Offcanvas.Header className="border-bottom" closeButton>
          <Offcanvas.Title>{showUserFolderName}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="div">
            <h2>
              {t("brokerlabel")}:{" "}
              {viewRowData?.user_document?.broker
                ? viewRowData?.user_document?.broker?.first_name +
                " " +
                viewRowData?.user_document?.broker?.last_name
                : "Sans"}
            </h2>
            <div className="table-wrapper mt-16 p-0">
              <div className="table-wrap mt-24">
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>{t("fileNameLabe")}</th>
                      <th>{t("status")}</th>
                      <th>{t("createdLabel")}</th>
                      {activeTab !== "otherdocument" && (
                        <th>
                          <span>{t("speakerLabel")} </span>
                        </th>
                      )}
                      <th>Télécharger</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{viewRowData?.filename}</td>
                      <td>
                        {viewRowData?.status == "to_be_checked" ? (
                          <span className="checked badges">
                            {t("toBeCheckedLabel")}
                          </span>
                        ) : viewRowData?.status == "verified" ? (
                          <span className="verified badges">
                            {t("verified")}
                          </span>
                        ) : (
                          <span className="incomplete badges">
                            {t("invalidLabel")}
                          </span>
                        )}
                      </td>
                      <td>{viewRowData?.created_at}</td>
                      {activeTab !== "otherdocument" && (
                        <td>
                          {viewRowData?.speaker
                            ? viewRowData?.speaker?.company_name +
                            (viewRowData?.speaker?.siren_number
                              ? " - " + viewRowData?.speaker?.siren_number
                              : "")
                            : ""}
                        </td>
                      )}
                      <td>
                        <Link
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            HandleDownloadFile(viewRowData);
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
                              fill="#00366B"
                            />
                            <path
                              d="M8 14L12 18L16 14"
                              stroke="#00366B"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path
                              d="M12 11V18"
                              stroke="#00366B"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Delete Document Confirmation Popup */}
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

      {/* Delete Speaker Confirmation Popup */}
      <Modal
        className="final-modal"
        show={showDeleteSpeakerModal}
        onHide={handleCloseDeleteSpeakerModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <h2>Confirmation</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Etes-vous sûr de vouloir supprimer le intervenants?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="cancel-btn"
            variant="primary"
            onClick={handleCloseDeleteSpeakerModal}
          >
            Annuler
          </Button>
          <Button variant="primary" onClick={HandleDeleteSpeaker}>
            {t("confirmbtnLabel")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Other Add Col Modal */}
      <Modal show={invalidResonModal} onHide={handleInvalidReasonModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Raison invalide</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="step-2">
            {displayedRecordsNote?.length > 0 ? (
              <div
                className="scroll-container"
                onScroll={handleScrollInvalid}
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                }}
              >
                <div style={{ height: "400px" }}>
                  {displayedRecordsNoteInvalid?.map((data) => (
                    <Fragment>
                      <div className="note-box mb-3">
                        <div className="d-flex justify-content-between align-items-center top-part">
                          <p className="m-0">
                            {data.type == "note" ? "Note" : "Invalide"}
                          </p>
                          <p className="m-0 create-date">
                            créé le {data.created_on}
                          </p>
                        </div>
                        <div className="inner-box">
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
                          </div>
                          <p className="">{data.reason}</p>
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            ) : (
              <div>{t("NorecordsfoundLabel")}</div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="cancel-btn" variant="primary" onClick={handleInvalidReasonModalClose}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Speaker Add Col Modal */}
      <Modal show={showAddSpeakerCol} onHide={handleAddSpeakerColClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter une colonne</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h2 className="mb-4">Liste des colonnes</h2>
          {/* Select All Checkbox */}
          <Form.Check
            id="select-all-checkbox"
            label="Sélectionner tout"
            checked={Object.values(speakerModalColumns).every((value) => value)} // All true
            onChange={(e) => {
              const isChecked = e.target.checked;
              setSpeakerModalColumns((prev) =>
                Object.fromEntries(
                  Object.keys(prev).map((key) => [key, isChecked])
                )
              );
            }}
          />

          {/* Individual Column Checkboxes */}
          {Object.keys(speakerModalColumns).map((key) => (
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
              checked={speakerModalColumns[key]}
              onChange={() => handleSpeakerCheckboxChange(key)}
            />
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAddSpeakerColSubmit}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Other Add Col Modal */}
      <Modal show={showAddOtherCol} onHide={handleAddOtherColClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter une colonne</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h2 className="mb-4">Liste des colonnes</h2>
          {/* Select All Checkbox */}
          <Form.Check
            id="select-all-checkbox"
            label="Sélectionner tout"
            checked={Object.values(otherDocModalColumns).every(
              (value) => value
            )} // All true
            onChange={(e) => {
              const isChecked = e.target.checked;
              setOtherDocModalColumns((prev) =>
                Object.fromEntries(
                  Object.keys(prev).map((key) => [key, isChecked])
                )
              );
            }}
          />

          {/* Individual Column Checkboxes */}
          {Object.keys(otherDocModalColumns).map((key) => (
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
              checked={otherDocModalColumns[key]}
              onChange={() => handleOtherCheckboxChange(key)}
            />
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAddOtherColSubmit}>
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

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

      {/* Note list */}
      <Offcanvas
        className="add-folder-panel broker-add-panel"
        placement={"end"}
        show={showNote}
        onHide={handleNoteClose}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Dossier incomplet</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ overflow: "hidden", maxHeight: "100vh" }}>
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
                      maxHeight: "calc(100vh - 300px)",
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
                                {`${data.added_by?.first_name ?? ""} ${data.added_by?.last_name ?? ""
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

      {/* Export Popup */}
      <Modal
        className="missing-doc-modal"
        show={exportDocumentOpen}
        onHide={() => setExportDocumentOpen(true)}
      >
        <Modal.Header closeButton onHide={handleExportDocumentClose}>
          <Modal.Title>
            <h2>Confirmer</h2>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span className="complete-process">
            Êtes-vous sûr de vouloir télécharger les documents{" "}
            {fileType == "pdf" ? "PDF" : fileType == "excel" ? "Exceller" : ""}?
          </span>
        </Modal.Body>
        <Modal.Footer>
          <div className="text-end">
            <Button
              variant="primary"
              onClick={() =>
                ExportDocumentFile(id, fileType, () =>
                  setExportDocumentOpen(false)
                )
              }
            >
              {t("confirmbtnLabel")}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default FileDetails;
