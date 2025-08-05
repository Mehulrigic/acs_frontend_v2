import React, { Fragment, useEffect, useState } from 'react';
import "./AdminDashboard.css";
import SidePanel from '../../Components/SidePanel/SidePanel';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Loading from '../../Common/Loading';
import logo from "../../acs-logo.png";
import DashboardManagementService from '../../API/DashboardManagement/DashboardManagementService';
import { Row, Col } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// import StatisticsData from '../../Components/StatisticsData/StatisticsData';
// import { Form, Tab, Table, Tabs } from 'react-bootstrap';
// import Paginations from '../../Components/Paginations/Paginations';
// import Modal from "react-bootstrap/Modal";
// import Button from "react-bootstrap/Button";
// import { BsPatchExclamation } from 'react-icons/bs';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [logoImageShow, setLogoImageShow] = useState("");
  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
  const [taskStatisticsData, setTaskStatisticsData] = useState({});
  const [aptChartData, setAptChartData] = useState([]);
  const [atotChartData, setAtotChartData] = useState([]);
  const [treatedChartData, setTreatedChartData] = useState([]);


  const [showFilterForm, setShowFilterForm] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filters, setFilters] = useState({
    date: "",
    assureur: "",
    courtier: "",
    gestionnaire: "",
    etatDossier: "",
    risques: "",
    preneur: "",
  });

  // const [isRotated, setIsRotated] = useState(false);
  // const [sort, setSort] = useState({ key: "created_at", value: "desc" });
  // const [showFolderId, setShowFolderId] = useState("");

  // const [showDeleteModal, setShowDeleteModal] = useState(false);
  // const handleShowDeleteModal = () => setShowDeleteModal(true);
  // const handleCloseDeleteModal = () => setShowDeleteModal(false);

  // const [showAddcol, setShowAddcol] = useState(false);
  // const handleAddcolClose = () => setShowAddcol(false);
  // const handleAddcolShow = () => setShowAddcol(true);

  // const [modalColumns, setModalColumns] = useState({
  //   fileNumber: true,
  //   client: true,
  //   "Nom du preneur d'assurance": true,
  //   brokerlabel: true,
  //   "Date de création": true,
  //   lastModifiedDateLabel: true,
  //   "Date de début de chantier": true,
  //   "Date de fin de chantier": true,
  //   status: true,
  //   "Etat du chantier": true,
  // });

  // const [selectedColumns, setSelectedColumns] = useState(
  //   Object.keys(modalColumns).filter((key) => modalColumns[key])
  // );

  // const [startDate, setStartDate] = useState(null);
  // const [selectedMonth, setSelectedMonth] = useState("all");
  // const [userDocumentData, setUserDocumentData] = useState([]);
  // const [statisticsData, setStatisticsData] = useState({});
  // const [editUserStatus, setEditUserStatus] = useState("");
  // const [editUserSiteStatus, setEditUserSiteStatus] = useState("");
  // const [deletePermission, setDeletePermission] = useState(false);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);
  // const [totalRecords, setTotalRecords] = useState(0);
  // const [activeTab, setActiveTab] = useState('toProcess');

  useEffect(() => {
    const userRole = JSON.parse(localStorage.getItem("userRole"));
    const token = localStorage.getItem("authToken");
    // const can_delete_folder = localStorage.getItem("can_delete_folder");
    // setDeletePermission(can_delete_folder == 1 ? true : false);
    if (token && userRole.includes("Administrateur")) {
      const logo_image = JSON.parse(localStorage.getItem("logo_image"));
      const right_panel_color = JSON.parse(localStorage.getItem("right_panel_color"));
      setRightPanelThemeColor(right_panel_color);
      setLogoImageShow(logo_image);
      // UserDocument(sort, currentPage, editUserStatus, editUserSiteStatus,activeTab);
      GetTaskStatistics();
      GetAptAtotFromTransferHistory();
    } else {
      navigate("/");
    }
  }, []);

  // useEffect(() => {
  //   if (deletePermission) {
  //     setModalColumns((prev) => ({
  //       ...prev,
  //       Action: true,
  //     }));
  //     const newSelectedColumns = Object.keys(modalColumns).filter(
  //       (key) => modalColumns[key]
  //     );
  //     newSelectedColumns.push("Action");
  //     setSelectedColumns(newSelectedColumns);
  //   }
  // }, [deletePermission]);

  // useEffect(() => {
  //   const userRole = JSON.parse(localStorage.getItem("userRole"));
  //   const token = localStorage.getItem("authToken");
  //   if(token && userRole.includes("Administrateur")) {
  //     if (selectedMonth != "custom") {
  //       GetStatistics();
  //     }
  //   } else {
  //     navigate("/");
  //   }
  // }, [selectedMonth]);

  // useEffect(() => {
  //   if (startDate) {
  //     GetStatistics();
  //   }
  // }, [startDate]);

  // const UserDocument = async (sort, page = 1, status, siteStatus,key) => {
  //   setIsLoading(true);
  //   try {
  //     var userData = {
  //       status: status,
  //       site_status: siteStatus,
  //       sort: {
  //         key: sort.key,
  //         value: sort.value
  //       },
  //       page,
  //       filter_type:key
  //     }
  //     const response = await DashboardManagementService.user_document(userData);
  //     if (response.data.status) {
  //       setIsLoading(false);
  //       setUserDocumentData(response.data.documents.data);
  //       setCurrentPage(response.data.documents.meta.current_page);
  //       setTotalPages(response.data.documents.meta.last_page);
  //       setTotalRecords(response.data.documents.meta.total);
  //       localStorage.setItem("admin_dashboard", response.data.documents.meta.total)
  //     }
  //   } catch (error) {
  //     setIsLoading(false);
  //     console.log(error);
  //   }
  // };

  // const formatDate = (dateString) => {
  //   if(dateString){
  //     const date = new Date(dateString);
  //     const day = String(date.getDate()).padStart(2, '0');
  //     const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  //     const year = date.getFullYear();
  //     return `${day}/${month}/${year}`;
  //   } else {
  //     return "";
  //   }
  // };

  // const getFormattedDate = (dateString) => {
  //   const [day, month, year] = dateString.split("/");
  //   return new Date(`${month}/${day}/${year}`); // Convert to MM/DD/YYYY format
  // };

  // const GetStatistics = async () => {
  //   try {
  //     var userData = {
  //       filter_by: selectedMonth,
  //     }
  //     if (selectedMonth === "custom") {
  //       userData.filter_date = startDate ? startDate : "";
  //     }
  //     const response = await DashboardManagementService.get_statistics(userData);
  //     if (response.data) {
  //       setStatisticsData(response.data);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const GetTaskStatistics = async () => {
    setIsLoading(true);
    try {

      const response = await DashboardManagementService.get_task_statistics();

      if (response.data) {
        setIsLoading(false);
        setTaskStatisticsData(response.data.dashboard);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const GetAptAtotFromTransferHistory = async () => {
    setIsLoading(true);
    try {

      const response = await DashboardManagementService.apt_atot_stats();

      if (response.data) {
        setIsLoading(false);
        const dashboard = response.data.dashboard;

        const transform = (obj) => [
          { time: "0", value: 0 },
          ...Object.entries(obj || {}).map(([key, value]) => ({
            time: key,
            value: value,
          })),
        ];

        const aptData = transform(dashboard.APT);
        const atotData = transform(dashboard.ATOT);
        const treatedData = transform(dashboard.TREATED_BY_LAST_ACTION_DATE);

        setAptChartData(aptData);
        setAtotChartData(atotData);
        setTreatedChartData(treatedData);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  // const handleStatusChange = (status) => {
  //   setEditUserStatus(status);
  //   UserDocument(sort, 1, status, editUserSiteStatus,activeTab);
  // };

  // const handleSiteStatusChange = (status) => {
  //   setEditUserSiteStatus(status);
  //   UserDocument(sort, 1, editUserStatus, status,activeTab);
  // };

  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  //   UserDocument(sort, page, editUserStatus, editUserSiteStatus,activeTab); // Fetch data for the selected page
  // };

  // const handleClickRotate = (column) => {
  //   const direction = sort.key === column ? sort.value === "desc" ? "asc" : "desc" : "asc";
  //   setSort({ key: column, value: direction });
  //   setIsRotated(!isRotated); // Toggle the class on click
  // };

  // const handleCheckboxChange = (key) => {
  //   setModalColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  // };

  // const handleAddcolSubmit = () => {
  //   const newSelectedColumns = Object.keys(modalColumns).filter(
  //     (key) => modalColumns[key]
  //   );
  //   setSelectedColumns(newSelectedColumns);
  //   handleAddcolClose(); // Close the modal
  // };

  // const HandleDeleteDocumentFile = async () => {
  //   try {
  //     const response = await DashboardManagementService.delete_user_document(showFolderId);
  //     if (response.data.status) {
  //       handleCloseDeleteModal();
  //       setShowFolderId("");
  //       UserDocument(sort, currentPage, editUserStatus, editUserSiteStatus,activeTab);
  //       GetStatistics();
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const handleTabSelect = (key) => {
  //   setActiveTab(key);
  //   UserDocument(sort, currentPage, editUserStatus, editUserSiteStatus,key);
  // };

  const toggleFilter = () => {
    setShowFilterForm(!showFilterForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleReset = () => {
    setFilters({
      date: "",
      assureur: "",
      courtier: "",
      gestionnaire: "",
      etatDossier: "",
      risques: "",
      preneur: "",
    });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: "12px 16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
            {item.value} Demandes
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: item.stroke,
            }}
          >
            Temps: {item.payload.time}
          </p>
        </div>
      );
    }
    return null;
  }

  const ChartSection = ({ title, data, color }) => {
    const maxValue = Math.max(...data.map((d) => d.value));
    const yMax = Math.ceil(maxValue);

    return (
      <div className="activity-card mb-4">
        <div
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            padding: 24,
          }}
        >
          <h3
            style={{
              marginBottom: 10,
              fontSize: 15,
              color: "#2f2e41",
            }}
          >
            {title}
          </h3>
          {isLoading ? (
            <Loading />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={data}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, yMax]} />
                <Tooltip content={CustomTooltip} />
                <Legend
                  wrapperStyle={{ marginBottom: "16px" }}
                  iconType="circle"
                  align="right"
                  verticalAlign="top"
                  formatter={() => title}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={title}
                  stroke={color}
                  strokeWidth={3}
                  dot={{
                    r: 6,
                    strokeWidth: 2,
                    stroke: "#fff",
                    fill: color,
                  }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      <style> {` button.btn.btn-primary  { background-color: ${localStorage.getItem('button_color') ? JSON.parse(localStorage.getItem('button_color')) : "#e84455"} !Important};`} </style>

      <SidePanel sidebarLogo={(logoImageShow == "" || logoImageShow == null || logoImageShow == undefined) ? logo : `${process.env.REACT_APP_IMAGE_URL}/${logoImageShow}`} />

      <div className="dashboard-main-content admin-dashboard" style={{ backgroundColor: rightPanelThemeColor }}>
        <div className="top-header">
          <h4>{t("dashboard")}</h4>
          <div className="mt-3 d-flex justify-content-between align-items-center">
            <h1 className="m-0">{t("dashboard")}</h1>
          </div>
        </div>
        {isLoading ? <Loading /> :
          <>
            {/* <StatisticsData
              statisticsData={statisticsData}
              startDate={startDate}
              setStartDate={setStartDate}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              getFormattedDate={getFormattedDate}
              formatDate={formatDate}
            /> */}

            {/* Top Filter */}
            <div className="top-global-filter">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="mb-2">Cumulatives filters</h2>
                <div className="filter-toggle" onClick={toggleFilter}>
                  {showFilterForm ? (
                    <div className="show-top-filter-icon">
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
                        />
                        <path
                          d="M33.334 22.9167H16.6673C16.1148 22.9167 15.5849 23.1362 15.1942 23.5269C14.8035 23.9176 14.584 24.4476 14.584 25.0001C14.584 25.5526 14.8035 26.0825 15.1942 26.4732C15.5849 26.8639 16.1148 27.0834 16.6673 27.0834H33.334C33.8865 27.0834 34.4164 26.8639 34.8071 26.4732C35.1978 26.0825 35.4173 25.5526 35.4173 25.0001C35.4173 24.4476 35.1978 23.9176 34.8071 23.5269C34.4164 23.1362 33.8865 22.9167 33.334 22.9167Z"
                          fill="#464255"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="hide-top-filter-icon">
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
                        />
                        <path
                          d="M33.334 22.9168H27.084V16.6668C27.084 16.1143 26.8645 15.5844 26.4738 15.1937C26.0831 14.803 25.5532 14.5835 25.0007 14.5835C24.4481 14.5835 23.9182 14.803 23.5275 15.1937C23.1368 15.5844 22.9173 16.1143 22.9173 16.6668V22.9168H16.6673C16.1148 22.9168 15.5849 23.1363 15.1942 23.527C14.8035 23.9177 14.584 24.4476 14.584 25.0002C14.584 25.5527 14.8035 26.0826 15.1942 26.4733C15.5849 26.864 16.1148 27.0835 16.6673 27.0835H22.9173V33.3335C22.9173 33.886 23.1368 34.4159 23.5275 34.8066C23.9182 35.1973 24.4481 35.4168 25.0007 35.4168C25.5532 35.4168 26.0831 35.1973 26.4738 34.8066C26.8645 34.4159 27.084 33.886 27.084 33.3335V27.0835H33.334C33.8865 27.0835 34.4164 26.864 34.8071 26.4733C35.1978 26.0826 35.4173 25.5527 35.4173 25.0002C35.4173 24.4476 35.1978 23.9177 34.8071 23.527C34.4164 23.1363 33.8865 22.9168 33.334 22.9168Z"
                          fill="#464255"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              {showFilterForm && (
                <Form className="p-2 w-100">
                  <Row className="mb-3">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Date</Form.Label>
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date) => setSelectedDate(date)}
                          className="form-control"
                          placeholderText="Select Date"
                          dateFormat="dd/MM/yyyy"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Assureur</Form.Label>
                        <Form.Select
                          name="assureur"
                          value={filters.assureur}
                          onChange={handleChange}
                        >
                          <option value="">Tous</option>
                          <option value="axa">AXA</option>
                          <option value="allianz">Allianz</option>
                          <option value="generali">Generali</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Courtier</Form.Label>
                        <Form.Select
                          name="courtier"
                          value={filters.courtier}
                          onChange={handleChange}
                        >
                          <option value="">Tous</option>
                          <option value="broker1">Courtier 1</option>
                          <option value="broker2">Courtier 2</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Gestionnaire ACS</Form.Label>
                        <Form.Select
                          name="gestionnaire"
                          value={filters.gestionnaire}
                          onChange={handleChange}
                        >
                          <option value="">Tous</option>
                          <option value="acs1">ACS 1</option>
                          <option value="acs2">ACS 2</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>État du dossier</Form.Label>
                        <Form.Select
                          name="etatDossier"
                          value={filters.etatDossier}
                          onChange={handleChange}
                        >
                          <option value="">Tous</option>
                          <option value="ouvert">Ouvert</option>
                          <option value="fermé">Fermé</option>
                          <option value="en_attente">En attente</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Risques</Form.Label>
                        <Form.Select
                          name="risques"
                          value={filters.risques}
                          onChange={handleChange}
                        >
                          <option value="">Tous</option>
                          <option value="do">DO</option>
                          <option value="rcd">RCD</option>
                          <option value="trc">TRC</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Preneur d’assurance</Form.Label>
                        <Form.Select
                          name="preneur"
                          value={filters.preneur}
                          onChange={handleChange}
                        >
                          <option value="">Tous</option>
                          <option value="entreprise1">Entreprise 1</option>
                          <option value="entreprise2">Entreprise 2</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col
                      md={3}
                      className="d-flex align-items-end justify-content-start gap-2 mt-4 mt-md-0"
                    >
                      <Button
                        variant="primary"
                        onClick={() => console.log(filters)}
                      >
                        Filtrer
                      </Button>
                      <Button variant="primary" onClick={handleReset}>
                        Réinitialiser
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}
            </div>

            <div className="row">
              <div className="col-md-6">
                {/* Portfolio */}
                <div className="col-md-12">
                  <div className="">
                    <h2 className="my-4">Portfolio</h2>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="numeric-graph">
                          <p className="mb-2">état du dossier and status</p>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex flex-column justify-content-between">
                              <div className="div">
                                <h2>200TB</h2>
                              </div>
                            </div>

                            <div className="graphic-line">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="98"
                                height="80"
                                viewBox="0 0 98 80"
                                fill="none"
                              >
                                <path
                                  d="M96 17.8793L82.8062 34.011C81.813 35.2254 79.8721 34.8756 79.3653 33.3909L78.6997 31.4408C78.0445 29.5212 75.2777 29.6836 74.8515 31.6666L72.3172 43.4603C71.8492 45.6377 68.7086 45.5355 68.3832 43.3322L62.536 3.72935C62.2118 1.53327 59.0853 1.4214 58.6049 3.58868L50.9883 37.9512C50.536 39.992 47.6508 40.0584 47.1051 38.0405L41.5648 17.5539C41.022 15.5468 38.1573 15.5977 37.6862 17.6228L33.2257 36.7968L26.5019 66.4463L23.1784 76.1706C22.4813 78.2104 19.4947 77.8558 19.2946 75.7094L15.0747 30.4518C14.8975 28.5517 12.4133 27.9555 11.3931 29.5683L7.50157 35.7201C6.57489 37.185 4.35053 36.8578 3.88488 35.1881L2 28.4294"
                                  stroke="#00366b"
                                  stroke-width="4"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="numeric-graph nagative-stats">
                          <p className="mb-2">Files / products</p>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex flex-column justify-content-between">
                              <div className="div">
                                <h2>200TB</h2>
                              </div>
                            </div>

                            <div className="graphic-line">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="98"
                                height="80"
                                viewBox="0 0 98 80"
                                fill="none"
                              >
                                <path
                                  d="M96 17.8793L82.8062 34.011C81.813 35.2254 79.8721 34.8756 79.3653 33.3909L78.6997 31.4408C78.0445 29.5212 75.2777 29.6836 74.8515 31.6666L72.3172 43.4603C71.8492 45.6377 68.7086 45.5355 68.3832 43.3322L62.536 3.72935C62.2118 1.53327 59.0853 1.4214 58.6049 3.58868L50.9883 37.9512C50.536 39.992 47.6508 40.0584 47.1051 38.0405L41.5648 17.5539C41.022 15.5468 38.1573 15.5977 37.6862 17.6228L33.2257 36.7968L26.5019 66.4463L23.1784 76.1706C22.4813 78.2104 19.4947 77.8558 19.2946 75.7094L15.0747 30.4518C14.8975 28.5517 12.4133 27.9555 11.3931 29.5683L7.50157 35.7201C6.57489 37.185 4.35053 36.8578 3.88488 35.1881L2 28.4294"
                                  stroke="#00366b"
                                  stroke-width="4"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="numeric-graph nagative-stats">
                          <p className="mb-2">files / risk (DO / RCD …)</p>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex flex-column justify-content-between">
                              <div className="div">
                                <h2>200TB</h2>
                              </div>
                            </div>

                            <div className="graphic-line">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="98"
                                height="80"
                                viewBox="0 0 98 80"
                                fill="none"
                              >
                                <path
                                  d="M96 17.8793L82.8062 34.011C81.813 35.2254 79.8721 34.8756 79.3653 33.3909L78.6997 31.4408C78.0445 29.5212 75.2777 29.6836 74.8515 31.6666L72.3172 43.4603C71.8492 45.6377 68.7086 45.5355 68.3832 43.3322L62.536 3.72935C62.2118 1.53327 59.0853 1.4214 58.6049 3.58868L50.9883 37.9512C50.536 39.992 47.6508 40.0584 47.1051 38.0405L41.5648 17.5539C41.022 15.5468 38.1573 15.5977 37.6862 17.6228L33.2257 36.7968L26.5019 66.4463L23.1784 76.1706C22.4813 78.2104 19.4947 77.8558 19.2946 75.7094L15.0747 30.4518C14.8975 28.5517 12.4133 27.9555 11.3931 29.5683L7.50157 35.7201C6.57489 37.185 4.35053 36.8578 3.88488 35.1881L2 28.4294"
                                  stroke="#00366b"
                                  stroke-width="4"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="numeric-graph ">
                          <p className="mb-2">File / Files warning</p>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex flex-column justify-content-between">
                              <div className="div">
                                <h2>200TB</h2>
                              </div>
                            </div>

                            <div className="graphic-line">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="98"
                                height="80"
                                viewBox="0 0 98 80"
                                fill="none"
                              >
                                <path
                                  d="M96 17.8793L82.8062 34.011C81.813 35.2254 79.8721 34.8756 79.3653 33.3909L78.6997 31.4408C78.0445 29.5212 75.2777 29.6836 74.8515 31.6666L72.3172 43.4603C71.8492 45.6377 68.7086 45.5355 68.3832 43.3322L62.536 3.72935C62.2118 1.53327 59.0853 1.4214 58.6049 3.58868L50.9883 37.9512C50.536 39.992 47.6508 40.0584 47.1051 38.0405L41.5648 17.5539C41.022 15.5468 38.1573 15.5977 37.6862 17.6228L33.2257 36.7968L26.5019 66.4463L23.1784 76.1706C22.4813 78.2104 19.4947 77.8558 19.2946 75.7094L15.0747 30.4518C14.8975 28.5517 12.4133 27.9555 11.3931 29.5683L7.50157 35.7201C6.57489 37.185 4.35053 36.8578 3.88488 35.1881L2 28.4294"
                                  stroke="#00366b"
                                  stroke-width="4"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Statistics */}
                <div className="col-md-12">
                  <h2 className="my-4">Tâche</h2>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="task-card planned-task">
                        <div className="d-flex justify-content-between">
                          <div className="task-detail">
                            <h2>{taskStatisticsData?.planned_tasks}</h2>
                            <div className="task-status">Tâche planifiée</div>
                          </div>
                          <div className="task-icon"></div>
                        </div>
                      </div>
                      <div className="task-card completed-task">
                        <div className="d-flex justify-content-between">
                          <div className="task-detail">
                            <h2>{taskStatisticsData?.completed_tasks}</h2>
                            <div className="task-status">Tâche terminée</div>
                          </div>
                          <div className="task-icon"></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="task-card coming-task">
                        <div className="d-flex justify-content-between">
                          <div className="task-detail">
                            <h2>{taskStatisticsData?.coming_tasks}</h2>
                            <div className="task-status">Tâche à venir</div>
                          </div>
                          <div className="task-icon"></div>
                        </div>
                      </div>
                      <div className="task-card late-task">
                        <div className="d-flex justify-content-between">
                          <div className="task-detail">
                            <h2>{taskStatisticsData?.late_tasks}</h2>
                            <div className="task-status">Tâche en retard</div>
                          </div>
                          <div className="task-icon"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Graph  */}
              <div className="col-md-6">
                <h2 class="my-4">Activité</h2>
                <ChartSection title="APTE" data={aptChartData} color="#00C49F" />
                <ChartSection title="ATOT" data={atotChartData} color="#FDB528" />
                <ChartSection title="Traité" data={treatedChartData} color="#8884d8" />

                {/* <div className="activity-card mb-4">
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#FFFFFF",
                      borderRadius: 24,
                      padding: 24,
                    }}
                  >
                    <h3
                      style={{
                        marginBottom: 10,
                        fontSize: 15,
                        color: "#2f2e41",
                      }}
                    >
                      aptChartData
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart
                        data={aptChartData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} domain={[0, 80]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ marginBottom: "16px" }}
                          iconType="circle"
                          align="right"
                          verticalAlign="top"
                          formatter={(value) =>
                            value === "serverA"
                              ? "Web Server A"
                              : "Web Server B"
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="serverA"
                          name="serverA"
                          stroke="#00C49F"
                          strokeWidth={3}
                          dot={{
                            r: 6,
                            strokeWidth: 2,
                            stroke: "#fff",
                            fill: "#00C49F",
                          }}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="serverB"
                          name="serverB"
                          stroke="#FDB528"
                          strokeWidth={3}
                          dot={{
                            r: 6,
                            strokeWidth: 2,
                            stroke: "#fff",
                            fill: "#FDB528",
                          }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="activity-card mb-4">
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#FFFFFF",
                      borderRadius: 24,
                      padding: 24,
                    }}
                  >
                    <h3
                      style={{
                        marginBottom: 10,
                        fontSize: 15,
                        color: "#2f2e41",
                      }}
                    >
                      atotChartData
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart
                        data={atotChartData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} domain={[0, 80]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ marginBottom: "16px" }}
                          iconType="circle"
                          align="right"
                          verticalAlign="top"
                          formatter={(value) =>
                            value === "serverA"
                              ? "Web Server A"
                              : "Web Server B"
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="serverA"
                          name="serverA"
                          stroke="#00C49F"
                          strokeWidth={3}
                          dot={{
                            r: 6,
                            strokeWidth: 2,
                            stroke: "#fff",
                            fill: "#00C49F",
                          }}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="serverB"
                          name="serverB"
                          stroke="#FDB528"
                          strokeWidth={3}
                          dot={{
                            r: 6,
                            strokeWidth: 2,
                            stroke: "#fff",
                            fill: "#FDB528",
                          }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="activity-card mb-4">
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#FFFFFF",
                      borderRadius: 24,
                      padding: 24,
                    }}
                  >
                    <h3
                      style={{
                        marginBottom: 10,
                        fontSize: 15,
                        color: "#2f2e41",
                      }}
                    >
                      treatedChartData
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart
                        data={treatedChartData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} domain={[0, 80]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ marginBottom: "16px" }}
                          iconType="circle"
                          align="right"
                          verticalAlign="top"
                          formatter={(value) =>
                            value === "serverA"
                              ? "Web Server A"
                              : "Web Server B"
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="serverA"
                          name="serverA"
                          stroke="#00C49F"
                          strokeWidth={3}
                          dot={{
                            r: 6,
                            strokeWidth: 2,
                            stroke: "#fff",
                            fill: "#00C49F",
                          }}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="serverB"
                          name="serverB"
                          stroke="#FDB528"
                          strokeWidth={3}
                          dot={{
                            r: 6,
                            strokeWidth: 2,
                            stroke: "#fff",
                            fill: "#FDB528",
                          }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div> */}
              </div>
            </div>

            {/* <Tabs
              id="controlled-tab-example"
              activeKey={activeTab}
              onSelect={handleTabSelect}
              className="mt-5"
            >
              <Tab
                title="À traiter"
                eventKey="toProcess"
              >
                <div className="table-wrapper mt-16 p-0">
                  <h2>{t("toProcess", { count: totalRecords })}</h2>

                  <div className="table-wrap mt-24">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          {selectedColumns.includes("fileNumber") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("fileNumber")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("folder_name")}
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
                          }
                          {selectedColumns.includes("client") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Assureurs</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("customer_name")}
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
                          }
                          {selectedColumns.includes("Nom du preneur d'assurance") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Nom du preneur d'assurance</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("insurance_policyholder_name")}
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
                          }
                          {selectedColumns.includes("brokerlabel") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("brokerlabel")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("broker.first_name")}
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
                          }
                          {selectedColumns.includes("Date de création") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de création</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("created_at")}
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
                          }
                          {selectedColumns.includes("lastModifiedDateLabel") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("lastModifiedDateLabel")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("updated_at")}
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
                          }
                          {selectedColumns.includes("Date de début de chantier") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de début de chantier</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("start_date")}
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
                          }
                          {selectedColumns.includes("Date de fin de chantier") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de fin de chantier</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("complete_date")}
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
                          }
                          {selectedColumns.includes("status") && (
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
                                    <option value="transfer_to_manager">Transfert au Gestionnaire</option>
                                    <option value="transfer_to_broker">Transfert au Courtier</option>
                                    <option value="transfer_to_insurer">Transfert à l'assureur</option>
                                    <option value="formal_notice">Mise en demeure</option>
                                    <option value="to_be_decided">A statuer</option>
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
                          )}
                          {selectedColumns.includes("Etat du chantier") &&
                            <th className="select-drop elips-dropdown">
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
                                <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="black" />
                              </svg>
                            </Link>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(userDocumentData?.length > 0 && selectedColumns?.length > 0) ? (
                          userDocumentData?.map((data) => (
                            <tr key={data.id} onClick={() => navigate(`/admin-file-detail/${data.id}`)} style={{ cursor: "pointer" }}>
                              {selectedColumns.includes("fileNumber") && (
                                <td className="bold-font" style={{ textAlign: "center" }}>
                                  <div style={{ lineHeight: 1 }}>
                                    {data.is_important == 1 && <BsPatchExclamation style={{ color: "red", fontSize: "1.0rem", cursor: "pointer" }} title='Remarque importante' />}
                                    <div style={{ marginTop: "4px" }}>{data.folder_name}</div>
                                  </div>
                                </td>
                              )}
                              {selectedColumns.includes("client") && <td>{data.customer_name}</td>}
                              {selectedColumns.includes("Nom du preneur d'assurance") && <td>{data.insurance_policyholder_name}</td>}
                              {selectedColumns.includes("brokerlabel") && (
                                <td>
                                  {(data.broker?.first_name || data.broker?.last_name)
                                    ? `${data.broker?.first_name} ${data.broker?.last_name == null ? '' : data.broker?.last_name}`
                                    : "Sans"}
                                </td>
                              )}
                              {selectedColumns.includes("Date de création") && <td>{data.created_at}</td>}
                              {selectedColumns.includes("lastModifiedDateLabel") && <td>{data.updated_at}</td>}
                              {selectedColumns.includes("Date de début de chantier") && <td className="bold-font">{data?.estimated_start_date}</td>}
                              {selectedColumns.includes("Date de fin de chantier") && <td className="bold-font">{data?.estimated_completion_date}</td>}
                              {selectedColumns.includes("status") && (
                                <td>
                                  {
                                    data.status === "to_be_checked" ? <span className="checked badges">{t("toBeCheckedLabel")}</span> :
                                      data.status === "transfer_to_manager" ? <span className="transfer badges">Transfert au Gestionnaire</span> :
                                        data.status === "transfer_to_broker" ? <span className="transfer badges">Transfert au Courtier</span> :
                                          data.status === "transfer_to_insurer" ? <span className="formal_notice badges">Transfert à l'assureur</span> :
                                            data.status === "formal_notice" ? <span className="formal_notice badges">Mise en demeure</span> :
                                              data.status === "to_be_decided" ? <span className="to_be_decided badges">A statuer</span> :
                                                data.status === "validated" ? <span className="verified badges">{t("validatedLabel")}</span> :
                                                  <span className="incomplete badges">{t("invalidLabel")}</span>
                                  }
                                </td>
                              )}
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
                          ))
                        ) : (
                          <tr>
                            <td colSpan="12" style={{ textAlign: "left" }}>
                              {t("NorecordsfoundLabel")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                  {totalRecords > 10 &&
                    <Paginations
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={10}
                      totalItems={totalRecords}
                    />
                  }
                </div>
              </Tab>
              <Tab
                title="Réceptions à venir"
                eventKey="receipts_to_come"
              >
                <div className="table-wrapper mt-16 p-0">
                  <h2> Réceptions à venir  {`(` + totalRecords + `)`}</h2>

                  <div className="table-wrap mt-24">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          {selectedColumns.includes("fileNumber") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("fileNumber")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("folder_name")}
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
                          }
                          {selectedColumns.includes("client") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Assureurs</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("customer_name")}
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
                          }
                          {selectedColumns.includes("Nom du preneur d'assurance") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Nom du preneur d'assurance</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("insurance_policyholder_name")}
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
                          }
                          {selectedColumns.includes("brokerlabel") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("brokerlabel")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("broker.first_name")}
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
                          }
                          {selectedColumns.includes("Date de création") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de création</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("created_at")}
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
                          }
                          {selectedColumns.includes("lastModifiedDateLabel") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("lastModifiedDateLabel")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("updated_at")}
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
                          }
                          {selectedColumns.includes("Date de début de chantier") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de début de chantier</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("start_date")}
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
                          }
                          {selectedColumns.includes("Date de fin de chantier") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de fin de chantier</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("complete_date")}
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
                                    <option value="transfer_to_manager">Transfert au Gestionnaire</option>
                                    <option value="transfer_to_broker">Transfert au Courtier</option>
                                    <option value="transfer_to_insurer">Transfert à l'assureur</option>
                                    <option value="formal_notice">Mise en demeure</option>
                                    <option value="to_be_decided">A statuer</option>
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
                                <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="black" />
                              </svg>
                            </Link>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(userDocumentData?.length > 0 && selectedColumns?.length > 0) ? (
                          userDocumentData?.map((data) => (
                            <tr key={data.id} onClick={() => navigate(`/admin-file-detail/${data.id}`)} style={{ cursor: "pointer" }}>
                              {selectedColumns.includes("fileNumber") && (
                                <td className="bold-font" style={{ textAlign: "center" }}>
                                  <div style={{ lineHeight: 1 }}>
                                    {data.is_important == 1 && <BsPatchExclamation style={{ color: "red", fontSize: "1.0rem", cursor: "pointer" }} title='Remarque importante' />}
                                    <div style={{ marginTop: "4px" }}>{data.folder_name}</div>
                                  </div>
                                </td>
                              )}
                              {selectedColumns.includes("client") && <td>{data.customer_name}</td>}
                              {selectedColumns.includes("Nom du preneur d'assurance") && <td>{data.insurance_policyholder_name}</td>}
                              {selectedColumns.includes("brokerlabel") && (
                                <td>
                                  {(data.broker?.first_name || data.broker?.last_name)
                                    ? `${data.broker?.first_name} ${data.broker?.last_name == null ? '' : data.broker?.last_name}`
                                    : "Sans"}
                                </td>
                              )}
                              {selectedColumns.includes("Date de création") && <td>{data.created_at}</td>}
                              {selectedColumns.includes("lastModifiedDateLabel") && <td>{data.updated_at}</td>}
                              {selectedColumns.includes("Date de début de chantier") && <td className="bold-font">{data?.estimated_start_date}</td>}
                              {selectedColumns.includes("Date de fin de chantier") && <td className="bold-font">{data?.estimated_completion_date}</td>}
                              {selectedColumns.includes("status") && (
                                <td>
                                  {
                                    data.status === "to_be_checked" ? <span className="checked badges">{t("toBeCheckedLabel")}</span> :
                                      data.status === "transfer_to_manager" ? <span className="transfer badges">Transfert au Gestionnaire</span> :
                                        data.status === "transfer_to_broker" ? <span className="transfer badges">Transfert au Courtier</span> :
                                          data.status === "transfer_to_insurer" ? <span className="formal_notice badges">Transfert à l'assureur</span> :
                                            data.status === "formal_notice" ? <span className="formal_notice badges">Mise en demeure</span> :
                                              data.status === "to_be_decided" ? <span className="to_be_decided badges">A statuer</span> :
                                                data.status === "validated" ? <span className="verified badges">{t("validatedLabel")}</span> :
                                                  <span className="incomplete badges">{t("invalidLabel")}</span>
                                  }
                                </td>
                              )}
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
                          ))
                        ) : (
                          <tr>
                            <td colSpan="12" style={{ textAlign: "left" }}>
                              {t("NorecordsfoundLabel")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                  {totalRecords > 10 &&
                    <Paginations
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={10}
                      totalItems={totalRecords}
                    />
                  }
                </div>
              </Tab>
              <Tab
                eventKey="receipts_past"
                title="Réceptions passées"
              >
                <div className="table-wrapper mt-16 p-0">
                  <h2> Réceptions passées  {`(` + totalRecords + `)`}</h2>


                  <div className="table-wrap mt-24">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          {selectedColumns.includes("fileNumber") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("fileNumber")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("folder_name")}
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
                          }
                          {selectedColumns.includes("client") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Assureurs</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("customer_name")}
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
                          }
                          {selectedColumns.includes("Nom du preneur d'assurance") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Nom du preneur d'assurance</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("insurance_policyholder_name")}
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
                          }
                          {selectedColumns.includes("brokerlabel") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("brokerlabel")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("broker.first_name")}
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
                          }
                          {selectedColumns.includes("Date de création") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de création</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("created_at")}
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
                          }
                          {selectedColumns.includes("lastModifiedDateLabel") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>{t("lastModifiedDateLabel")}</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("updated_at")}
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
                          }
                          {selectedColumns.includes("Date de début de chantier") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de début de chantier</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("start_date")}
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
                          }
                          {selectedColumns.includes("Date de fin de chantier") &&
                            <th>
                              <div className="d-flex align-items-center">
                                <span>Date de fin de chantier</span>
                                <Link
                                  className={`sorting-icon ms-2`}
                                  onClick={() => handleClickRotate("complete_date")}
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
                                    <option value="transfer_to_manager">Transfert au Gestionnaire</option>
                                    <option value="transfer_to_broker">Transfert au Courtier</option>
                                    <option value="transfer_to_insurer">Transfert à l'assureur</option>
                                    <option value="formal_notice">Mise en demeure</option>
                                    <option value="to_be_decided">A statuer</option>
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
                                <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="black" />
                              </svg>
                            </Link>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(userDocumentData?.length > 0 && selectedColumns?.length > 0) ? (
                          userDocumentData?.map((data) => (
                            <tr key={data.id} onClick={() => navigate(`/admin-file-detail/${data.id}`)} style={{ cursor: "pointer" }}>
                              {selectedColumns.includes("fileNumber") && (
                                <td className="bold-font" style={{ textAlign: "center" }}>
                                  <div style={{ lineHeight: 1 }}>
                                    {data.is_important == 1 && <BsPatchExclamation style={{ color: "red", fontSize: "1.0rem", cursor: "pointer" }} title='Remarque importante' />}
                                    <div style={{ marginTop: "4px" }}>{data.folder_name}</div>
                                  </div>
                                </td>
                              )}
                              {selectedColumns.includes("client") && <td>{data.customer_name}</td>}
                              {selectedColumns.includes("Nom du preneur d'assurance") && <td>{data.insurance_policyholder_name}</td>}
                              {selectedColumns.includes("brokerlabel") && (
                                <td>
                                  {(data.broker?.first_name || data.broker?.last_name)
                                    ? `${data.broker?.first_name} ${data.broker?.last_name == null ? '' : data.broker?.last_name}`
                                    : "Sans"}
                                </td>
                              )}
                              {selectedColumns.includes("Date de création") && <td>{data.created_at}</td>}
                              {selectedColumns.includes("lastModifiedDateLabel") && <td>{data.updated_at}</td>}
                              {selectedColumns.includes("Date de début de chantier") && <td className="bold-font">{data?.estimated_start_date}</td>}
                              {selectedColumns.includes("Date de fin de chantier") && <td className="bold-font">{data?.estimated_completion_date}</td>}
                              {selectedColumns.includes("status") && (
                                <td>
                                  {
                                    data.status === "to_be_checked" ? <span className="checked badges">{t("toBeCheckedLabel")}</span> :
                                      data.status === "transfer_to_manager" ? <span className="transfer badges">Transfert au Gestionnaire</span> :
                                        data.status === "transfer_to_broker" ? <span className="transfer badges">Transfert au Courtier</span> :
                                          data.status === "transfer_to_insurer" ? <span className="formal_notice badges">Transfert à l'assureur</span> :
                                            data.status === "formal_notice" ? <span className="formal_notice badges">Mise en demeure</span> :
                                              data.status === "to_be_decided" ? <span className="to_be_decided badges">A statuer</span> :
                                                data.status === "validated" ? <span className="verified badges">{t("validatedLabel")}</span> :
                                                  <span className="incomplete badges">{t("invalidLabel")}</span>
                                  }
                                </td>
                              )}
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
                          ))
                        ) : (
                          <tr>
                            <td colSpan="12" style={{ textAlign: "left" }}>
                              {t("NorecordsfoundLabel")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                  {totalRecords > 10 &&
                    <Paginations
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={10}
                      totalItems={totalRecords}
                    />
                  }
                </div>
              </Tab>
            </Tabs> */}
          </>
        }
      </div>

      {/* Column hide / Show */}
      {/* <Modal show={showAddcol} onHide={handleAddcolClose}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter une colonne</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h2 className="mb-4">Liste des colonnes</h2>
          <Form.Check
            id="select-all-checkbox"
            label="Sélectionner tout"
            checked={Object.values(modalColumns).every((value) => value)}
            onChange={(e) => {
              const isChecked = e.target.checked;
              setModalColumns((prev) =>
                Object.fromEntries(Object.keys(prev).map((key) => [key, isChecked]))
              );
            }}
          />

          {Object.keys(modalColumns).map((key) => (
            <Form.Check
              key={key}
              id={`checkbox-${key}`}
              label={<label style={{ cursor: "pointer" }} htmlFor={`checkbox-${key}`}>{t(key)}</label>}
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
      </Modal> */}

      {/* Delete Confirmation Popup */}
      {/* <Modal className="final-modal" show={showDeleteModal} onHide={handleCloseDeleteModal}>
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
      </Modal> */}
    </Fragment>
  );
};

export default AdminDashboard;