import React, { useEffect, useState } from 'react';
import { Fragment } from 'react';
import { useTranslation } from "react-i18next";
import SidePanel from '../../Components/SidePanel/SidePanel';
import logo from "../../acs-logo.png";
import Form from 'react-bootstrap/Form';
import AddNewTask from './AddNewTask';
import Loading from '../../Common/Loading';
import Table from "react-bootstrap/Table";
import Paginations from '../../Components/Paginations/Paginations';
import TaskManagementService from '../../API/TaskManagement/TaskManagementService';
import { Link, useNavigate } from 'react-router-dom';
import EditTask from './EditTask';
import { Button, Modal } from 'react-bootstrap';

const TaskManagementDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();


    const [isLoading, setIsLoading] = useState(false);
    const [logoImageShow, setLogoImageShow] = useState("");
    const [rightPanelThemeColor, setRightPanelThemeColor] = useState("");
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [addTaskForm, setAddTaskForm] = useState(false);
    const [editTaskFormShow, setEditTaskFormShow] = useState(false);

    const [statisticsData, setStatisticsData] = useState({
        pending: "0",
        in_progress: "0",
        completed: "0",
        cancelled: "0"
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [sort, setSort] = useState({ key: "created_at", value: "desc" });
    const [taskListData, setTaskListData] = useState([]);
    const [taskStatus, setTaskStatus] = useState("");
    const [taskPriority, setTaskPriority] = useState("");
    const [isRotated, setIsRotated] = useState(false);
    const [userId, setUserId] = useState("");
    const [taskId, setTaskId] = useState("");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            const user = JSON.parse(localStorage.getItem("user"));
            const logo_image = JSON.parse(localStorage.getItem("logo_image"));
            const right_panel_color = JSON.parse(localStorage.getItem("right_panel_color"));
            setRightPanelThemeColor(right_panel_color);
            setLogoImageShow(logo_image);
            setUserId(user?.id);
            TaskList(search, sort, currentPage, taskStatus, taskPriority);
        } else {
            navigate("/");
        }
    }, [sort]);

    const TaskList = async (search, sort, page = 1, status, priority) => {
        setIsLoading(true);
        try {
            var userData = {
                search: search ?? "",
                sort: {
                    key: sort.key,
                    value: sort.value
                },
                page,
                status: status ?? "",
                priority: priority ?? ""
            };

            const response = await TaskManagementService.task_index(userData);

            if (response.data.status) {
                setIsLoading(false);
                setTaskListData(response.data.task.data);
                setCurrentPage(response.data.task.meta.current_page);
                setTotalPages(response.data.task.meta.last_page);
                setTotalRecords(response.data.task.meta.total);
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error);
        }
    };

    const TaskDelete = async (taskId) => {
        setIsLoading(true);
        try {

            const response = await TaskManagementService.task_delete(taskId);

            if (response.data.status) {
                setIsLoading(false);
                handleCloseDeleteModal();
                TaskList(search, sort, currentPage, taskStatus, taskPriority);
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error);
        }
    };

    const handleStatusChange = (status) => {
        setTaskStatus(status);
        TaskList(search, sort, currentPage, status, taskPriority);
    };

    const handlePriorityChange = (priority) => {
        setTaskPriority(priority);
        TaskList(search, sort, currentPage, taskStatus, priority);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearchChange(search);
        }
    };

    const handleSearchChange = (search) => {
        setSearch(search);
        TaskList(search, sort, currentPage, taskStatus, taskPriority);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        TaskList(search, sort, currentPage, taskStatus, taskPriority);
    };

    const handleClickRotate = (column) => {
        const direction = sort.key === column ? sort.value === "desc" ? "asc" : "desc" : "asc";
        setSort({ key: column, value: direction });
        setIsRotated(!isRotated); // Toggle the class on click
    };

    return (
        <Fragment>
            <style> {` button.btn.btn-primary  { background-color: ${localStorage.getItem('button_color') ? JSON.parse(localStorage.getItem('button_color')) : "#e84455"} !Important};`} </style>

            <SidePanel
                sidebarLogo={(logoImageShow == "" || logoImageShow == null || logoImageShow == undefined) ? logo : `${process.env.REACT_APP_IMAGE_URL}/${logoImageShow}`}
            />

            <div className="dashboard-main-content manager-dashboard" style={{ backgroundColor: rightPanelThemeColor }}>
                <div className="top-header">
                    <h4>{t("TaskManagementLabel")}</h4>
                    <div className="mt-3 d-flex justify-content-between align-items-center">
                        <h1 className="m-0">{t("TaskManagementLabel")}</h1>
                        <AddNewTask
                            addTaskForm={addTaskForm}
                            setAddTaskForm={setAddTaskForm}
                            search={search}
                            sort={sort}
                            currentPage={currentPage}
                            taskStatusList={taskStatus}
                            taskPriorityList={taskPriority}
                            TaskList={TaskList}
                            userId={userId}
                        />
                    </div>
                </div>
                {isLoading ? <Loading /> :
                    <Fragment>
                        <div className="table-wrapper mt-16">
                            <div className="d-flex align-aitems-center gap-2 justify-content-between">
                                <h2 className='m-0'></h2>
                                <Form.Group
                                    className="relative"
                                    controlId="exampleForm.ControlInput1"
                                >
                                    <Form.Control
                                        type="search"
                                        placeholder={"Rechercher..."}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                    />
                                    <div
                                        className="search-icon"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleSearchChange(search, 1)}
                                    >
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 18 18"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M12.7549 11.2549H11.9649L11.6849 10.9849C12.6649 9.84488 13.2549 8.36488 13.2549 6.75488C13.2549 3.16488 10.3449 0.254883 6.75488 0.254883C3.16488 0.254883 0.254883 3.16488 0.254883 6.75488C0.254883 10.3449 3.16488 13.2549 6.75488 13.2549C8.36488 13.2549 9.84488 12.6649 10.9849 11.6849L11.2549 11.9649V12.7549L16.2549 17.7449L17.7449 16.2549L12.7549 11.2549ZM6.75488 11.2549C4.26488 11.2549 2.25488 9.24488 2.25488 6.75488C2.25488 4.26488 4.26488 2.25488 6.75488 2.25488C9.24488 2.25488 11.2549 4.26488 11.2549 6.75488C11.2549 9.24488 9.24488 11.2549 6.75488 11.2549Z"
                                                fill="#998f90"
                                            />
                                        </svg>
                                    </div>
                                </Form.Group>
                            </div>
                            <div className="table-wrap mt-24">
                                <Table responsive hover>
                                    <thead>
                                        <tr style={{ textWrap: "nowrap" }}>
                                            <th>
                                                <div className="d-flex align-items-center">
                                                    <span>Titre</span>
                                                    <Link
                                                        className={`sorting-icon ms-2`}
                                                        onClick={() => handleClickRotate("title")}
                                                    >
                                                        {sort.value === "asc" &&
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fill-opacity="0.5" />
                                                            </svg>
                                                        }

                                                        {sort.value === "desc" &&
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fill-opacity="0.5" />
                                                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                                                            </svg>
                                                        }
                                                    </Link>
                                                </div>
                                            </th>
                                            <th>
                                                <div className="d-flex align-items-center">
                                                    <span>Description</span>
                                                    <Link
                                                        className={`sorting-icon ms-2`}
                                                        onClick={() => handleClickRotate("description")}
                                                    >
                                                        {sort.value === "asc" &&
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fill-opacity="0.5" />
                                                            </svg>
                                                        }

                                                        {sort.value === "desc" &&
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fill-opacity="0.5" />
                                                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                                                            </svg>
                                                        }
                                                    </Link>
                                                </div>
                                            </th>
                                            <th className="select-drop">
                                                <div className="d-flex align-items-center">
                                                    <div>
                                                        <Form.Select
                                                            aria-label="Status"
                                                            value={taskStatus}
                                                            onChange={(e) => handleStatusChange(e.target.value)}
                                                        >
                                                            <option value="">{t("status")}</option>
                                                            <option value="pending">En attente</option>
                                                            <option value="in_progress">En cours</option>
                                                            <option value="completed">Complété</option>
                                                            <option value="cancel">Annuler</option>
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
                                                                    <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fill-opacity="0.5" />
                                                                </svg>
                                                            }

                                                            {sort.value === "desc" &&
                                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fill-opacity="0.5" />
                                                                    <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                                                                </svg>
                                                            }
                                                        </Link>
                                                    </div>
                                                </div>
                                            </th>
                                            <th className="select-drop">
                                                <div className="d-flex align-items-center">
                                                    <div>
                                                        <Form.Select
                                                            aria-label="Priority"
                                                            value={taskPriority}
                                                            onChange={(e) => handlePriorityChange(e.target.value)}
                                                        >
                                                            <option value="">Priorité</option>
                                                            <option value="low">Faible</option>
                                                            <option value="medium">Moyen</option>
                                                            <option value="high">Haut</option>
                                                        </Form.Select>
                                                    </div>
                                                    <div>
                                                        <Link
                                                            className={`sorting-icon ms-2`}
                                                            onClick={() => handleClickRotate("priority")}
                                                        >
                                                            {sort.value === "asc" &&
                                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                                                    <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fill-opacity="0.5" />
                                                                </svg>
                                                            }

                                                            {sort.value === "desc" &&
                                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fill-opacity="0.5" />
                                                                    <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                                                                </svg>
                                                            }
                                                        </Link>
                                                    </div>
                                                </div>
                                            </th>
                                            <th>
                                                <div className="d-flex align-items-center">
                                                    <span>Attribué par</span>
                                                    <Link
                                                        className={`sorting-icon ms-2`}
                                                        onClick={() => handleClickRotate("assigned_by.name")}
                                                    >
                                                        {sort.value === "asc" &&
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fill-opacity="0.5" />
                                                            </svg>
                                                        }

                                                        {sort.value === "desc" &&
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fill-opacity="0.5" />
                                                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                                                            </svg>
                                                        }
                                                    </Link>
                                                </div>
                                            </th>
                                            <th>
                                                <div className="d-flex align-items-center">
                                                    <span>Attribué à</span>
                                                    <Link
                                                        className={`sorting-icon ms-2`}
                                                        onClick={() => handleClickRotate("assigned_to.name")}
                                                    >
                                                        {sort.value === "asc" &&
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fill-opacity="0.5" />
                                                            </svg>
                                                        }

                                                        {sort.value === "desc" &&
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fill-opacity="0.5" />
                                                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                                                            </svg>
                                                        }
                                                    </Link>
                                                </div>
                                            </th>
                                            <th>
                                                <div className="d-flex align-items-center">
                                                    <span>Date d'échéance</span>
                                                    <Link
                                                        className={`sorting-icon ms-2`}
                                                        onClick={() => handleClickRotate("due_date")}
                                                    >
                                                        {sort.value === "asc" &&
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" />
                                                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" fill-opacity="0.5" />
                                                            </svg>
                                                        }

                                                        {sort.value === "desc" &&
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M9 3L5 6.99H8V14H10V6.99H13L9 3ZM9 3L5 6.99H8V14H10V6.99H13L9 3Z" fill="black" fill-opacity="0.5" />
                                                                <path d="M16 10V17.01H19L15 21L11 17.01H14V10H16Z" fill="black" />
                                                            </svg>
                                                        }
                                                    </Link>
                                                </div>
                                            </th>
                                            <th>
                                                <div className="d-flex align-items-center">
                                                    <span>Action</span>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {taskListData?.length > 0 ? (
                                            taskListData?.map((data) => (
                                                <tr key={data.id}>
                                                    <td className="bold-font">{data.title || "-"}</td>
                                                    <td className="bold-font">{data.description || "-"}</td>
                                                    <td className="bold-font">{data.status || "-"}</td>
                                                    <td className="bold-font">{data.priority || "-"}</td>
                                                    <td className="bold-font">
                                                        {data.assigned_by?.first_name || data.assigned_by?.last_name
                                                            ? `${data.assigned_by?.first_name || ""} ${data.assigned_by?.last_name || ""}`.trim()
                                                            : "-"}
                                                    </td>
                                                    <td className="bold-font">
                                                        {data.assigned_to?.first_name || data.assigned_to?.last_name
                                                            ? `${data.assigned_to?.first_name || ""} ${data.assigned_to?.last_name || ""}`.trim()
                                                            : "-"}
                                                    </td>
                                                    <td className="bold-font">{data.due_date || "-"}</td>
                                                    <td className="bold-font">
                                                        <div className="action-btn">
                                                            <Link className="edit" onClick={() => { setEditTaskFormShow(true); setTaskId(data.id) }}>
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
                                                            </Link>
                                                            <Link className="delete" onClick={(e) => { e.stopPropagation(); handleShowDeleteModal(); setTaskId(data.id); }}>
                                                                <svg
                                                                    width="24"
                                                                    height="24"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        d="M16 9V19H8V9H16ZM14.5 3H9.5L8.5 4H5V6H19V4H15.5L14.5 3ZM18 7H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7Z"
                                                                        fill="#e84455"
                                                                    />
                                                                </svg>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={10} style={{ textAlign: "center" }}>
                                                    No records found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                            {totalRecords > 10 && (
                                <Paginations
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                    itemsPerPage={10}
                                    totalItems={totalRecords}
                                />
                            )}
                        </div>
                    </Fragment>
                }
            </div>

            <EditTask
                editTaskFormShow={editTaskFormShow}
                setEditTaskFormShow={setEditTaskFormShow}
                search={search}
                sort={sort}
                currentPage={currentPage}
                taskStatusList={taskStatus}
                taskPriorityList={taskPriority}
                TaskList={TaskList}
                taskId={taskId}
            />

            {/* Delete Confirmation Popup */}
            <Modal className="final-modal" show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title><h2>Delete Task</h2></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete task?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="cancel-btn" variant="primary" onClick={handleCloseDeleteModal}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={() => TaskDelete(taskId)}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
};

export default TaskManagementDashboard;
