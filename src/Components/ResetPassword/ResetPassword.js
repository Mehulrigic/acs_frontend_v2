
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import LoginService from "../../API/Login/LoginService";

const ResetPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });
    const [resetPassword, setResetPassword] = useState(false);
    const [passwordShow, setPasswordShow] = useState(false);
    const [confirmPasswordShow, setConfirmPasswordShow] = useState(false);

    useEffect(() => {
        if (flashMessage.message) {
            const timer = setTimeout(() => {
                setFlashMessage({ type: "", message: "" });
            }, 2000); // Adjust time as needed


            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    useEffect(() => {
        if (resetPassword && flashMessage.message == "") {
            navigate("/");
        }
    }, [resetPassword, flashMessage]);


    const ResetPassword = async (e) => {
        e.preventDefault();

        try {
            const code = localStorage.getItem("code");
            var passwordData = {
                code: code ?? "",
                password: e.target.elements.newpassword.value ?? "",
                password_confirmation: e.target.elements.confirmpassword.value ?? ""
            }

            const response = await LoginService.reset_password(passwordData);
            if (response.data.status) {
                localStorage.removeItem("code");
                setResetPassword(true);
                setFlashMessage({ type: "success", message: response.data.message });
            } else {
                localStorage.removeItem("code");
                setResetPassword(false);
                setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
            }
        } catch (error) {
            localStorage.removeItem("code");
            setFlashMessage({ type: "error", message: error.response.data.message || t("somethingWentWrong") });
        }
    };

    return (
        <Fragment>
            <Container className="p-0 login-container" fluid>
                <Row className="m-0">
                    <Col className="p-0" lg={6}>
                        <div className="left-column"></div>
                    </Col>
                    <Col className="p-0" lg={6}>
                        <div className="right-column">
                            <h2 className="text-center">{t("loginTitle")}</h2>
                            <div className="login-wrapper">
                                <Form onSubmit={ResetPassword}>
                                    {flashMessage.message && (
                                        <div
                                            className={`alert ${flashMessage.type === "success" ? "alert-success" : "alert-danger"
                                                } text-center`}
                                            role="alert"
                                        >
                                            {flashMessage.message}
                                        </div>
                                    )}
                                    <Form.Group className="relative" controlId="formBasicEmail">
                                        <Form.Label>{t("newPassword")}</Form.Label>
                                        <Form.Control type={passwordShow ? "text" : "password"} placeholder={t("newPassword")} name="newpassword" />
                                        <Link className={passwordShow ? "eye-icon show" : "eye-icon"} onClick={() => setPasswordShow(!passwordShow)}>
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M12 6.5C15.79 6.5 19.17 8.63 20.82 12C19.17 15.37 15.8 17.5 12 17.5C8.2 17.5 4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5C10.62 14.5 9.5 13.38 9.5 12C9.5 10.62 10.62 9.5 12 9.5ZM12 7.5C9.52 7.5 7.5 9.52 7.5 12C7.5 14.48 9.52 16.5 12 16.5C14.48 16.5 16.5 14.48 16.5 12C16.5 9.52 14.48 7.5 12 7.5Z"
                                                    fill="#e84455"
                                                />
                                            </svg>
                                        </Link>
                                    </Form.Group>

                                    <Form.Group className="relative" controlId="formBasicPassword">
                                        <Form.Label>{t("confirmPassword")}</Form.Label>
                                        <Form.Control type={confirmPasswordShow ? "text" : "password"} placeholder={t("confirmPassword")} name="confirmpassword" />
                                        <Link className={confirmPasswordShow ? "eye-icon show" : "eye-icon"} onClick={() => setConfirmPasswordShow(!confirmPasswordShow)}>
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M12 6.5C15.79 6.5 19.17 8.63 20.82 12C19.17 15.37 15.8 17.5 12 17.5C8.2 17.5 4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5C10.62 14.5 9.5 13.38 9.5 12C9.5 10.62 10.62 9.5 12 9.5ZM12 7.5C9.52 7.5 7.5 9.52 7.5 12C7.5 14.48 9.52 16.5 12 16.5C14.48 16.5 16.5 14.48 16.5 12C16.5 9.52 14.48 7.5 12 7.5Z"
                                                    fill="#e84455"
                                                />
                                            </svg>
                                        </Link>
                                    </Form.Group>

                                    <Button className="w-100" variant="primary" type="submit">
                                        {t("loginButton")}
                                    </Button>
                                </Form>
                                <div className="text-center mt-4">
                                    <Link to="/" className="forgot-password common-link text-center">
                                        {t("loginTitle")}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </Fragment>
    );
};

export default ResetPassword;
