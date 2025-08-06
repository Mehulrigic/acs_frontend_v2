import React, { Fragment, useEffect, useState } from "react";
import "./ManagerDashboard.css"
import SidePanel from '../../Components/SidePanel/SidePanel'
import Form from 'react-bootstrap/Form';
import logo from "../../acs-logo.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Loading from '../../Common/Loading';
import DashboardManagementService from "../../API/DashboardManagement/DashboardManagementService";
import { Row, Col } from "react-bootstrap";
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
import { fr } from "date-fns/locale";

const ManagerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [logoImageShow, setLogoImageShow] = useState("");
  const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
  const [statisticsData, setStatisticsData] = useState({});
  const [taskStatisticsData, setTaskStatisticsData] = useState({});
  const [aptChartData, setAptChartData] = useState([]);
  const [atotChartData, setAtotChartData] = useState([]);
  const [treatedChartData, setTreatedChartData] = useState([]);
  const [brokerList, setBrokerList] = useState([]);
  const [insurersList, setInsurersList] = useState([]);
  const [policyholdersList, setPolicyholdersList] = useState([]);
  const [showFilterForm, setShowFilterForm] = useState(true);

  const [brokerId, setBrokerId] = useState("");
  const [insurerId, setInsurerId] = useState("");
  const [fileStatus, setFileStatus] = useState("");
  const [riskType, setRiskType] = useState("");
  const [policyholderName, setPolicyholderName] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [resetFilter, setResetFilter] = useState(false);

  useEffect(() => {
    const userRole = JSON.parse(localStorage.getItem("userRole"));
    const token = localStorage.getItem("authToken");
    if (token && userRole.includes("Gestionnaire ACS")) {
      const logo_image = JSON.parse(localStorage.getItem("logo_image"));
      const right_panel_color = JSON.parse(localStorage.getItem("right_panel_color"));
      setRightPanelThemeColor(right_panel_color);
      setLogoImageShow(logo_image);
      GetBrokerList();
      GetInsurersList();
      GetPolicyholders();
      GetStatistics();
      GetTaskStatistics();
      GetAptAtotFromTransferHistory();
    } else {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    if (resetFilter) {
      GetStatistics();
      GetTaskStatistics();
      GetAptAtotFromTransferHistory();
      setResetFilter(false);
    }
  }, [resetFilter]);

  const toggleFilter = () => {
    setShowFilterForm(!showFilterForm);
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

  const GetBrokerList = async () => {
    setIsLoading(true);
    try {

      const response = await DashboardManagementService.broker_list();

      if (response.data) {
        setIsLoading(false);
        setBrokerList(response.data.brokerList);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const GetInsurersList = async () => {
    setIsLoading(true);
    try {

      const response = await DashboardManagementService.insurer_list();

      if (response.data) {
        setIsLoading(false);
        setInsurersList(response.data.insurerList);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const GetPolicyholders = async () => {
    setIsLoading(true);
    try {

      const response = await DashboardManagementService.policy_holders();

      if (response.data) {
        setIsLoading(false);
        setPolicyholdersList(response.data.policy_holders);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const GetStatistics = async () => {
    setIsLoading(true);
    try {
      const userData = {
        ...(selectedDate && { date: selectedDate }),
        ...(brokerId && { broker_id: brokerId }),
        ...(fileStatus && { status: fileStatus }),
        ...(riskType && { risk_type: riskType }),
        ...(policyholderName && { insurance_policyholder_name: policyholderName }),
      };

      const response = await DashboardManagementService.get_statistics(userData);

      if (response.data) {
        setIsLoading(false);
        setStatisticsData(response.data);
        localStorage.setItem("total_proceed", response.data.files_total);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const GetTaskStatistics = async () => {
    setIsLoading(true);
    try {
      const userData = {
        ...(selectedDate && { date: selectedDate }),
        ...(brokerId && { broker_id: brokerId }),
        ...(insurerId && { insurer_id: insurerId }),
      };

      const response = await DashboardManagementService.get_task_statistics(userData);

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
      const userData = {
        ...(selectedDate && { date: selectedDate }),
        ...(brokerId && { broker_id: brokerId }),
        ...(insurerId && { insurer_id: insurerId }),
        ...(fileStatus && { status: fileStatus }),
        ...(riskType && { risk_type: riskType }),
        ...(policyholderName && { insurance_policyholder_name: policyholderName }),
      };

      const response = await DashboardManagementService.apt_atot_stats(userData);

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

  const HandleFilter = () => {
    GetStatistics();
    GetTaskStatistics();
    GetAptAtotFromTransferHistory();
  };

  const HandleReset = () => {
    setResetFilter(true);
    setSelectedDate(null);
    setBrokerId("");
    setFileStatus("");
    setRiskType("");
    setPolicyholderName("");
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
    const yMax = maxValue > 0 ? Math.ceil(maxValue) : 10;

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

      <SidePanel
        sidebarLogo={
          (logoImageShow == "" || logoImageShow == null || logoImageShow == undefined) ? logo : `${process.env.REACT_APP_IMAGE_URL}/${logoImageShow}`}
      />

      <div className="dashboard-main-content manager-dashboard" style={{ backgroundColor: rightPanelThemeColor }}>
        <div className="top-header">
          <h4>{t("folders")}</h4>
          <div className="mt-3 d-flex justify-content-between align-items-center">
            <h1 className="m-0">
              Dossier à traiter 
              {/* ({statisticsData?.files_total || 0}) */}
            </h1>
          </div>
        </div>

        {isLoading ? <Loading /> :
          <Fragment>
            {/* Top Filter */}
            <div className="top-global-filter">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="mb-2">Filtres cumulatifs</h2>
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
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>Date</Form.Label>
                        <DatePicker
                          selected={selectedDate ? getFormattedDate(selectedDate) : null}
                          onChange={(date) => setSelectedDate(formatDate(date))}
                          className="form-control"
                          placeholderText="Sélectionnez une date"
                          dateFormat="dd/MM/yyyy"
                          locale={fr}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>Assureur</Form.Label>
                        <Form.Select
                          name="insurer_id"
                          value={insurerId}
                          onChange={(e) => setInsurerId(e.target.value)}
                        >
                          <option value="">Sélectionner Assureur</option>
                          {insurersList?.length > 0 ? (
                            insurersList?.map((data, index) => (
                              <option key={index} value={data.id}>{data.first_name}</option>
                            ))
                          ) : (
                            <option value="" disabled>{t("NorecordsfoundLabel")}</option>
                          )}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>Courtier</Form.Label>
                        <Form.Select
                          name="broker_id"
                          value={brokerId}
                          onChange={(e) => setBrokerId(e.target.value)}
                        >
                          <option value="">Sélectionner Courtier</option>
                          {brokerList?.length > 0 ? (
                            brokerList?.map((data, index) => (
                              <option key={index} value={data.id}>{data.first_name}</option>
                            ))
                          ) : (
                            <option value="" disabled>{t("NorecordsfoundLabel")}</option>
                          )}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>État du dossier</Form.Label>
                        <Form.Select
                          name="status"
                          value={fileStatus}
                          onChange={(e) => setFileStatus(e.target.value)}
                        >
                          <option value="">Sélectionnez l'état du fichier</option>
                          <option value="to_be_checked">{t("toBeCheckedLabel")}</option>
                          <option value="transfer_to_manager">Transfert au Gestionnaire</option>
                          <option value="transfer_to_broker">Transfert au Courtier</option>
                          <option value="transfer_to_insurer">Transfert à l'assureur</option>
                          <option value="formal_notice">Mise en demeure</option>
                          <option value="to_be_decided">A statuer</option>
                          <option value="validated">{t("validatedLabel")}</option>
                          <option value="invalid">{t("invalidLabel")}</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>Risques</Form.Label>
                        <Form.Select
                          name="risk_type"
                          value={riskType}
                          onChange={(e) => setRiskType(e.target.value)}
                        >
                          <option value="">Sélectionnez les risques</option>
                          <option value="do">DO</option>
                          <option value="rcd">RCD</option>
                          <option value="trc">TRC</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>Preneur d’assurance</Form.Label>
                        <Form.Select
                          name="insurance_policyholder_name"
                          value={policyholderName}
                          onChange={(e) => setPolicyholderName(e.target.value)}
                        >
                          <option value="">Sélectionnez le preneur d'assurance</option>
                          {policyholdersList?.length > 0 ? (
                            policyholdersList?.map((data, index) => (
                              <option key={index} value={data}>{data.charAt(0).toUpperCase() + data.slice(1)}</option>
                            ))
                          ) : (
                            <option value="" disabled>{t("NorecordsfoundLabel")}</option>
                          )}
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
                        onClick={() => HandleFilter()}
                      >
                        Filtre
                      </Button>
                      <Button variant="primary" onClick={() => HandleReset()}>
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
                    <h2 className="my-4">Portefeuille</h2>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="numeric-graph">
                          <p className="mb-2">état et statut du fichier</p>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex flex-column justify-content-between">
                              <div className="div">
                                <h2>{statisticsData?.files_total || 0}</h2>
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
                                  strokeWidth="4"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="numeric-graph nagative-stats">
                          <p className="mb-2">Fichiers / produits</p>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex flex-column justify-content-between">
                              <div className="div">
                                <h2>{statisticsData?.files_by_product || 0}</h2>
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
                                  strokeWidth="4"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="numeric-graph nagative-stats">
                          <p className="mb-2">fichiers / risque (DO / RCD …)</p>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex flex-column justify-content-between">
                              <div className="div">
                                <h2>{statisticsData?.files_by_risk_type || 0}</h2>
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
                                  strokeWidth="4"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="numeric-graph ">
                          <p className="mb-2">Avertissement concernant les fichiers / fichiers</p>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex flex-column justify-content-between">
                              <div className="div">
                                <h2>{statisticsData?.files_warning || 0}</h2>
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
                                  strokeWidth="4"
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
                            <h2>{taskStatisticsData?.planned_tasks || 0}</h2>
                            <div className="task-status">Tâche planifiée</div>
                          </div>
                          <div className="task-icon"></div>
                        </div>
                      </div>
                      <div className="task-card completed-task">
                        <div className="d-flex justify-content-between">
                          <div className="task-detail">
                            <h2>{taskStatisticsData?.completed_tasks || 0}</h2>
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
                            <h2>{taskStatisticsData?.coming_tasks || 0}</h2>
                            <div className="task-status">Tâche à venir</div>
                          </div>
                          <div className="task-icon"></div>
                        </div>
                      </div>
                      <div className="task-card late-task">
                        <div className="d-flex justify-content-between">
                          <div className="task-detail">
                            <h2>{taskStatisticsData?.late_tasks || 0}</h2>
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
                <h2 className="my-4">Activité</h2>
                <ChartSection title="APTE" data={aptChartData} color="#00C49F" />
                <ChartSection title="ATOT" data={atotChartData} color="#FDB528" />
                <ChartSection title="Traité" data={treatedChartData} color="#8884d8" />
              </div>
            </div>
          </Fragment>
        }
      </div>
    </Fragment>
  );
};

export default ManagerDashboard;