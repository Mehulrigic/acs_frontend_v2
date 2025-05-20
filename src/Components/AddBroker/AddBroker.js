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
  const [brokerCode, setBrokerCode] = useState("");

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
    if (e.target.elements.broker_name.value == "" || e.target.elements.broker_city.value == "" || e.target.elements.broker_code.value == "") {
      setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
      return;
    }
    try {
      var useData = {
        broker_name: e.target.elements.broker_name.value,
        broker_city: e.target.elements.broker_city.value,
        broker_code: e.target.elements.broker_code.value,
      };

      const response = await AddFolderPanelService.add_broker(useData);
      if (response.data.status) {
        setShow(false);
        setBrokerCode("");
        BrokerList();
      } else {
        setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
      }
    } catch (error) {
      setFlashMessage({ type: "error", message: error.response.data.message || t("somethingWentWrong") });
    }
  };

  const handleChangeBrokerCode = (e) => {
    const onlyNumbers = e.target.value;
    setBrokerCode(onlyNumbers);
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
            <Form.Group className='mt-16' controlId="broker_name">
              <Form.Label>Nom <span>*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder={"Nom"}
                name="broker_name"
              />
            </Form.Group>
            <Form.Group className='mt-16' controlId="broker_city">
              <Form.Label>City <span>*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder={"City"}
                name="broker_city"
              />
            </Form.Group>
            <Form.Group className='mt-16' controlId="broker_code">
              <Form.Label>Code du courtier <span>*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder={"Code du courtier"}
                name="broker_code"
                value={brokerCode}
                onChange={handleChangeBrokerCode}
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