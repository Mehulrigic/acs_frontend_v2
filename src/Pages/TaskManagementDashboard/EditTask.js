import React, { Fragment, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button, Form } from 'react-bootstrap';
import TaskManagementService from '../../API/TaskManagement/TaskManagementService';
import Select from "react-select";
import DatePicker from 'react-datepicker';
import { fr } from "date-fns/locale";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EditTask = (props) => {
  const { t } = useTranslation();

  const { editTaskFormShow, setEditTaskFormShow, search, sort, currentPage, taskStatusList, taskPriorityList, TaskList, taskId } = props;

  const [taskTitle, setTaskTitle] = useState("");
  const [taskStatus, setTaskStatus] = useState([]);
  const [taskPriority, setTaskPriority] = useState([]);
  const [userList, setUserList] = useState([]);
  const [taskDetail, setTaskDetail] = useState({});
  const [userDocumentId, setUserDocumentId] = useState("");
  const [userDocumentFileId, setUserDocumentFileId] = useState("");
  const [userDocumentList, setUserDocumentList] = useState([]);
  const [userDocumentFileList, setUserDocumentFileList] = useState([]);
  const [assignedToUser, setAssignedToUser] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState([]);
  const [selectedFolderFile, setSelectedFolderFile] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });

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

  useEffect(() => {
    if (flashMessage.message) {
      const timer = setTimeout(() => {
        setFlashMessage({ type: "", message: "" });
      }, 2000); // Adjust time as needed

      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  useEffect(() => {
    if (assignedToUser?.value) {
      handleAssignedUserChange(assignedToUser);
    }
  }, [assignedToUser]);

  useEffect(() => {
    if (userDocumentId && userDocumentList?.length > 0) {
      let filter = userDocumentList?.filter(data => data.value === userDocumentId)
      handleUserDocumentChange(filter[0]);
    }
  }, [userDocumentId, userDocumentList]);

  useEffect(() => {
    if (userDocumentFileId && userDocumentFileList?.length > 0) {
      let filter = userDocumentFileList?.filter(data => data.value === userDocumentFileId)
      handleUserDocumentFileChange(filter[0]);
    }
  }, [userDocumentFileId, userDocumentFileList]);

  useEffect(() => {
    if (editTaskFormShow) {
      ShowTaskDetail(taskId);
      UserList();
    }
  }, [editTaskFormShow]);

  const handleClose = () => {
    setEditTaskFormShow(false);
    setTaskTitle("");
    setTaskStatus([]);
    setTaskPriority([]);
    setDueDate("");
    setAssignedToUser([]);
    setSelectedFolder([]);
    setSelectedFolderFile([]);
    setUserDocumentList([]);
    setUserDocumentFileList([]);
  };

  const ShowTaskDetail = async (taskId) => {
    try {
      const response = await TaskManagementService.task_show(taskId);
      if (response.data.status) {
        const task = response.data.task;
        setTaskDetail(task);
        setTaskTitle(response.data.task.title);
        setTaskStatus(TaskStatusOptions?.find(opt => opt.value === task?.status));
        setTaskPriority(PriorityOptions.find(opt => opt.value === task?.priority));
        setAssignedToUser({
          label: response.data.task.assigned_to.first_name || "" + " " + response.data.task.assigned_to.last_name || "",
          value: response.data.task.assigned_to.id,
        });
        setUserDocumentId(response.data.task.user_document_id);
        setUserDocumentFileId(response.data.task.user_document_file_id);
        setDescription(response.data.task.description);
        setDueDate(formatDate(response.data.task.due_date));
      }
    } catch (error) {
      console.log(error);
    }
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
  console.log(dueDate);

  const TaskUpdate = async (e) => {
    e.preventDefault();
    try {
      var userData = {
        title: taskTitle,
        status: taskStatus && taskStatus?.value,
        priority: taskPriority && taskPriority?.value,
        assigned_to: assignedToUser && assignedToUser?.value,
        user_document_id: selectedFolder && selectedFolder?.value,
        user_document_file_id: selectedFolderFile && selectedFolderFile?.value,
        due_date: dueDate ? getFormattedDate(dueDate) : null,
        description: description
      };

      const response = await TaskManagementService.task_update(taskId, userData);

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
    setAssignedToUser(selectedOption);
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

  return (
    <Fragment>
      <style> {` button.btn.btn-primary  { background-color: ${localStorage.getItem('button_color') ? JSON.parse(localStorage.getItem('button_color')) : "#e84455"} !Important};`} </style>

      {/* <Link className="edit" onClick={handleShow}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.059 9.02L14.979 9.94L5.91902 19H4.99902V18.08L14.059 9.02ZM17.659 3C17.409 3 17.149 3.1 16.959 3.29L15.129 5.12L18.879 8.87L20.709 7.04C21.099 6.65 21.099 6.02 20.709 5.63L18.369 3.29C18.169 3.09 17.919 3 17.659 3ZM14.059 6.19L2.99902 17.25V21H6.74902L17.809 9.94L14.059 6.19Z"
            fill="#e84455"
          />
        </svg>
      </Link> */}

      {/* Edit Task */}
      <Modal show={editTaskFormShow} onHide={() => handleClose()} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modifier la tâche</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={TaskUpdate}>
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
                    value={assignedToUser}
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
                  <DatePicker
                    placeholderText={"dd/MM/yyyy"}
                    selected={dueDate ? getFormattedDate(dueDate) : null}
                    onChange={(date) => setDueDate(formatDate(date))}
                    dateFormat="dd/MM/yyyy"
                    locale={fr}
                  />
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
          <Button variant="primary" onClick={(e) => TaskUpdate(e)}>
            Modifier la tâche
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default EditTask;
