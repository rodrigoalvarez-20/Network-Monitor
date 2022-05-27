import { Col, Row, Button, Form, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from 'react-toastify';
import { _wait } from "../utils/common";

const RouterUser = (props) => {

    const [userValues, setUserValues] = useState({
        "username": "", "privilege": 1, "pwd": ""
    });

    const [isAddingLoading, setIsAddingLoading] = useState(false);
    const [isUpdatingLoading, setIsUpdatingLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [cookies] = useCookies(["token"]);

    useEffect(() => {
        const { username, privilege, pwd } = props;
        setUserValues({ username, privilege, pwd })
    }, [props]);

    const updateValues = (e) => {
        setUserValues({ ...userValues, [[e.target.name]]: e.target.value });
    }

    const addUser = () => {
        setIsAddingLoading(true);
        const { username, pwd, privilege } = userValues;
        const data = {
            username,
            pwd,
            "privilege": parseInt(privilege),
            "route": props.route,
            "method": "ssh"
        }

        const headers = {
            headers: { "Authorization": cookies.token }
        }

        axios.post("/api/routers/users", data, headers).then(rspAdd => {
            if (rspAdd.data.message) {
                toast.success(`${rspAdd.data.message} via ${rspAdd.data.method}`)
            }
        }).catch(errAdd => {
            console.log(errAdd);
            if(errAdd.response.data.error){
                toast.error(errAdd.response.data.error);
            }else{
                toast.error("Ha ocurrido un error al añadir el usuario")
            }
        }).finally(() => {
            setIsAddingLoading(false);
            _wait().then(() => window.location.reload());
        });

    }

    const updateUser = () => {
        setIsUpdatingLoading(true);
        const { username, pwd, privilege } = userValues;

        const data = {
            "old_username": props.username,
            username,
            pwd,
            "privilege": parseInt(privilege),
            "route": props.route,
            "method": "ssh"
        }

        const headers = {
            headers: { "Authorization": cookies.token }
        }

        axios.post("/api/routers/users", data, headers).then(rspUpdate => {
            if (rspUpdate.data.message) {
                toast.success(`${rspUpdate.data.message} via ${rspUpdate.data.method}`)
            }
        }).catch(errupdate => {
            console.log(errupdate);
            if (errupdate.response.data.error) {
                toast.error(errupdate.response.data.error);
            } else {
                toast.error("Ha ocurrido un error al modificar el usuario")
            }
        }).finally(() => {
            setIsUpdatingLoading(false);
            _wait().then(() => window.location.reload());
        });
    }

    const deleteUser = () => {
        setIsDeleteLoading(true);

        const data = {
            "old_username": props.username,
            "delete": true,
            "route": props.route,
            "method": "ssh"
        }

        const headers = {
            headers: { "Authorization": cookies.token }
        }

        axios.post("/api/routers/users", data, headers).then(rspDelete => {
            if (rspDelete.data.message) {
                toast.success(`${rspDelete.data.message} via ${rspDelete.data.method}`)
            }
        }).catch(errDel => {
            console.log(errDel);
            if (errDel.response.data.error) {
                toast.error(errDel.response.data.error);
            } else {
                toast.error("Ha ocurrido un error al eliminar el usuario")
            }
        }).finally(() => {
            setIsAddingLoading(false);
            _wait().then(() => window.location.reload());
        });
    }


    function renderAddButton() {
        return isAddingLoading ?
            <Spinner animation="border" /> :
            <Button style={{ "margin": "6px auto" }} variant="outline-success" onClick={addUser}>Agregar</Button>
    }

    function renderUpdateButton() {
        return isUpdatingLoading ? <Spinner animation="border" /> :
            <Button style={{ "margin": "6px auto" }} variant="outline-info" onClick={updateUser} >Guardar</Button>
    }

    function renderDeleteButton() {
        return isDeleteLoading ? <Spinner animation="border" /> :
            <Button style={{ "margin": "6px auto" }} variant="outline-danger" onClick={deleteUser} >Eliminar</Button>
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick />

            <Row>
                <Col xs={12} sm={3}>
                    <Form.Group>
                        <Form.Label>Nombre de usuario</Form.Label>
                        <Form.Control name="username" onChange={updateValues} value={userValues.username} required />
                    </Form.Group>
                </Col>
                <Col xs={12} sm={3}>
                    <Form.Group>
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control type="password" name="pwd" placeholder="********" onChange={updateValues} value={userValues.pwd} required minLength={8} />
                    </Form.Group>
                </Col>
                <Col xs={12} sm={2}>
                    <Form.Group>
                        <Form.Label>Privilegio</Form.Label>
                        <Form.Select name="privilege" value={userValues.privilege} onChange={updateValues} >
                            <option value={1}>1</option>
                            <option value={15}>15</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                {
                    props.type !== "add" ?
                        <>
                            <Col xs={12} sm={2} style={{ "margin": "auto", "textAlign": "center" }}>
                                {
                                    renderUpdateButton()
                                }
                            </Col>
                            <Col xs={12} sm={2} style={{ "margin": "auto", "textAlign": "center" }}>
                                {
                                    renderDeleteButton()
                                }
                            </Col>
                        </> :
                        <Col xs={12} sm={2} style={{ "margin": "auto", "textAlign": "center" }}>
                            {
                                renderAddButton()
                            }
                        </Col>
                }
            </Row>
        </>
    )
}

export default RouterUser;