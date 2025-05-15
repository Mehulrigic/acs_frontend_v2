import React, { useEffect } from "react";
import "./StatisticsData.css";
import { useTranslation } from "react-i18next";
import Form from 'react-bootstrap/Form';
import DatePicker from 'react-datepicker';
import { fr } from "date-fns/locale";
import 'react-datepicker/dist/react-datepicker.css';

const StatisticsData = (props) => {
  const { t } = useTranslation();
  const { statisticsData, startDate, setStartDate, selectedMonth, setSelectedMonth, getFormattedDate, formatDate } = props;

  const handleSelectChange = (event) => {
    const value = event.target.value;
    setSelectedMonth(value);
  };

  useEffect(() => {
    if(startDate){
      setStartDate(startDate);
    }
  }, [startDate]);

  return (
    <>
      <div className="statistics-container">
        <div className="d-sm-flex justify-content-between align-items-center gap-2">
          <h2 className="m-sm-0 mb-3">{t("statisticsLabel")}</h2>
          <div className="over-period">
            <p className="m-0"> Sur la période :</p>
            <Form.Select aria-label="Date range selector" value={selectedMonth} onChange={handleSelectChange}>
              <option value="all">Toutes</option>
              <option value="last_month">derniers mois</option>
              <option value="last_three_month">3 derniers mois</option>
              {/* <option value="custom">Coutume</option> */}
            </Form.Select>
            {selectedMonth === "custom" && (
              <DatePicker
                placeholderText="Choisir une date"
                selected={startDate ? getFormattedDate(startDate) : null}
                onChange={(date) => setStartDate(formatDate(date))}
                dateFormat="dd/MM/yyyy"
                className="form-control"
                locale={fr}
              />
            )}
          </div>
        </div>

        <div className="statistic-row">
          <div className="statistic-col">
            <div className="each-box">
              <h2>{statisticsData?.invalid_count}</h2>
              <h6>{t("documentInvalidLabel")}</h6>
            </div>
          </div>
          <div className="statistic-col">
            <div className="each-box">
              <h2>{statisticsData?.missing_count}</h2>
              <h6>{t("documentMissingLabel")}</h6>
            </div>
          </div>
          <div className="statistic-col">
            <div className="each-box">
              <h2>{statisticsData?.awaiting_count}</h2>
              <h6>{t("filesAwaitingVerificationLabel")}</h6>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatisticsData;