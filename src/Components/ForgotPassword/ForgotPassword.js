import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import LoginService from "../../API/Login/LoginService";

const ForgotPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isOTPSent, setIsOTPSent] = useState(false);
    const [timer, setTimer] = useState(60);
    const [email, setEmail] = useState("");
    const [flashMessage, setFlashMessage] = useState({ type: "", message: "" });
    const [otp, setOTP] = useState(new Array(4).fill(""));

    useEffect(() => {
        let countdown;
        if (isOTPSent && timer > 0) {
            countdown = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(countdown);
        }

        return () => clearInterval(countdown);
    }, [isOTPSent, timer]);

    useEffect(() => {
        if (flashMessage.message) {
            const timer = setTimeout(() => {
                setFlashMessage({ type: "", message: "" });
            }, 3000); // Adjust time as needed

            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    const SendOTP = async (e) => {
        e.preventDefault();
        if(email == "") {
            setFlashMessage({ type: "error", message: "Veuillez remplir ce champ." });
            return;
        }
        try {
            var emailData = {
                email: email ?? ""
            }
            const response = await LoginService.send_otp(emailData);
            if (response.data.status) {
                setFlashMessage({ type: "success", message: response.data.message });
                setIsOTPSent(true);
            } else {
                setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const ReSendOTP = async (e) => {
        e.preventDefault();

        try {
            var emailData = {
                email: email ?? ""
            }
            const response = await LoginService.reSend_otp(emailData);
            if (response.data.status) {
                setFlashMessage({ type: "success", message: response.data.message });
                setTimer(60);
                setIsOTPSent(true);
            } else {
                setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const VerifyOTP = async (e) => {
        e.preventDefault();
        if(otp.every((value) => value === "")){
            setFlashMessage({ type: "error", message: "Veuillez remplir ce champ." });
            return;
        }
        try {
            const finalOTP = otp.join("");
            localStorage.setItem("code", finalOTP);
            var otpData = {
                code: finalOTP ?? ""
            }
            const response = await LoginService.verify_otp(otpData);
            if (response.data.status) {
                setFlashMessage({ type: "success", message: response.data.message });
                setIsOTPSent(false);
                navigate("/reset-password");
            } else {
                setFlashMessage({ type: "error", message: response.data.message || t("somethingWentWrong") });
            }
        } catch (error) {
            console.log(error);
            setFlashMessage({ type: "error", message: error.response.data.message || t("somethingWentWrong") });
        }
    };

    const handleOTPChange = (value, index) => {
        const updatedOTP = [...otp];
        updatedOTP[index] = value;
        setOTP(updatedOTP);

        // Auto-focus the next input
        if (value && index < otp.length - 1) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    return (
        <Fragment>
            <Container className="p-0 login-container" fluid>
            <div className="login-header">
        <img className="login-logo" src={"images/login-logo-new.png"} />
        </div>
                <Row className="m-0">
                    {/* <Col className="p-0" lg={6}>
                        <div className="left-column"></div>
                    </Col> */}
                    <Col className="p-0" lg={12}>
                        <div className="right-column">
                            <div className="login-top-logo">
                                <img className="login-logo" src={"images/panel-logo.png"} />
                            </div>
                            <h2 className="text-center">{t("forgotPasswordTitle")}</h2>
                            <div className="login-wrapper">
                                <Form onSubmit={!isOTPSent ? SendOTP : VerifyOTP}>
                                    {/* Flash Message */}
                                    {flashMessage.message && (
                                        <div
                                            className={`alert ${flashMessage.type === "success" ? "alert-success" : "alert-danger"
                                                } text-center`}
                                            role="alert"
                                        >
                                            {flashMessage.message}
                                        </div>
                                    )}

                                    {!isOTPSent ? (
                                        // Email Input
                                        <Form.Group controlId="formBasicEmail">
                                            <Form.Label>{t("emailLabel")} <span>*</span></Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="ex : jean.dupont@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </Form.Group>
                                    ) : (
                                        // OTP Input
                                        <>
                                            <Form.Label>Entrez OTP <span>*</span></Form.Label>
                                            <div className="d-flex justify-content-center">
                                                {otp.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        id={`otp-${index}`}
                                                        type="text"
                                                        maxLength="1"
                                                        className="otp-input"
                                                        value={digit}
                                                        onChange={(e) => handleOTPChange(e.target.value, index)}
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key === "Backspace" &&
                                                                !otp[index] &&
                                                                index > 0
                                                            ) {
                                                                document
                                                                    .getElementById(`otp-${index - 1}`)
                                                                    .focus();
                                                            }
                                                        }}
                                                        onInput={(e) => {
                                                            if (!/^\d$/.test(e.target.value)) {
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="text-center mt-2" style={{ color: "#a9ac1c" }}>
                                                {timer == 0 ?
                                                    <p style={{ cursor: "pointer" }} onClick={ReSendOTP}>
                                                        {t("resendOTPIn")}
                                                    </p>
                                                    :
                                                    <p>
                                                        {timer}s
                                                    </p>
                                                }
                                            </div>
                                        </>
                                    )}

                                    <Button className="w-100" variant="primary" type="submit">
                                        {isOTPSent ? t("verifyLabel") : t("sendLabel")}
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

            <style jsx>{`
                .otp-input {
                    width: 50px;
                    height: 50px;
                    margin: 0 5px;
                    text-align: center;
                    font-size: 20px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }
                .otp-input:focus {
                    outline: none;
                    border-color: #007bff;
                }
            `}</style>
        </Fragment>
    );
};

export default ForgotPassword;
