import axios from "axios";
import { useEffect, useState } from "react";
import { Card, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import { hash_md5 } from "../utils/common";

const registerFormDefaultValues = {
    name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: ""
}

const formItems = [
    {
        "name": "name",
        "type": "text",
        "label": "Nombre",
        "placeholder": "Jane"
    },
    {
        "name": "last_name",
        "type": "text",
        "label": "Apellidos",
        "placeholder": "Doe"
    },
    {
        "name": "email",
        "type": "email",
        "label": "Correo",
        "placeholder": "janedoe@example.com"
    },
    {
        "name": "password",
        "type": "password",
        "label": "Contraseña",
        "placeholder": "********"
    },
    {
        "name": "confirm_password",
        "type": "password",
        "label": "Confirmar contraseña",
        "placeholder": "********"
    }
]

const RegisterForm = ({ token, onSuccesAction }) => {

    const [registerFormValues, setRegisterFormValues] = useState(registerFormDefaultValues);
    const [isLoading, setIsLoading] = useState(false);

    const updateValue = (e) => {
        setRegisterFormValues({ ...registerFormValues, [[e.target.name]]: e.target.value })
    }

    const submitForm = (e) => {
        e.preventDefault();

        var { name, last_name, email, password, confirm_password } = registerFormValues;

        if (password !== confirm_password){
            toast.error("Las contraseñas no coinciden")
        }else if(password.trim().length === 0 || confirm_password.trim().length === 0){
            toast.warning("Las contraseñas no pueden quedar en blanco")
        }else {
            setIsLoading(true);
            password = hash_md5(password);
            axios.post("/api/app/users/register", 
            { name, last_name, email, password, "type": 1 }, 
            { headers: { "Authorization": token }}).then(resp => {
                if (resp.data.message){
                    toast.success(resp.data.message)
                }
                onSuccesAction();
            }).catch(error => {
                console.log(error)
                if(error.response.data){
                    toast.error(error.response.data.error)
                }else {
                    toast.error("Ha ocurrido un error en la petición")
                }
            }).finally(() => {
                setIsLoading(false);
                setRegisterFormValues(registerFormDefaultValues)
            })

        }

    }

    return (
        <Card style={{ "margin": "12px 0" }}>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick />
            <Card.Header>Registrar usuario</Card.Header>
            <Card.Body>
                <Form onSubmit={submitForm}>
                    <Row>
                        {
                            formItems.map(({ name, label, type, placeholder }) => {
                                return (
                                    <Col xs={12} md={6} lg={4} style={{ "margin": "8px 0" }} key={name}>
                                        <Form.Group>
                                            <Form.Label style={{ "fontSize": "10.5pt" }}>{label}</Form.Label>
                                            <Form.Control
                                                name={name}
                                                placeholder={placeholder}
                                                value={registerFormValues[[name]]}
                                                required={true}
                                                type={type}
                                                onChange={updateValue} />
                                        </Form.Group>
                                    </Col>
                                )
                            })
                        }
                        <Col xs={12} md={6} lg={4} style={{ "textAlign": "center", "margin": "auto" }} >
                            {
                                isLoading ? <Spinner animation="border" /> :
                                    <Button type="submit" variant="outline-success">Añadir</Button>
                            }
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    )
}

export default RegisterForm;