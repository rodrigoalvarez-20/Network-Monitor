import axios from "axios"
import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { Container, Spinner, Offcanvas, Button, Form } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import MUIDataTable from "mui-datatables";
import RegisterForm from "../components/registerForm";
import  {BiEditAlt} from "react-icons/bi";
import { AiTwotoneDelete } from "react-icons/ai";
const columns = [
    {
        name: "name",
        label: "Nombre",
        options: {
            filter: false,
            sort: true
        }
    },
    {
        name: "last_name",
        label: "Apellidos",
        options: {
            filter: false,
            sort: true
        }
    },
    {
        name: "email",
        label: "Correo",
        options: {
            filter: false,
            sort: true
        }
    },
    {
        name: "password",
        label: "Contraseña",
        options: {
            filter: false,
            sort: false
        }
    },
    {
        name: "actions",
        label: "Acciones",
        options: {
            filter: false,
            sort: false
        }
    }
]

const UsersPage = () => {
    const [usersList, setUsersList] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [displayPanel, setDisplayPanelState] = useState(false);
    const [userSelected, setUserSelected] = useState({name:"", "last_name": "", type: 1})
    const [isEditLoading, setIsEditLoading] = useState(false);
    
    const [actionsIndicators, setActionsIndicators] = useState([])
    const [cookies] = useCookies(['token']);

    function deleteUser(email, idx){
        actionsIndicators[idx] = true
        setActionsIndicators(actionsIndicators);
        axios.delete("/api/app/users", {"data": {email}, "headers": { "Authorization": cookies.token }}).then(rsp => {
            if (rsp.data.message){
                toast.success(rsp.data.message);
            }else {
                toast.success("Se ha eliminado el usuario");
            }
            get_users();
        }).catch(errorDelete => {
            console.log(errorDelete);
            if (errorDelete.response.data) {
                toast.error(errorDelete.response.data["error"])
            } else {
                toast.error("Ha ocurrido un error al realizar la petición")
            }
        }).finally(() => {
            actionsIndicators[idx] = false;
            setActionsIndicators(actionsIndicators);
        });
    }

    function toogleEdit(user){
        setUserSelected(user);
        setDisplayPanelState(true);
    }

    function get_users() {
        setIsLoading(true);
        axios.get("/api/app/users", { headers: { "Authorization": cookies.token } }).then(response => {
            setUsersList(response.data["users"].map((user, idx) => {
                actionsIndicators[idx] = false;
                setActionsIndicators(actionsIndicators);
                return {
                    ...user,
                    actions: <div style={{"display":"flex", "justifyContent":"center"}} id={idx}>
                    {
                        actionsIndicators[idx] ? <Spinner animation="border" variant="info" size="sm" /> : 
                        <>
                            <BiEditAlt size={24} color="#EC994B" style={{ "margin": "0 4px" }} onClick={() => toogleEdit(user)} />
                            <AiTwotoneDelete size={24} color="#FF5D5D" style={{ "margin": "0 4px" }} onClick={() => deleteUser(user["email"], idx)} />
                        </>
                    }
                        
                    </div>
                }
            }));
        }).catch(errorGetUsers => {
            console.log(errorGetUsers);
            if (errorGetUsers.response.data) {
                toast.error(errorGetUsers.response.data["error"])
            } else {
                toast.error("Ha ocurrido un error al realizar la petición")
            }
        }).finally(() => {
            setIsLoading(false);
        });
    }

    useEffect(() => {
        get_users()
    }, [])

    const closePanel = () => {
        setUserSelected({ name: "", last_name: "", type: 1 })
        setDisplayPanelState(false);
    }

    const editUser = (e) => {
        e.preventDefault();

        setIsEditLoading(true);
        const body = { name: userSelected.name, last_name: userSelected.last_name, type: parseInt(userSelected.type) }
        axios.patch("/api/app/users",body, {headers: { "Authorization": cookies.token }}).then(rspEdit => {
            console.log(rspEdit.data)
            if (rspEdit.data.message) {
                toast.success(rspEdit.data.message);
            } else {
                toast.success("Se ha actualizado el usuario");
            }
            get_users();
        }).catch(errorUpdate => {
            console.log(errorUpdate);
            if (errorUpdate.response.data) {
                toast.error(errorUpdate.response.data["error"])
            } else {
                toast.error("Ha ocurrido un error al realizar la petición")
            }
        }).finally(() => {
            setIsEditLoading(false);
            setDisplayPanelState(false);
        });

    }

    const update_user_selected = (e) => {
        setUserSelected({ ...userSelected, [[e.target.name]]: e.target.value })
    }

    return (
        <Container style={{ "margin": "8px" }}>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick />
            
            <RegisterForm token={cookies.token} onSuccesAction={get_users} />
            
            <Offcanvas show={displayPanel} onHide={closePanel} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Editar usuario</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form onSubmit={editUser}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                value={userSelected.name}
                                name="name"
                                onChange={update_user_selected}   
                                />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Apellidos</Form.Label>
                            <Form.Control
                                type="text"
                                value={userSelected.last_name}
                                name="last_name"
                                onChange={update_user_selected}   
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo de usuario</Form.Label>
                            <Form.Select 
                                size="md" 
                                name="type"
                                onChange={update_user_selected}   
                                defaultValue={userSelected.type}>
                                    <option value={1}>Administrador</option>
                                    <option value={2}>Lector</option>
                            </Form.Select>
                        </Form.Group>
                        <div style={{"margin":"12px 0", "justifyContent": "center", "display":"flex"}}>
                            {
                                isEditLoading ? <Spinner animation="border" /> :
                                    <Button variant="outline-warning" type="submit" >Guardar cambios</Button>
                            }
                        </div>
                        
                    </Form>
                </Offcanvas.Body>
            </Offcanvas>
            
            {
                isLoading ?
                    <div style={{ "textAlign": "center", "margin": "12px 0" }}><Spinner animation="border" /></div> :
                    <MUIDataTable
                        options={{
                            "download": false,
                            "filter": false,
                            "pagination": false,
                            "print": false,
                            "search": false,
                            "viewColumns": false,
                            "selectableRows": "none",
                            "rowHover": true,
                            "tableBodyMaxHeight": "520px"
                        }}
                        title="Lista de usuarios"
                        data={usersList}
                        columns={columns}
                    />
            }
        </Container>
    )
}

export default UsersPage