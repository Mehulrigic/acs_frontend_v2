import React, { Fragment, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button, Form } from 'react-bootstrap';
import TaskManagementService from '../../API/TaskManagement/TaskManagementService';
import Select from "react-select";
import DatePicker from 'react-datepicker';
import { fr } from "date-fns/locale";
import { useTranslation } from 'react-i18next';

const AddNewTask = (props) => {
  const { t } = useTranslation();
  const { addTaskForm, setAddTaskForm, search, sort, currentPage, taskStatusList, taskPriorityList, TaskList, userId } = props;

  const [taskTitle, setTaskTitle] = useState("");
  const [taskStatus, setTaskStatus] = useState([]);
  const [taskPriority, setTaskPriority] = useState([]);
  const [userList, setUserList] = useState([]);
  const [userDocumentList, setUserDocumentList] = useState([]);
  const [userDocumentFileList, setUserDocumentFileList] = useState([]);
  const [assignedUser, setAssignedUser] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState([]);
  const [selectedFolderFile, setSelectedFolderFile] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });

  useEffect(() => {
    if (flashMessage.message) {
      const timer = setTimeout(() => {
        setFlashMessage({ type: "", message: "" });
      }, 2000); // Adjust time as needed

      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  useEffect(() => {
    if (addTaskForm) {
      UserList();
    }
  }, [addTaskForm]);

  const handleShow = () => {
    setAddTaskForm(true);
  };

  const handleClose = () => {
    setAddTaskForm(false);
    setTaskTitle("");
    setTaskStatus([]);
    setTaskPriority([]);
    setDueDate("");
    setAssignedUser([]);
    setSelectedFolder([]);
    setSelectedFolderFile([]);
    setUserDocumentList([]);
    setUserDocumentFileList([]);
  };

  const UserList = async () => {
    try {
      const response = await TaskManagementService.task_assignable_users();
      if (response.data.status) {
        const formattedData = response.data.userList.map((user) => ({
          label: user.name,
          value: user.id,
        }));
        setUserList(formattedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const UserDocumentList = async (userid) => {
    try {
      const response = await TaskManagementService.user_document_list(userid);
      if (response.data.status) {
        const formattedData = response.data.folders.map((folder) => ({
          label: folder.folder_name,
          value: folder.id,
        }));
        setUserDocumentList(formattedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const UserDocumentFileList = async (documnetId) => {
    try {
      const response = await TaskManagementService.user_document_file_list(documnetId);
      if (response.data.status) {
        const formattedData = response.data.files.map((folderfile) => ({
          label: folderfile.filename,
          value: folderfile.id,
        }));
        setUserDocumentFileList(formattedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const TaskCreate = async (e) => {
    e.preventDefault();
    try {
      var userData = {
        title: taskTitle,
        status: taskStatus && taskStatus?.value,
        priority: taskPriority && taskPriority?.value,
        assigned_to: assignedUser && assignedUser?.value,
        user_document_id: selectedFolder && selectedFolder?.value,
        user_document_file_id: selectedFolderFile && selectedFolderFile?.value,
        due_date: dueDate ? getFormattedDate(dueDate) : null,
        description: description
      };

      const response = await TaskManagementService.task_create(userData);

      if (response.data.status) {
        handleClose();
        TaskList(search, sort, currentPage, taskStatusList, taskPriorityList);
      } else {
        setFlashMessage({ type: "error", message: "Something went wrong!" });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAssignedUserChange = (selectedOption) => {
    setAssignedUser(selectedOption);
    UserDocumentList(selectedOption?.value);
  };

  const handleUserDocumentChange = (selectedOption) => {
    setSelectedFolder(selectedOption);
    UserDocumentFileList(selectedOption?.value);
  };

  const handleUserDocumentFileChange = (selectedOption) => {
    setSelectedFolderFile(selectedOption);
  };

  const getFormattedDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(`${month}/${day}/${year}`); // Convert to MM/DD/YYYY format
  };

  const formatDate = (dateString) => {
    if (dateString) {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else {
      return "";
    }
  };

  const PriorityOptions = [
    { value: "high", label: "Haut" },
    { value: "medium", label: "Moyen" },
    { value: "low", label: "Faible" }
  ];

  const TaskStatusOptions = [
    { value: "in_progress", label: "En cours" },
    { value: "pending", label: "En attente" },
    { value: "cancelled", label: "Annulé" }
  ];

  return (
    <Fragment>
      <style> {` button.btn.btn-primary  { background-color: ${localStorage.getItem('button_color') ? JSON.parse(localStorage.getItem('button_color')) : "#e84455"} !Important};`} </style>

      <button className="btn btn-primary" onClick={handleShow}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="white" />
        </svg>
        Ajouter une nouvelle tâche
      </button>

      {/* Add Task */}
      <Modal show={addTaskForm} onHide={() => handleClose()} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Ajouter une nouvelle tâche</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={TaskCreate}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group controlId="taskTitle">
                  <Form.Label>Titre <span>*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    placeholder="Entrez le titre de la tâche"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group controlId="taskStatus">
                  <Form.Label>{t("status")} <span>*</span></Form.Label>
                  <Select
                    options={TaskStatusOptions}
                    value={taskStatus}
                    onChange={(selectedOption) => setTaskStatus(selectedOption)}
                    styles={{
                      container: (provided) => ({
                        ...provided,
                        width: '100%',
                      }),
                      menu: (provided) => ({
                        ...provided,
                        width: '100%',
                      }),
                    }}
                    placeholder={"Sélectionnez le statut de la tâche"}
                    isSearchable={true}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group controlId="taskPriority">
                  <Form.Label>Priorité <span>*</span></Form.Label>
                  <Select
                    options={PriorityOptions}
                    value={taskPriority}
                    onChange={(selectedOption) => setTaskPriority(selectedOption)}
                    styles={{
                      container: (provided) => ({
                        ...provided,
                        width: '100%',
                      }),
                      menu: (provided) => ({
                        ...provided,
                        width: '100%',
                      }),
                    }}
                    placeholder={"Sélectionnez la priorité"}
                    isSearchable={true}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group controlId="assignedTo">
                  <Form.Label>Attribué à <span>*</span></Form.Label>
                  <Select
                    options={userList}
                    value={assignedUser}
                    onChange={(selectedOption) => handleAssignedUserChange(selectedOption)}
                    styles={{
                      container: (provided) => ({
                        ...provided,
                        width: '100%',
                      }),
                      menu: (provided) => ({
                        ...provided,
                        width: '100%',
                      }),
                    }}
                    placeholder={"Sélectionner un utilisateur"}
                    isSearchable={true}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group controlId="assignedBy">
                  <Form.Label>Document utilisateur</Form.Label>
                  <Select
                    options={userDocumentList}
                    value={selectedFolder}
                    onChange={(selectedOption) => handleUserDocumentChange(selectedOption)}
                    styles={{
                      container: (provided) => ({
                        ...provided,
                        width: '100%',
                      }),
                      menu: (provided) => ({
                        ...provided,
                        width: '100%',
                      }),
                    }}
                    placeholder={"Sélectionnez le document utilisateur"}
                    isSearchable={true}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group controlId="assignedBy">
                  <Form.Label>Fichier de document utilisateur</Form.Label>
                  <Select
                    options={userDocumentFileList}
                    value={selectedFolderFile}
                    onChange={(selectedOption) => handleUserDocumentFileChange(selectedOption)}
                    styles={{
                      container: (provided) => ({
                        ...provided,
                        width: '100%',
                      }),
                      menu: (provided) => ({
                        ...provided,
                        width: '100%',
                      }),
                    }}
                    placeholder={"Sélectionnez le fichier de document utilisateur"}
                    isSearchable={true}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6 mb-3">
                <Form.Group controlId="assignedBy">
                  <Form.Label>Date d'échéance</Form.Label>
                  {/* <Form.Control
                    type="date"
                    name="due_date"
                    placeholder="Due date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  /> */}
                  <DatePicker
                    placeholderText={"dd/MM/yyyy"}
                    selected={dueDate ? getFormattedDate(dueDate) : null}
                    onChange={(date) => setDueDate(formatDate(date))}
                    dateFormat="dd/MM/yyyy"
                    locale={fr}
                  />
                  {/* <Form.Control
                    type="datetime-local"
                    name="due_date"
                    placeholder="Due date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)} // current date-time
                    // max={"2025-12-31T23:59"} // any max date-time you prefer
                  /> */}

                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group controlId="assignedBy">
                  <Form.Label>Description</Form.Label>
                  <textarea
                    type="textarea"
                    style={{ width: "100%" }}
                    name="description"
                    placeholder="Tapez ici..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="cancel-btn" variant="primary" onClick={() => handleClose()}>
            {t("cancelLabel")}
          </Button>
          <Button variant="primary" onClick={(e) => TaskCreate(e)}>
            Ajouter une tâche
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default AddNewTask;
