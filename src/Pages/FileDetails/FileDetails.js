import React, { Fragment, useEffect } from "react";
import "./FileDetails.css";
import SidePanel from "../../Components/SidePanel/SidePanel";
import Table from "react-bootstrap/Table";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { Button, Form, Offcanvas } from "react-bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import MissingDocument from "../../Components/MissingDocument/MissingDocument";
import FilePageService from "../../API/FilePage/FilePageService";
import { useTranslation } from "react-i18next";
import AddFolderPanelService from "../../API/AddFolderPanel/AddFolderPanelService";
import DatePicker from "react-datepicker";
import { fr } from "date-fns/locale";
import InvalidDocument from "../../Components/InvalidDocument/InvalidDocument";
import Modal from 'react-bootstrap/Modal';
import Paginations from "../../Components/Paginations/Paginations";
import logo from "../../ass-logo.png";
import Loading from "../../Common/Loading";
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import AcsManagerFileService from "../../API/AcsManager/AcsManagerFileService";

const FileDetails = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeTab, setActiveTab] = useState("contactinfo");
  const [activeSubTab, setActiveSubTab] = useState("speaker");
  const [showSpeakerId, setShowSpeakerId] = useState("");
  const [history, setHistory] = useState([]);
  const [showUserDocumentData, setShowUserDocumentData] = useState([]);
  const [showUserFolderName, setShowUserFolderName] = useState("");
  const [showOtherDocument, setShowOtherDocument] = useState([]);
  const [showSpeakerDocument, setShowSpeakerDocument] = useState([]);
  const [speakerList, setSpeakerList] = useState([]);
  const [speakerDocumentTypeList, setSpeakerDocumentTypeList] = useState([]);
  const [speakerDetail, setSpeakerDetail] = useState();
  const [historyDocumentList, setHistoryDocumentList] = useState([]);
  const [markIsReadCount, setMarkIsReadCount] = useState(0);
  const [totalMissingRecords, setTotalMissingRecords] = useState(0);
  const [missingDocumentList, setMissingDocumentList] = useState([]);
  const [showUserDocumentFileData, setShowUserDocumentFileData] = useState([]);
  const [userDocumentFileDataChanges, setUserDocumentFileDataChanges] = useState({
    id: "",
    status: "",
    doc_type_id: ""
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
  const [selectDocumentId, setSelectDocumentId] = useState("");
  const [selectDocumentFileName, setSelectDocumentFileName] = useState("");
  const [missingDocumentId, setMissingDocumentId] = useState("");
  const [showUserDocumentDataId, setShowUserDocumentDataId] = useState("");
  const [showDocumentId, setShowDocumentId] = useState("");
  const [showDocumentName, setShowDocumentName] = useState("");
  const [brokerList, setBrokerList] = useState([]);
  const [selectBroker, setSelectBroker] = useState("");
  const [recordsToShow, setRecordsToShow] = useState(2);
  const [recordsToShowNOte, setRecordsToShowNote] = useState(3);
  const [logoImageShow, setLogoImageShow] = useState("");
  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
  const [userRole, setUserRole] = useState(null);
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
    "Intervenant": true,
    "Dernière MaJ": true,
    "Doc. associés": true,
    "Doc. Manquants": true,
    "Actions": true
  });

  const [selectedSpeakerColumns, setSelectedSpeakerColumns] = useState(
    Object.keys(speakerModalColumns).filter((key) => speakerModalColumns[key])
  );

  const [otherDocModalColumns, setOtherDocModalColumns] = useState({
    fileNameLabe: true,
    speakerLabel: true,
    "Type de document": true,
    status: true,
    Actions: true
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

  const [showFinalModal, setShowFinalModal] = useState(false);
  const handleShowFinalModal = () => setShowFinalModal(true);
  const handleCloseFinalModal = () => {
    setShowFinalModal(false);
    if (activeTab === "contactinfo") {
      ShowUserDocumentData(id);
      setShowUserDocumentDataId(id);
      BrokerList();
    }
    if (activeTab === "speakerdocument") {
      SpeakerList(id, sort, search, currentPage);
    }
    if (activeTab === "otherdocument") {
      ShowOtherDocument(id, sort, currentPage, editUserStatus, selectDocumentType);
      SpeakerDropDownList("", 1);
      DocumentTypeList();
    }
    if (activeTab === "missingdocument") {
      GetMissingDocumentList(id, sort, currentPage);
    }
    if (activeTab === "history") {
      GetHistoryListDocument(id);
    }
  }

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const [showDeleteSpeakerModal, setShowDeleteSpeakerModal] = useState(false);
  const handleShowDeleteSpeakerModal = () => setShowDeleteSpeakerModal(true);
  const handleCloseDeleteSpeakerModal = () => setShowDeleteSpeakerModal(false);

  const [showViewSpeaker, setShowViewSpeaker] = useState(false);
  const handleViewShowSpeaker = () => setShowViewSpeaker(true);
  const handleViewCloseSpeaker = () => {
    setActiveSubTab("speaker");
    setActiveTab(activeTab);
    setShowViewSpeaker(false);
    if (activeTab === "otherdocument") {
      ShowOtherDocument(id, sort, currentPage, editUserStatus, selectDocumentType);
      SpeakerDropDownList("", 1);
      DocumentTypeList();
    }
    if (activeTab === "speakerdocument") {
      SpeakerList(id, sort, search, currentPage);
    }
    if (activeTab === "missingdocument") {
      GetMissingDocumentList(id, sort, currentPage);
    }
    if (activeTab === "history") {
      GetHistoryListDocument(id);
    }
  };

  const [showmodal, setShowmodal] = useState(false);
  const handleModalShow = () => setShowmodal(true);
  const handleModalClose = () => setShowmodal(false);

  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setFileList([]);
    if (activeTab === "contactinfo") {
      ShowUserDocumentData(id);
      setShowUserDocumentDataId(id);
      BrokerList();
    }
    if (activeTab === "speakerdocument") {
      SpeakerList(id, sort, search, currentPage);
    }
    if (activeTab === "otherdocument") {
      ShowOtherDocument(id, sort, currentPage, editUserStatus, selectDocumentType);
      SpeakerDropDownList("", 1);
      DocumentTypeList();
    }
    if (activeTab === "missingdocument") {
      GetMissingDocumentList(id, sort, currentPage);
    }
    if (activeTab === "history") {
      GetHistoryListDocument(id);
    }
  };

  const [showReplace, setShowReplace] = useState(false);
  const handleReplaceShow = () => setShowReplace(true);
  const handleReplaceClose = () => {
    setFileList([]);
    setShowReplace(false);
  };

  const [showView, setShowView] = useState(false)
  const handleViewClose = () => setShowView(false);
  const handleViewShow = () => setShowView(true);

  const [invalidReasonList, setInvalidReasonList] = useState([]);
  const [invalidResonModal, setInvalidReasonModal] = useState(false);
  const handleInvalidReasonModalOpen = () => setInvalidReasonModal(true);
  const handleInvalidReasonModalClose = () => setInvalidReasonModal(false);

  const [contractNo, setContractNo] = useState("");

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
    } else {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    if (activeTab === "contactinfo") {
      ShowUserDocumentData(id);
      setShowUserDocumentDataId(id);
      BrokerList();
    }
    if (activeTab === "speakerdocument") {
      SpeakerList(id, sort, search, 1);
    }
    if (activeTab === "otherdocument") {
      ShowOtherDocument(id, sort, 1, editUserStatus, selectDocumentType);
      SpeakerDropDownList("", 1);
      DocumentTypeList();
    }
    if (activeTab === "missingdocument") {
      GetMissingDocumentList(id, sort, 1);
    }
    if (activeTab === "history") {
      GetHistoryListDocument(id);
    }
  }, [activeTab, sort]);

  useEffect(() => {
    if (showViewSpeaker) {
      if (activeSubTab === "speaker") {
        SpeakerDetail(showSpeakerId);
      }
      if (activeSubTab === "documents") {
        ShowSpeakerDocument(id, sort, search, currentPage, editUserStatus, selectDocumentType, showSpeakerId);
      }
      if (activeSubTab === "documentType") {
        SpeakerDocumentTypeList(id, showSpeakerId);
      }
    }
  }, [showViewSpeaker, activeSubTab]);

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
    setCurrentFileIndex(0)
    setFileList([]);
    if (activeTab === "contactinfo") {
      ShowUserDocumentData(id);
      setShowUserDocumentDataId(id);
      BrokerList();
    }
    if (activeTab === "speakerdocument") {
      SpeakerList(id, sort, search, currentPage);
    }
    if (activeTab === "otherdocument") {
      ShowOtherDocument(id, sort, currentPage, "", "");
      SpeakerDropDownList("", 1);
      DocumentTypeList();
    }
    if (activeTab === "missingdocument") {
      GetMissingDocumentList(id, sort, currentPage);
    }
    if (activeTab === "history") {
      GetHistoryListDocument(id);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (activeTab === "otherdocument") {
      ShowOtherDocument(id, sort, page, editUserStatus, selectDocumentType);
      SpeakerDropDownList("", 1);
      DocumentTypeList();
    }
    if (activeTab === "speakerdocument") {
      SpeakerList(id, sort, search, page);
    }
    if (activeTab === "missingdocument") {
      GetMissingDocumentList(id, sort, page);
    }
  };

  const handlePageChangeView = (page) => {
    setCurrentPage(page);
    if (activeSubTab === "documents") {
      ShowSpeakerDocument(id, sort, search, page, editUserStatus, selectDocumentType, showSpeakerId);
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
        const fileDataChanges = response.data.documents.user_document_files.map((file) => ({
          id: file.id,
          status: file.status,
          filename: file.filename,
          doc_type_id: file.docType?.id
        }));

        let ContractNo = response.data.documents.contract_no.includes('.');

        setContractNo(response.data.documents.contract_no);
        if(!ContractNo){
         setFlashMessage({
          type: "error",
          message: "Le num du contrat doit contenir au moins un point (.)",
        });
        }
        setShowUserDocumentData(response.data.documents);
        setStartDate(response.data.documents.final_start_date);
        setEndDate(response.data.documents.final_completion_date);
        setPolicyholderName(response.data.documents.insurance_policyholder_name);
        setEstimatedSiteCost(response.data.documents.estimated_site_cost);
        setFinaldSiteCost(response.data.documents.final_site_cost);
        if(response.data.documents.status == "transfer_to_manager" || response.data.documents.status == "transfer_to_broker" || response.data.documents.status == "formal_notice"){
          setSendToFileStatus(response.data.documents.status);
        } else {
          setSendToFileStatus("");
        }
        setEstimatedStartDate(response.data.documents.estimated_start_date);
        setEstimatedCompletionDate(response.data.documents.estimated_completion_date);
        setShowUserFolderName(response.data.documents.folder_name);
        setSelectBroker(response.data.documents?.broker?.id);
        setTotalRecordOther(response.data.documents.user_document_files?.length);
        setTotalMissingRecords(response.data.documents.total_missing_doc);
        setShowUserDocumentFileData(response.data.documents.user_document_files);
        setTotalSpeaker(response.data.documents.total_speakers);
        setUserDocumentFileDataChanges(fileDataChanges);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const ShowOtherDocument = async (id, sort, page = 1, status, type, speaker_id) => {
    setIsLoading(true);
    try {
      var userData = {
        sort: {
          key: sort.key,
          value: sort.value
        },
        page,
        status: status,
        type: type,
        speaker: speaker_id
      }
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

      const response = await AcsManagerFileService.speaker_DropDown_List(userData);
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

  const ShowSpeakerDocument = async (id, sort, search, page = 1, status, type, speaker) => {
    setIsLoading(true);
    try {
      var userData = {
        search,
        sort: {
          key: sort.key,
          value: sort.value
        },
        page,
        status: status,
        type: type,
        speaker_id: speaker
      }

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
        speaker_id: speakerId
      }
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
      console.log(error);
    }
  };

  const HandleDeleteDocumentFile = async (e) => {
    e.preventDefault();
    try {
      const response = await FilePageService.delete_document_file(showDocumentId);
      if (response.data.status) {
        handleCloseDeleteModal();
        if (activeTab === "speakerdocument") {
          if (activeSubTab === "documents") {
            ShowSpeakerDocument(id, sort, search, 1, editUserStatus, selectDocumentType, showSpeakerId);
          }
        }
        if (activeTab === "otherdocument") {
          ShowOtherDocument(id, sort, 1, editUserStatus, selectDocumentType);
          SpeakerDropDownList("", 1);
          DocumentTypeList();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const HandleDeleteSpeaker = async () => {
    try {
      const response = await AcsManagerFileService.delete_speaker(id, showSpeakerId);
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

  const GetHistoryListDocument = async (id) => {
    setIsLoading(true);
    try {
      const response = await FilePageService.history_list(id);
      if (response.data.status) {
        setIsLoading(false);
        const markIsRead = response.data.data.filter((data) => data.is_read == 0);
        setMarkIsReadCount(markIsRead.length);
        setHistoryDocumentList(response.data.data);
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
        page
      }
      const response = await FilePageService.missing_document_list(id, userData);
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

  const MarkHistoryAsReadDocument = async (id) => {
    try {
      const response = await FilePageService.mark_history_as_read(id);
      if (response.data.status) {
        GetHistoryListDocument(showUserDocumentDataId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const MarkHistoryAsReadAllDocument = async (id) => {
    try {
      const response = await FilePageService.mark_history_all_as_read(id);
      if (response.data.status) {
        GetHistoryListDocument(id);
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  const UpdateFolderInfo = async (e) => {
    e.preventDefault();

    var folderData = {
      folder_name: e.target.elements.folderName.value ? e.target.elements.folderName.value : "",
      final_start_date: startDate ? startDate : "",
      final_completion_date: endDate ? endDate : "",
      contract_no: e.target.elements.contract_no.value ? e.target.elements.contract_no.value : "",
      insurance_policyholder_name: policyholderName ? policyholderName : "",
      estimated_start_date: estimatedStartDate ? estimatedStartDate : "",
      estimated_completion_date: estimatedCompletionDate ? estimatedCompletionDate : "",
      estimated_site_cost: e.target.elements.estimated_site_cost.value ? e.target.elements.estimated_site_cost.value : "",
      final_site_cost: e.target.elements.final_site_cost.value ? e.target.elements.final_site_cost.value : "",
      broker_id: selectBroker ? selectBroker : ""
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
        files: userDocumentFileDataChanges
      };
      const response = await FilePageService.validate_document_files(id, validateDocumentFileData);
      if (response.data.status) {
        setIsLoading(false);
        ShowUserDocumentData(id);
        handleCloseFinalModal();
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

  if (fileList.length === 0) {
    handleClose();
    return;
  }

  try {
    const formData = new FormData();
    const filterDocType = documentTypeList?.find((doctype) => doctype.name === "Police");

    fileList.forEach((file, index) => {
      formData.append(`documents[${index}][file]`, file);
      formData.append(`documents[${index}][filename]`, file.name);
      formData.append(`documents[${index}][doc_type_id]`, filterDocType?.id || '1');
    });

    const response = await FilePageService.add_document_files(id, formData);

    if (response.data.status) {
      setFileList([]);
      ShowUserDocumentData(id);
      handleClose();

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
    console.error(error);
    setFlashMessage({
      type: "error",
      message: t("somethingWentWrong"),
    });
  }
};

  // const HandleAddDocument = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const convertToBase64 = (file) => {
  //       return new Promise((resolve, reject) => {
  //         const reader = new FileReader();
  //         reader.onload = () => resolve(reader.result.split(",")[1]);
  //         reader.onerror = (error) => reject(error);
  //         reader.readAsDataURL(file);
  //       });
  //     };

  //     const filterDocType = documentTypeList?.find((doctype) => doctype.name === "Police");

  //     const base64Files = await Promise.all(
  //       fileList.map(async (file) => ({
  //         filename: file.name,
  //         file: await convertToBase64(file),
  //         doc_type_id: filterDocType?.id,
  //       }))
  //     );

  //     var useData = {
  //       documents: base64Files,
  //     };

  //     const response = await FilePageService.add_document_files(id, useData);
  //     if (response.data.status) {
  //       setFileList([]);
  //       ShowUserDocumentData(id);
  //       handleClose();
  //       setFlashMessage({
  //         type: "success",
  //         message: response.data.message || t("somethingWentWrong"),
  //       });
  //     } else {
  //       setFlashMessage({
  //         type: "error",
  //         message: response.data.message || t("somethingWentWrong"),
  //       });
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

const AddMissingDocument = async (e) => {
  e.preventDefault();

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
      setFlashMessageStoreDoc({ type: "success", message: response.data.message });
    } else {
      setFlashMessageStoreDoc({ type: "error", message: response.data.message });
    }

  } catch (error) {
    setFlashMessageStoreDoc({ type: "error", message: "Something went wrong." });
  }
};





  const HandleUpdateDocument = async (e) => {
    if (fileList.length == 0) {
      handleReplaceClose();
      return;
    }
    e.preventDefault();
    try {
      const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      };

      const base64Files = await Promise.all(
        fileList.map(async (file) => ({
          filename: file.name,
          file: await convertToBase64(file),
        }))
      );

      var useData = {
        filename: base64Files[0].filename,
        file: base64Files[0].file,
      };

      const response = await FilePageService.update_document_files(showDocumentId, useData);

      if (response.data.status) {
        handleReplaceClose();
        ShowUserDocumentData(id);
        SpeakerList(id, sort, search, currentPage);
        ShowOtherDocument(id, sort, currentPage, editUserStatus, selectDocumentType);
        setFileList([]);
      } else {
        setFlashMessageStoreDoc({
          type: "error",
          message: response.data.message || t("somethingWentWrong"),
        });
      }
    } catch (error) {
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
      }
      const response = await FilePageService.update_document_status(id, userData);
      if (response.data.status) {
        handleSendFileClose();
        ShowUserDocumentData(id);
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
    setHistory((prevHistory) => [...prevHistory, activeTab]);
    setSearch("");
    setActiveTab(key);
  };

  const handleSubTabSelect = (key) => {
    setActiveSubTab(key);
  };

  const handleBack = () => {
    setHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      const previousTab = newHistory.pop();

      if (previousTab) {
        setActiveTab(previousTab);
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
    ShowOtherDocument(id, sort, currentPage, editUserStatus, selectDocumentType, selectedValue);
  };

  const handleDocumentTypeChange = (e) => {
    const selectedValue = e.target.value;
    const selectedDocument = documentTypeList.find(
      (doctype) => doctype.id == selectedValue
    );
    setSelectDocumentType(selectedDocument?.id || "");
    if (!showCheck) {
      ShowOtherDocument(id, sort, currentPage, editUserStatus, selectedDocument?.id);
      SpeakerList(id, sort, search, currentPage);
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
              doc_type_id: userDocumentFileDataChanges[0]?.doc_type_id
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
              doc_type_id: selectedDoc?.doc_type_id
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
    handleNext()
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
    SpeakerList(id, sort, search, page);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchChange(search, 1);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setRecordsToShow((prev) => Math.min(prev + 2, historyDocumentList.length));
    }
  };

  const handleScrollNote = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      setRecordsToShowNote((prev) => Math.min(prev + 3, historyDocumentList.length));
    }
  };

  const displayedRecords = historyDocumentList.slice(0, recordsToShow);
  const displayedRecordsNote = invalidReasonList.slice(0, recordsToShowNOte);

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
    const direction = sort.key === column ? sort.value === "desc" ? "asc" : "desc" : "asc";
    setSort({ key: column, value: direction });
    setIsRotated(!isRotated); // Toggle the class on click
  };

  const handleInvalidReason = async (id) => {
    setIsLoading(true);
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
    { uri: `${process.env.REACT_APP_API}/file/${showUserFolderName}/${selectDocumentFileName}` },
  ];

  const HandleDownloadFile = (data) => {
    const filePath = data.filepath;
    const fileName = data.filename;
    const fileExtension = fileName.split('.').pop().toLowerCase();

    if (fileExtension === 'pdf') {
      const fileUrl = `${process.env.REACT_APP_API}/file/${showUserFolderName}/${fileName}`
      // Fetch the PDF file as a Blob
      fetch(fileUrl)
        .then(response => response.blob()) // Convert the response to a Blob
        .then(blob => {
          // Create a URL for the Blob
          const blobUrl = URL.createObjectURL(blob);

          // Create a temporary link to download the Blob
          const tempLink = document.createElement('a');
          tempLink.href = blobUrl;
          tempLink.download = fileName;

          // Append the link to the body and trigger the download
          document.body.appendChild(tempLink);
          tempLink.click();

          // Clean up by removing the temporary link
          document.body.removeChild(tempLink);
          URL.revokeObjectURL(blobUrl); // Release the object URL after the download
        })
        .catch(error => {
          console.error('Error downloading PDF:', error);
        });
    } else {
      const tempLink = document.createElement('a');
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

  const handleChange = (e) => {
    const value = e.target.value;
    let isValid = value.includes('.');
    if (isValid) {
      setContractNo(value);
    } else {
      setContractNo(value);
      setFlashMessage({
        type: "error",
        message: "Le num du contrat doit contenir au moins un point (.)",
      });
    }
  };

  return (
    <Fragment>
      <style> {` button.btn.btn-primary  { background-color: ${localStorage.getItem('button_color') ? JSON.parse(localStorage.getItem('button_color')) : "#e84455"} !Important};`} </style>

      <SidePanel sidebarLogo={(logoImageShow == "" || logoImageShow == null || logoImageShow == undefined) ? logo : `${process.env.REACT_APP_IMAGE_URL}/${logoImageShow}`} />
      <div className="dashboard-main-content insurers-dashboard" style={{ backgroundColor: rightPanelThemeColor }}>
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
            <div className="d-flex align-items-center check-status">
              <div className="d-flex align-items-center check-status" style={{ paddingRight: "10px" }}>
                <p className="m-0">Etat du chantier : </p>
                <div className="status">{showUserDocumentData?.site_status === "on_site" ? "En cours de chantier" : "Fin de chantier"}</div>
              </div>
              <p className="m-0">Statut : </p>
              <div className="status">
                {
                  showUserDocumentData?.status === "to_be_checked" ? t("toBeCheckedLabel") :
                  showUserDocumentData?.status === "validated" ? t("validatedLabel") :
                  showUserDocumentData?.status === "transfer_to_manager" ? "Transfert au Gestionnaire" :
                  showUserDocumentData?.status === "transfer_to_broker" ? "Transfert au Courtier" :
                  showUserDocumentData?.status === "formal_notice" ? "Mise en demeure" : t("invalidLabel")
                }
              </div>
            </div>
          </div>

          <div className="detail-header">
            <div className="d-flex gap-2">
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
            <div className="d-sm-flex align-items-center gap-3">
              <div>
                <Form.Select aria-label="Etat du chantier" style={{ minHeight: "30px" }} value={sendToFileStatus} onChange={(e) => handleSendFileShow(e.target.value)}>
                  <option value="" disabled selected>Envoyer à</option>
                  <option value="transfer_to_manager">Transfert au Gestionnaire</option>
                  <option value="transfer_to_broker">Transfert au Courtier</option>
                  <option value="formal_notice">Mise en demeure</option>
                </Form.Select>
              </div>
              <div className="add-document mb-sm-0 mb-2 mt-sm-0 mt-2">
                <Link onClick={handleShow}>{t("addDocumentLabel")}</Link>
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
                    {/* step 1 */}

                    <div className="step-1">
                      <div className="div">
                        <div className="step-2">
                          <h2>Ajouter un document au dossier <span>*</span></h2>
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
                                {t("documentsAcceptedLabel")}: mot, exceller, pdf, PowerPoint
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

                                  <Link onClick={() => handleRemoveFile(index)}>
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
                      disabled={!fileList.length > 0}
                      onClick={HandleAddDocument}
                    >
                      Suivant
                    </button>
                  </div>
                </Offcanvas>
              </div>

              {/* Check Document */}
              <div className="check-document">
                {/* Location ‘ Insurer ’ / Folders / In a folder Hide the link to check documents for the Insurer for the time being */}
                {/* <Link onClick={handleCheckShow}>Vérifier le document</Link> */}
                <Offcanvas
                  className="add-folder-panel check-document-panel"
                  placement={"end"}
                  show={showCheck}
                  onHide={() => handleCheckClose()}
                >
                  <Offcanvas.Header closeButton>
                    <div className="doc-header">
                      <p className="m-0">Vérification dossier {showUserDocumentData?.folder_name}</p>
                      <div className="right-part">
                        <p className="m-0">
                          Dernière sauvegarde - {showUserDocumentData?.last_updated}
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
                          Valider la vérification
                        </Button>
                      </div>
                    </div>
                  </Offcanvas.Header>
                  <Offcanvas.Body>
                    <div className="top-header d-md-flex justify-content-between align-items-center">
                      <Form.Select
                        className="mb-3 mb-lg-0"
                        aria-label="statusSelectAria"
                        value={selectDocumentId}
                        onChange={(e) => handleDocChange(e)}
                      >
                        {showUserDocumentFileData?.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.filename}
                          </option>
                        ))}
                      </Form.Select>
                      <MissingDocument
                        selectDocumentId={selectDocumentId}
                        selectDocumentFileName={selectDocumentFileName}
                      />
                    </div>

                    <div className="side-by-side-panel">
                      <div className="left-panel">
                        <div className="inner-detail">
                          <div className="header-part">
                            <div className="div">
                              <span>Attestation</span>Police {selectDocumentFileName}
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
                                <Dropdown.Item onClick={() => handleShowDeleteModal()}>
                                  Supprimer
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                          <div className="main-part">
                            <div className="pdf-wrapper">
                              <DocViewer style={{ height: '600px', width: '100%' }} documents={docs} pluginRenderers={DocViewerRenderers} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="right-panel">
                        <div className="inner-detail">
                          <div className="header-part">
                            Vérification document
                          </div>
                          <div className="main-part">
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
                            <p className="mb-4">
                              Compléter les informations relatives au document
                              ci-contre.
                            </p>
                            <Form.Label>Statut du document <span>*</span></Form.Label>
                            <Form.Select
                              className="mb-3"
                              aria-label="statusSelectAria"
                              value={editUserStatus} // Bind the value to editUserStatus
                              onChange={(e) => handleStatusChange(e.target.value)}
                            >
                              <option value="to_be_checked">{t("toBeCheckedLabel")}</option>
                              <option value="verified">{t("verified")}</option>
                              <option value="invalid">{t("invalidLabel")}</option>
                            </Form.Select>
                            <InvalidDocument
                              showmodal={showmodal}
                              handleModalClose={handleModalClose}
                              selectDocumentId={selectDocumentId}
                              selectDocumentFileName={selectDocumentFileName}
                            />

                            <Form.Label>
                              Type de document <span>*</span>
                            </Form.Label>
                            <Form.Select
                              aria-label="Choisir un type de document"
                              value={selectDocumentType}
                              onChange={handleDocumentTypeChange}
                            >
                              <option value="" disabled>Choisir un type de document</option>
                              {documentTypeList?.map((doctype) => (
                                <option key={doctype.id} value={doctype.id}>
                                  {doctype.name}
                                </option>
                              ))}
                            </Form.Select>
                            {currentFileIndex < userDocumentFileDataChanges.length - 1 ? (
                              <>
                                <Button className="mx-w-320 btn btn-primary mt-3" onClick={(e) => handleSaveNext(e)}>
                                  Enregistrer et Suivant
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button className="mx-w-320 btn btn-primary mt-3" onClick={(e) => handleSaveDocSingle(e)}>
                                  Enregistrer
                                </Button>
                              </>
                            )}
                            <div className="d-lg-flex justify-content-between align-items-center mt-auto">
                              <Link className="link-wrap d-block d-lg-inline" onClick={handlePrevious}>
                                Document précédent
                              </Link>
                              <Link className="link-wrap d-block d-lg-inline" onClick={handleNext}>
                                Document suivant
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Offcanvas.Body>
                </Offcanvas>
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
          {/* Information Tab */}
          <Tab eventKey="contactinfo" title="Information dossier">
            {/* <h2>Informations dossier</h2> */}
            {isLoading ? <Loading /> :
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
                    <Form.Group className="mb-4 mx-w-320" controlId="exampleForm.ControlInput1">
                      <Form.Label>N° de dossier <span>*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="N° de dossier"
                        name="folderName"
                        defaultValue={showUserDocumentData?.folder_name || ""}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4 mx-w-320" controlId="exampleForm.ControlInput1">
                      <Form.Label>Numéro de contrat</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Numéro de contrat"
                        name="contract_no"
                        value={contractNo}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4 mx-w-320" controlId="names">
                      <Form.Label className="d-block">Date de début du site</Form.Label>
                      <DatePicker
                        placeholderText="Selectionner une date de début du site"
                        selected={startDate ? getFormattedDate(startDate) : ""}
                        onChange={(date) => setStartDate(formatDate(date))}
                        dateFormat="dd/MM/yyyy"
                        locale={fr}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4 mx-w-320" controlId="names">
                      <Form.Label className="d-block">Date de début estimée</Form.Label>
                      <DatePicker
                        placeholderText="Selectionner une date de début estimée"
                        selected={estimatedStartDate ? getFormattedDate(estimatedStartDate) : ""}
                        onChange={(date) => setEstimatedStartDate(formatDate(date))}
                        dateFormat="dd/MM/yyyy"
                        locale={fr}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4 mx-w-320" controlId="names">
                      <Form.Label className="d-block">Date d'achèvement estimée</Form.Label>
                      <DatePicker
                        placeholderText="Selectionner une date d'achèvement estimée"
                        selected={estimatedCompletionDate ? getFormattedDate(estimatedCompletionDate) : ""}
                        onChange={(date) => setEstimatedCompletionDate(formatDate(date))}
                        dateFormat="dd/MM/yyyy"
                        locale={fr}
                      />
                    </Form.Group>
                    
                  </div>
                  <div className="flex-fill" style={{ minWidth: "300px" }}>
                    <Form.Group className="mb-4 mx-w-320" controlId="formBasicEmail">
                      <Form.Label>Nom du preneur d'assurance</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nom du preneur d'assurance"
                        value={policyholderName}
                        onChange={(e) => setPolicyholderName(e.target.value)}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4 mx-w-320" controlId="exampleForm.ControlInput1">
                      <Form.Label>coût estimé du chantier</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez le coût estimé du site"
                        name="estimated_site_cost"
                        value={estimatedSiteCost}
                        onChange={(e) => {
                          const value = e.target.value;
                          const onlyNumbers = value.replace(/[^0-9.]/g, '');
                          setEstimatedSiteCost(onlyNumbers);
                        }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4 mx-w-320" controlId="exampleForm.ControlInput1">
                      <Form.Label>Coût final du chantier</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez le coût final du site"
                        name="final_site_cost"
                        value={finalSiteCost}
                        onChange={(e) => {
                          const value = e.target.value;
                          const onlyNumbers = value.replace(/[^0-9.]/g, '');
                          setFinaldSiteCost(onlyNumbers);
                        }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4 mx-w-320" controlId="names">
                      <Form.Label className="d-block">Date d'achèvement définitive</Form.Label>
                      <DatePicker
                        placeholderText="Selectionner une date d'achèvement définitive"
                        selected={endDate ? getFormattedDate(endDate) : ""}
                        onChange={(date) => setEndDate(formatDate(date))}
                        dateFormat="dd/MM/yyyy"
                        locale={fr}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-4 mx-w-320" controlId="formBasicEmail">
                      <Form.Label>Choisir un Courtier</Form.Label>
                      <Form.Select
                        className="full-width mb-3"
                        aria-label={"statusSelectAria"}
                        value={selectBroker}
                        onChange={handleBrokerChange}
                      >
                        <option value="" disabled>Choisir un Courtier</option>
                        {brokerList?.map((broker) => (
                          <option value={broker.id}>{broker.first_name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                </div>
                <Button className="btn-secondary" type="submit">
                  Valider
                </Button>
                <Button
                  className="btn-transperant ms-2"
                  onClick={() => navigate("/insurers-file")}
                >
                  Annuler
                </Button>
              </Form>}
          </Tab>

          {/* Other Tab */}
          <Tab eventKey="otherdocument" title={`Documents (${totalRecordOther || 0})`}>
            <div className="table-wrapper mt-16 p-0">
            <div class="d-md-flex align-items-center gap-2 justify-content-between">
              {/* <h2 class="m-md-0 mb-3">Documents ({totalRecordOther})</h2> */}
            </div>
              {isLoading ? <Loading /> :
                <div className="table-wrap mt-24">
                  <Table responsive hover>
                    <thead>
                      <tr>
                        {selectedOtherDocColumns.includes("fileNameLabe") &&
                          <th>
                            <div className="d-flex align-items-center">
                              <span>{t("fileNameLabe")}</span>
                              <Link
                                className={`sorting-icon ms-2`}
                                onClick={() => handleClickRotate("filename")}
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
                        {selectedOtherDocColumns.includes("speakerLabel") && (
                          <th className="select-drop elips-dropdown">
                            <div className="d-flex align-items-center">
                              <div>
                                <Form.Select
                                  aria-label="statusSelectAria"
                                  value={selectSpeakerId}
                                  onChange={handleTableSpeakerChange}
                                >
                                  <option value="">{t("speakerLabel")}</option>
                                  {speakerDropDownList?.map((speaker) => (
                                    <option key={speaker.id} value={speaker.id}>
                                      {speaker.company_name +
                                        " - " +
                                        speaker.siren_number}
                                    </option>
                                  ))}
                                </Form.Select>
                              </div>
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
                        )}
                        {selectedOtherDocColumns.includes("Type de document") &&
                          <th className="select-drop elips-dropdown">
                            <div className="d-flex align-items-center">
                              <div>
                                <Form.Select
                                  aria-label="Choisir un type de document"
                                  value={selectDocumentType}
                                  onChange={handleDocumentTypeChange}
                                >
                                  <option value="">Type de document</option>
                                  {documentTypeList?.map((doctype) => (
                                    <option key={doctype.id} value={doctype.id}>
                                      {doctype.name}
                                    </option>
                                  ))}
                                </Form.Select>
                              </div>
                              <div>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("docType.name")}
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
                        {selectedOtherDocColumns.includes("status") &&
                          <th className="select-drop elips-dropdown">
                            <div className="d-flex align-items-center">
                              <div>
                                <Form.Select
                                  aria-label="statusSelectAria"
                                  value={editUserStatus}
                                  onChange={(e) => handleStatusChange(e.target.value)}
                                >
                                  <option value="">{t("status")}</option>
                                  <option value="to_be_checked">{t("toBeCheckedLabel")}</option>
                                  <option value="verified">{t("verified")}</option>
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
                        {selectedOtherDocColumns.includes("Actions") && <th>Actions</th>}
                        <th style={{ textAlign: "right" }}>
                          <Link onClick={handleAddOtherColShow}>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 14 14"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="black" />
                            </svg>
                          </Link>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showOtherDocument?.length > 0 && selectedOtherDocColumns?.length > 0) ?
                        showOtherDocument?.map((data) => (
                          <tr onClick={() => data.status === 'invalid' && handleInvalidReason(data.id)}>
                            {selectedOtherDocColumns.includes("fileNameLabe") &&
                              <td>
                                <span className="text-elips">{data.filename}</span>
                              </td>
                            }
                            {selectedOtherDocColumns.includes("speakerLabel") &&
                              <td>
                                {data.speaker
                                  ? data.speaker?.company_name +
                                  " - " +
                                  data.speaker?.siren_number
                                  : "-"}
                              </td>
                            }
                            {selectedOtherDocColumns.includes("Type de document") && <td>{data.docType.name}</td>}
                            {selectedOtherDocColumns.includes("status") &&
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
                            }
                            {selectedOtherDocColumns.includes("Actions") &&
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
                                  {/* {data.status !== "verified" && */}
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
                                  {/* } */}
                                  <Link
                                    className="delete"
                                    href="/user-management"
                                    data-discover="true"
                                    title="Supprimer"
                                    onClick={(e) => { e.stopPropagation(); handleShowDeleteModal(); setShowDocumentId(data.id); }}
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
                            }
                            <td></td>
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
                </div>}
              {totalRecordOther > 10 &&
                <Paginations
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              }
            </div>
          </Tab>

          {/* Speakers Tab */}
          <Tab eventKey="speakerdocument" title={`Intervenants (${totalSpeaker || 0})`}>
            <div className="table-wrapper mt-10 p-0">
              <div class="d-md-flex align-items-center gap-2 justify-content-between">
                <h2 class="m-md-0 mb-3">
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
                  <div className="search-icon" style={{ cursor: "pointer" }} onClick={() => handleSearchChange(search, 1)}>
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
                        {selectedSpeakerColumns.includes("N° de SIRET") &&
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
                        }
                        {selectedSpeakerColumns.includes("Intervenant") &&
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
                        }
                        {selectedSpeakerColumns.includes("Dernière MaJ") &&
                          <th>
                            <div className="d-flex align-items-center">
                              <span>Dernière MaJ</span>
                              <div>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("updated_at")}
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
                        }
                        {selectedSpeakerColumns.includes("Doc. associés") &&
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
                        }
                        {selectedSpeakerColumns.includes("Doc. Manquants") &&
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
                        }
                        {selectedSpeakerColumns.includes("Actions") && <th>Actions</th>}
                        <th style={{ textAlign: "right" }}>
                          <Link onClick={handleAddSpeakerColShow}>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 14 14"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="black" />
                            </svg>
                          </Link>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(speakerList?.length > 0 && selectedSpeakerColumns.length > 0) ? (
                        speakerList?.map((data) => (
                          <tr>
                            {selectedSpeakerColumns.includes("N° de SIRET") && <td>{data.siren_number}</td>}
                            {selectedSpeakerColumns.includes("Intervenant") &&
                              <td>
                                <span className="text-elips">
                                  {data.company_name}
                                </span>
                              </td>
                            }
                            {selectedSpeakerColumns.includes("Dernière MaJ") && <td>{data.updated_at}</td>}
                            {selectedSpeakerColumns.includes("Doc. associés") && <td>{data.user_document_count}</td>}
                            {selectedSpeakerColumns.includes("Doc. Manquants") && <td>{data.missing_document_count}</td>}
                            {selectedSpeakerColumns.includes("Actions") &&
                              <td>
                                <div class="action-btn">
                                  <Link
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewShowSpeaker();
                                      setShowSpeakerId(data.id);
                                      setTotalSpeakerDocument(data.user_document_count);
                                      setTotalMissingDocument(data.missing_document_count);
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
                            }
                            <td></td>
                          </tr>
                        ))
                      ) : (
                        <tr style={{ textAlign: "center" }}>
                          <td colSpan="7">{t("NorecordsfoundLabel")}</td>
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
                />
              )}
            </div>
          </Tab>

          {/* Missing Document Tab */}
          <Tab eventKey="missingdocument" title={`Documents manquants (${totalMissingRecords || 0})`}>
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
                      <Offcanvas.Title>Ajouter un document manquants</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                      <div className="step-1">
                        <div className="div">
                          <div className="step-2">
                            <h2>Ajouter un document manquants <span>*</span></h2>
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
                                  {t("documentsAcceptedLabel")}: mot, exceller, pdf, PowerPoint
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
                        disabled={!fileList?.length > 0}
                        onClick={(e) => AddMissingDocument(e)}
                      >
                        Suivant
                      </button>
                    </div>
                  </Offcanvas>
                </div>
              </div>
              {isLoading ? <Loading /> :
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
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missingDocumentList?.length > 0 ?
                        missingDocumentList?.map((data) => (
                          <tr>
                            <td>{data.documentType.name}</td>
                            <td className="bold-font">{data.speaker.company_name != "" ? data.speaker.company_name : '-'}</td>
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
                                  <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 9H7V12H4V14H7V17H9V14H12V12H9V9ZM10 0H2C0.9 0 0 0.9 0 2V18C0 19.1 0.89 20 1.99 20H14C15.1 20 16 19.1 16 18V6L10 0ZM14 18H2V2H9V7H14V18Z" fill="black" />
                                  </svg>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))
                        : (
                          <tr style={{ textAlign: "center" }}>
                            <td colSpan='4'>{t("NorecordsfoundLabel")}</td>
                          </tr>
                        )}
                    </tbody>
                  </Table>
                </div>}
              {totalMissingRecords > 10 &&
                <Paginations
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              }
            </div>
          </Tab>

          {/* History Tab */}
          <Tab eventKey="history" title="Historique">
            {isLoading ? <Loading /> :
              <>
                <div className="mb-3 d-md-flex justify-content-between align-items-center">
                  {/* <h2 className="m-md-0 mb-3">Historique</h2> */}
                  {markIsReadCount > 0 &&
                    <button className="custom-btn" onClick={() => MarkHistoryAsReadAllDocument(id)}>
                      Marquer comme tout lu
                    </button>
                  }
                </div>

                <div
                  className="scroll-container" // Set a scrollable container
                  onScroll={handleScroll}
                  style={{
                    maxHeight: "240px", // Set container height
                    overflowY: "auto",  // Enable scrolling
                    scrollbarWidth: "thin"
                  }}
                >
                  {displayedRecords?.length > 0 ?
                    displayedRecords?.map((data) => (
                      <Fragment>
                        <div className="note-box mb-3">
                          <div className="d-flex justify-content-between align-items-center top-part">
                            <p className="m-0">{data.type == "note" ? "Note" : "Invalide"}</p>
                            <p className="m-0 create-date">créé le {data.created_on}</p>
                          </div>
                          <div className="inner-box" style={{ backgroundColor: data.is_read === 0 ? "#b0f0fa" : "#e3f0f2" }}>
                            <div className="d-md-flex justify-content-between align-items-center mb-2">
                              <div className="d-flex align-items-center mb-3">
                                {data.type != "note" &&
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
                                }
                                <div className="file-names">{data.user_document_filename}</div>
                              </div>
                              {data.is_read != 1 &&
                                <button className="custom-btn" onClick={() => MarkHistoryAsReadDocument(data.id)}>
                                  Marquer Comme lu
                                </button>
                              }
                            </div>
                            <p className="">
                              {data.reason}
                            </p>
                          </div>
                        </div>
                      </Fragment>
                    ))
                    : (
                      <div className="inner-box">
                        {t("NorecordsfoundLabel")}
                      </div>
                    )}
                </div></>}
          </Tab>
        </Tabs>
      </div>

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
                <h2>Remplacer un document <span>*</span></h2>
                {showReplace && <div className="replace-document mt-32">
                  Document remplacé :{" "}
                  <span>{showDocumentName}</span>
                </div>}
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
                      <span className="browse-link">{t("browsemyfilesLabel")}</span>
                    </p>
                    <span>
                      {t("documentsAcceptedLabel")}: mot, exceller, pdf, PowerPoint
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
            disabled={!fileList.length > 0}
            onClick={(e) => HandleUpdateDocument(e)}
          >
            Suivant
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
            <h2>{t("brokerlabel")}: {viewRowData?.user_document?.broker ? viewRowData?.user_document?.broker?.first_name + " " + viewRowData?.user_document?.broker?.last_name : "Sans"}</h2>
            <div className="table-wrapper mt-16 p-0">
              <div className="table-wrap mt-24">
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>{t("fileNameLabe")}</th>
                      <th>{t("status")}</th>
                      <th>{t("createdLabel")}</th>
                      {activeTab !== "otherdocument" && <th><span>{t("speakerLabel")} </span></th>}
                      <th>Télécharger</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        {viewRowData?.filename}
                      </td>
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
                      <td>
                        {viewRowData?.created_at}
                      </td>
                      {activeTab !== "otherdocument" && <td>
                        {viewRowData?.speaker ? viewRowData?.speaker?.company_name + (viewRowData?.speaker?.siren_number ? " - " + viewRowData?.speaker?.siren_number : "") : ""}
                      </td>}
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

      {/* Validation Document Confirmation Popup */}
      <Modal className="final-modal" show={showFinalModal} onHide={handleCloseFinalModal}>
        <Modal.Header closeButton>
          <Modal.Title>Transmettre dossier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h2 className="mb-3">Finalisation du dossier {showUserFolderName}</h2>
          <p>En finalisant le dossier, vous garantissez avoir effectuer les informations suivantes:</p>
          <ul>
            <li>Renseigner tous les champs obligatoires</li>
            <li>Renseigner un maximum de champs optionnels</li>
            <li>Vérifier la validité de chaque document</li>
            <li>Vérifier la présence de tous les documents nécessaires au traitement du dossier</li>
          </ul>
          <p className="mb-5">Après confirmation, les éléments du dossier seront envoyés au système d'information ACTURIS.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button className="cancel-btn" variant="primary" onClick={handleCloseFinalModal}>
            Annuler
          </Button>
          <Button variant="primary" onClick={ValidateDocumentFile}>
            Confirm and finalize
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Document Confirmation Popup */}
      <Modal className="final-modal" show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title><h2>Confirmation</h2></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Etes-vous sûr de vouloir supprimer le fichier?</p>
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

      {/* Delete Speaker Confirmation Popup */}
      <Modal className="final-modal" show={showDeleteSpeakerModal} onHide={handleCloseDeleteSpeakerModal}>
        <Modal.Header closeButton>
          <Modal.Title><h2>Confirmation</h2></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Etes-vous sûr de vouloir supprimer le intervenants?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button className="cancel-btn" variant="primary" onClick={handleCloseDeleteSpeakerModal}>
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
                onScroll={handleScrollNote}
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  scrollbarWidth: "thin"
                }}
              >
                <div style={{ height: "400px" }}>
                  {displayedRecordsNote?.map((data) => (
                    <Fragment>
                      <div className="note-box mb-3">
                        <div className="d-flex justify-content-between align-items-center top-part">
                          <p className="m-0">{data.type == "note" ? "Note" : "Invalide"}</p>
                          <p className="m-0 create-date">créé le {data.created_on}</p>
                        </div>
                        <div className="inner-box">
                          <div className="d-md-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center mb-3">
                              {data.type != "note" &&
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
                              }
                              <div className="file-names">{data.user_document_filename}</div>
                            </div>
                          </div>
                          <p className="">
                            {data.reason}
                          </p>
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            )
              :
              (
                <div>
                  {t("NorecordsfoundLabel")}
                </div>
              )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleInvalidReasonModalClose} >
            Fermer
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
                    value={speakerDetail?.siren_number ? speakerDetail?.siren_number : "-"}
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
                    value={speakerDetail?.company_name ? speakerDetail?.company_name : "-"}
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
                    value={speakerDetail?.address ? speakerDetail?.address : "-"}
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
                        value={speakerDetail?.postcode ? speakerDetail?.postcode : "-"}
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
                        value={speakerDetail?.city ? speakerDetail?.city : "-"}
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
            <Tab eventKey="documents" title={`Documents (${totalSpeakerDocument})`}>
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
                                        fill="#00366B"
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
            <Tab eventKey="documentType" title={`Documents manquants (${totalMissingDocument})`}>
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
                                  <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 9H7V12H4V14H7V17H9V14H12V12H9V9ZM10 0H2C0.9 0 0 0.9 0 2V18C0 19.1 0.89 20 1.99 20H14C15.1 20 16 19.1 16 18V6L10 0ZM14 18H2V2H9V7H14V18Z" fill="black" />
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
                </div>
              )}
            </Tab>
          </Tabs>
        </Offcanvas.Body>
      </Offcanvas>

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
                Object.fromEntries(Object.keys(prev).map((key) => [key, isChecked]))
              );
            }}
          />

          {/* Individual Column Checkboxes */}
          {Object.keys(speakerModalColumns).map((key) => (
            <Form.Check
              key={key}
              id={`checkbox-${key}`}
              label={<label style={{ cursor: "pointer" }} htmlFor={`checkbox-${key}`}>{t(key)}</label>}
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
            checked={Object.values(otherDocModalColumns).every((value) => value)} // All true
            onChange={(e) => {
              const isChecked = e.target.checked;
              setOtherDocModalColumns((prev) =>
                Object.fromEntries(Object.keys(prev).map((key) => [key, isChecked]))
              );
            }}
          />

          {/* Individual Column Checkboxes */}
          {Object.keys(otherDocModalColumns).map((key) => (
            <Form.Check
              key={key}
              id={`checkbox-${key}`}
              label={<label style={{ cursor: "pointer" }} htmlFor={`checkbox-${key}`}>{t(key)}</label>}
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
      <Modal className='missing-doc-modal' show={showSendFileChange} onHide={() => setShowSendFileChange(true)}>
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
    </Fragment>
  );
};

export default FileDetails;
