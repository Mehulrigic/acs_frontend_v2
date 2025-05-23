import React, { Fragment, useEffect } from 'react'
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import MissingDocumentService from '../../API/MissingDocument/MissingDocumentService';

const InvalidDocument = (props) => {
  const { t } = useTranslation();
  const { id } = useParams();
  
  const { showmodal, handleModalClose, selectDocumentId, selectDocumentFileName } = props;
  const [reasonMessage, setReasonMessage] = useState("");
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });

  useEffect(() => {
    if (flashMessage.message) {
      const timer = setTimeout(() => {
        setFlashMessage({ type: "", message: "" });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  const AddDocumentDisabilityReason = async (e) => {
    e.preventDefault();
    if (reasonMessage == "") {
      setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
      return;
    }
    var disabilityReasonData = {
      user_document_id: id,
      user_document_file_id: selectDocumentId,
      reason: reasonMessage,
      type: "invalid"
    };
    try {
      const response = await MissingDocumentService.add_document_disability_reason(disabilityReasonData);
      if (response.data.status) {
        setReasonMessage("");
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
        message: error.response.data.message || t("somethingWentWrong"),
      });
    }
  };

  return (
    <Fragment>
      <Modal className='missing-doc-modal invalid-doc-modal' show={showmodal} onHide={handleModalClose}>
        <Form onSubmit={AddDocumentDisabilityReason}>
          <Modal.Header closeButton>
            <Modal.Title>Document invalide</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h2>Raison d'invalidité <span>*</span></h2>
            <span className="complete-process">
                Indiquez les raisons d'invalidité pour permettre au courtier de comger les <br />erreurs
            </span>
            <div className="replace-document mt-32 ">
              <div className="icon d-flex align-items-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 8 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.42457 3.36368V10.3334C6.42457 11.6728 5.33972 12.7576 4.00033 12.7576C2.66093 12.7576 1.57608 11.6728 1.57608 10.3334V2.75762C1.57608 1.92125 2.25487 1.24246 3.09123 1.24246C3.9276 1.24246 4.60639 1.92125 4.60639 2.75762V9.12125C4.60639 9.45459 4.33366 9.72731 4.00033 9.72731C3.66699 9.72731 3.39426 9.45459 3.39426 9.12125V3.36368H2.48517V9.12125C2.48517 9.95762 3.16396 10.6364 4.00033 10.6364C4.83669 10.6364 5.51548 9.95762 5.51548 9.12125V2.75762C5.51548 1.41822 4.43063 0.333374 3.09123 0.333374C1.75184 0.333374 0.666992 1.41822 0.666992 2.75762V10.3334C0.666992 12.1758 2.1579 13.6667 4.00033 13.6667C5.84275 13.6667 7.33366 12.1758 7.33366 10.3334V3.36368H6.42457Z"
                    fill="#e84455"
                  ></path>
                </svg>
                <span>{selectDocumentFileName}</span>
              </div>
            </div>
            <Form>
              {flashMessage.message && (
                <div
                  className={`mt-3 mx-w-620 alert ${flashMessage.type === "success"
                    ? "alert-success"
                    : "alert-danger"
                    } text-center`}
                  role="alert"
                >
                  {flashMessage.message}
                </div>
              )}
              <Form.Group className="mt-3 mb-3" controlId="exampleForm.ControlTextarea1">
                <Form.Control placeholder='Votre message' as="textarea" rows={3} name='reason' onChange={(e) => setReasonMessage(e.target.value)} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <div className="text-end">
              <Button variant="primary" type="submit">
                Marquer comme invalide
              </Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default InvalidDocument;
