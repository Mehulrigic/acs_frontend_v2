import React, { Fragment, useEffect } from 'react'
import "./MissingDocument.css"
import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button, Form } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import MissingDocumentService from '../../API/MissingDocument/MissingDocumentService';

const MissingDocument = (props) => {
  const { link, sort, search, currentPage, selectActionType, GetHistoryListDocument } = props;
  const { t } = useTranslation();
  const { id } = useParams();

  const [showmodal, setShowmodal] = useState(false);
  const [reasonMessage, setReasonMessage] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

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
    
    if (loading) return;

    if (reasonMessage == "") {
      setFlashMessage({ type: "error", message: t("requriedErrorMessageLabel") });
      return;
    }

    setLoading(true);

    var disabilityReasonData = {
      user_document_id: id,
      // user_document_file_id: selectDocumentId,
      reason: reasonMessage,
      is_important: isImportant ? 1 : 0,
      type: "note"
    };

    try {
      const response = await MissingDocumentService.add_document_disability_reason(disabilityReasonData);
      if (response.data.status) {
        setLoading(false);
        setReasonMessage("");
        GetHistoryListDocument(id, sort, search, currentPage, selectActionType);
        handleModalClose();
      } else {
        setLoading(false);
        setFlashMessage({
          type: "error",
          message: t("somethingWentWrong"),
        });
      }
    } catch (error) {
      setLoading(false);
      setFlashMessage({
        type: "error",
        message: t("somethingWentWrong"),
      });
    } finally {
      setLoading(false);
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

              <div className="mt-3">
                <Form.Group className="mt-3 mb-3" controlId="exampleForm.ControlTextarea1">
                  <Form.Control 
                    placeholder='Votre message' 
                    as="textarea" 
                    rows={3} 
                    name='reason' 
                    onChange={(e) => setReasonMessage(e.target.value)} 
                  />
                </Form.Group>
                <Form.Group controlId="importantNoteCheckbox" className="mt-2 mb-0">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <Form.Check
                      type="checkbox"
                      name="isImportant"
                      value={isImportant}
                      onChange={(e) => setIsImportant(e.target.checked)}
                    />
                    <Form.Label style={{ cursor: "pointer", paddingTop: "10px" }}>Remarque importante</Form.Label>
                  </div>
                </Form.Group>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <div className="text-end">
              <Button variant="primary" type="submit" disabled={loading}>Ajouter</Button>
            </div>
          </Modal.Footer>
        </Form>
      </Modal>
    </Fragment>
  );
};

export default MissingDocument;