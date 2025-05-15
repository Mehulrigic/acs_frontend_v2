import React, { Fragment, useEffect } from 'react'
import { useState } from 'react';
import "./AddBroker.css";
import Modal from 'react-bootstrap/Modal';
import { Button, Form } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import AddFolderPanelService from '../../API/AddFolderPanel/AddFolderPanelService';

const AddBroker = (props) => {
  const { BrokerList } = props;
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });

  const handleModalClose = () => setShow(false);
  const handleModalShow = () => setShow(true);

  useEffect(() => {
    if (flashMessage.message) {
      const timer = setTimeout(() => {
        setFlashMessage({ type: "", message: "" });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  const AddNewBroker = async (e) => {
    e.preventDefault();
    if (e.target.elements.firstName.value == "" || e.target.elements.lastName.value == "" || e.target.elements.broker_orias.value == "") {
      setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
      return;
    }
    try {
      var useData = {
        first_name: e.target.elements.firstName.value,
        last_name: e.target.elements.lastName.value ?? "",
        broker_orias: e.target.elements.broker_orias.value ?? "",
      };

      const response = await AddFolderPanelService.add_broker(useData);
      if (response.data.status) {
        setShow(false);
        BrokerList();
      } else {
        setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
      }
    } catch (error) {
      setFlashMessage({ type: "error", message: error.response.data.message || t("somethingWentWrong") });
    }
  };
  const [orias, setOrias] = useState("");

  const handleChangeOrias = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    setOrias(onlyNumbers);
  };
  return (
    <Fragment>
      <Button variant="primary" onClick={handleModalShow}>
        Nouveau courtier
      </Button>
      <Modal show={show} onHide={handleModalClose}>
        <Form onSubmit={AddNewBroker}>
          <Modal.Header closeButton>
            <Modal.Title>Nouveau courtier</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h2>Nouveau courtier</h2>
            {flashMessage.message && (
              <div
                className={`alert ${flashMessage.type === "success" ? "alert-success" : "alert-danger"
                  } text-center`}
                role="alert"
              >
                {flashMessage.message}
              </div>
            )}
            <Form.Group className='mt-16' controlId="firstName">
              <Form.Label>{t("firstName")} <span>*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder={t("firstName")}
                name="firstName"
              />
            </Form.Group>
            <Form.Group className='mt-16' controlId="lastName">
              <Form.Label>{t("lastName")} <span>*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder={t("lastName")}
                name="lastName"
              />
            </Form.Group>
            <Form.Group className='mt-16' controlId="ORIAS">
              <Form.Label>{t("ORIAS")} <span>*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder={t("ORIAS")}
                name="broker_orias"
                value={orias}
                maxLength={8}
                onChange={handleChangeOrias}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <div className="text-end">
              <Button variant="primary" type="submit">
                {t("submitButton")}
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default AddBroker;