import React, { Fragment, useEffect } from 'react'
import "./MissingDocument.css"
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button, Form } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import MissingDocumentService from '../../API/MissingDocument/MissingDocumentService';

const MissingDocument = (props) => {
  const { link, selectDocumentId, selectDocumentFileName } = props;
  const { t } = useTranslation();
  const { id } = useParams();

  const [showmodal, setShowmodal] = useState(false);
  const [reasonMessage, setReasonMessage] = useState("");
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });

  const handleModalClose = () => setShowmodal(false);
  const handleModalShow = () => setShowmodal(true);

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
      // user_document_file_id: selectDocumentId,
      reason: reasonMessage,
      type: "note"
    };
    try {
      const response = await MissingDocumentService.add_document_disability_reason(disabilityReasonData);
      if (response.data.status) {
        setReasonMessage("");
        handleModalClose();
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

  return (
    <Fragment>
      {
        link ? <Link onClick={handleModalShow} className="link-wrap">Ajouter une note</Link>
        :
        <Button variant="primary" onClick={handleModalShow}>Ajouter une note</Button>
      }
      <Modal className='missing-doc-modal' show={showmodal} onHide={handleModalClose}>
        <Form onSubmit={AddDocumentDisabilityReason}>

          <Modal.Header closeButton>
            <Modal.Title>Ajouter une note</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h2>Ajouter une note <span>*</span></h2>
            
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
              <Button variant="primary" type="submit">Ajouter</Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default MissingDocument;