import { useState, useEffect } from "react";
import { Col, Container, Form, Image, Row, Button, Modal, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { hash_md5 } from "../utils/common";

import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";


const defForm = {
    "email": "",
    "password": "",
    "rst_email": ""
}

const Login = () => {

    const [loginData, setLoginData] = useState(defForm);
    const [showResetModal, setResetModalStatus] = useState(false);
    const [isLoginLoading, setLoginLoadingStatus] = useState(false);
    const [isResetLoading, setResetLoadingStatus] = useState(false);
    const [cookies, setCookies] = useCookies(['token']);

    const closeModal = () => {
        setLoginData({ ...loginData, rst_email: "" })
        setResetModalStatus(false)
        setResetLoadingStatus(false);
    }

    const openModal = () => setResetModalStatus(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (cookies.token !== undefined && cookies.token !== "") {
            navigate("/", { replace: true })
        }
    }, [cookies, navigate])


    const request_reset_email = () => {

        if (loginData.rst_email === "") {
            toast.error("El correo de recuperación no puede estar vacío")
        } else {
            setResetLoadingStatus(true);
            axios.post("/api/app/users/request_reset", { "email": loginData.rst_email }).then(response => {
                toast.info(response.data["message"]);
            }).catch(error => {
                console.log(error);
                if (error.response) {
                    toast.error(error.response.data["error"])
                } else {
                    toast.error("Ha ocurrido un error al realizar la petición")
                }
            }).finally(() => {
                setLoginData(defForm);
                setResetLoadingStatus(false);
                setResetModalStatus(false);
            })
        }
    }

    const loginUser = (e) => {
        e.preventDefault();

        const { email, password } = loginData;

        if (email === "" || password === "") {
            toast.warning("Por favor llene todos los campos")
        } else {
            setLoginLoadingStatus(true);
            axios.post("/api/app/users/login", { "email": loginData.email, "password": hash_md5(loginData.password) }).then(response => {
                toast.info(response.data["message"]);
                const { token, name, last_name } = response.data;
                setCookies("token", token, { path: "/" })
                setCookies("name", name, {path: "/"})
                setCookies("last_name", last_name, { path: "/" })
                window.location.reload();
            }).catch(errorLogin => {
                if (errorLogin.response.data) {
                    toast.error(errorLogin.response.data["error"])
                } else {
                    toast.error("Ha ocurrido un error al realizar la petición")
                }
            }).finally(() => {
                setLoginData(defForm);
                setLoginLoadingStatus(false);
            })
        }

    }

    function reset_password_modal() {
        return (
            <Modal show={showResetModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Reestablecer contraseña</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="usr_login_email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="janedoe@gmail.com"
                            value={loginData.rst_email}
                            onChange={(e) => setLoginData({ ...loginData, rst_email: e.target.value })} />
                        <Form.Text className="text-muted">
                            Se enviará un correo con las instrucciones para el reestablecimiento
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    {
                        isResetLoading ?
                            <Spinner animation="border" /> :
                            <Button variant="primary" onClick={request_reset_email}>
                                Enviar
                            </Button>
                    }
                </Modal.Footer>
            </Modal>
        )
    }

    return (
        <Container style={{
            "display": "flex",
            "textAlign": "center",
            "justifyContent": "center"
        }}>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick />
            {reset_password_modal()}
            <Row>
                <Col xs={12}>
                    <Image src={process.env.PUBLIC_URL + "logo.png"} with={150} style={{ "margin": "12px" }} />
                </Col>
                <Col xs={9} style={{ "margin": "auto" }}>
                    <Form onSubmit={loginUser} style={{ "textAlign": "start" }}>
                        <Form.Group className="mb-3" controlId="usr_login_email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="janedoe@gmail.com"
                                value={loginData.email}
                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password" placeholder="**********"
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            />
                        </Form.Group>
                        <Row style={{ "display": "flex" }}>
                            <Col xs={12}
                                style={{ "margin": "8px 0", "textAlign": "end" }}>
                                <Button
                                    onClick={openModal}
                                    variant="outline-info">
                                    ¿Olvidaste la contraseña?
                                </Button>
                            </Col>
                            <Col xs={12}
                                style={{ "margin": "8px 0", "textAlign": "center" }}>
                                {
                                    isLoginLoading ?
                                        <Spinner animation="border" /> :
                                        <Button variant="outline-primary" type="submit">Iniciar sesión</Button>
                                }

                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}


export default Login;