import axios from "axios"
import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { Container, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import MUIDataTable from "mui-datatables";
import RegisterForm from "../components/registerForm";

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
    const [isLoading, setIsLoading] = useState(true)
    const [cookies] = useCookies(['token']);
    

    function get_users() {
        axios.get("/api/app/users", { headers: { "Authorization": cookies.token } }).then(response => {
            setUsersList(response.data["users"]);
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            setIsLoading(false);
        });
    }

    useEffect(() => {
        get_users()
    }, [])

    return (
        <Container style={{ "margin": "8px" }}>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick />
            
            <RegisterForm token={cookies.token} onSuccesAction={get_users} />
            
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
                            "selectableRows": "none"
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