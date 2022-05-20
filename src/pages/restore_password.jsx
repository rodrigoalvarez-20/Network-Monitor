import { useState } from "react"
import { Button, Container, Form, Spinner } from "react-bootstrap"
import { useNavigate } from 'react-router-dom';

import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import {  hash_md5 } from "../utils/common";

const passwordData = {
    "new_password": "",
    "confirm_password": ""
}

const RestorePassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [passwordForm, setPasswordForm] = useState(passwordData)
    const navigate = useNavigate();


    const sendRestoreRequest = (e) => {
        e.preventDefault();
        const {new_password, confirm_password} = passwordForm;
        if (new_password !== confirm_password){
            toast.error("Las contraseñas no coinciden")
        }else if (new_password === "" || confirm_password === ""){
            toast.warning("Los campos no pueden quedar vacios")
        }else {
            setIsLoading(true);
            const pwdHsh = hash_md5(new_password);
            const tk = window.location.search.split("tk=")[1]
            axios.post("/api/app/users/password", { "password": pwdHsh }, {headers: {"Authorization": tk}}).then(resp => {
                alert(resp.data.message);
                navigate("/login", {"replace": true})
                // Hacer la navegación
            }).catch(error => {
                console.log(error.response.data);
                if(error.response.data){
                    toast.error(error.response.data.error)
                }else {
                    toast.error("Ha ocurrido un error en la petición")
                }
            }).finally(() => {
                setPasswordForm(passwordData)
                setIsLoading(false);
            })
        }

    }

    return (
        <Container style={{"marginTop":"10%","width": "50%"}}>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick />
            <h3>Reestablecer contraseña</h3>
            <Form onSubmit={sendRestoreRequest} style={{ "textAlign": "start" }}>
                <Form.Group className="mb-3" controlId="new_pwd">
                    <Form.Label>Nueva contraseña</Form.Label>
                    <Form.Control
                        type="password"
                        value={passwordForm.new_password}
                        minLength="8"
                        required={true}
                        onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                        placeholder="**********" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="confirm_pwd">
                    <Form.Label>Confirmar contraseña</Form.Label>
                    <Form.Control
                        type="password"
                        value={passwordForm.confirm_password}
                        required={true}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                        placeholder="**********" />
                </Form.Group>
                <div style={{ "textAlign": "end" }}>
                {
                    isLoading ? 
                        <Spinner animation="border" /> : 
                        <Button variant="outline-warning" type="submit">Reestablecer contraseña</Button>
                }
                    
                </div>
                
            </Form>
        </Container>
    )
}


export default RestorePassword;