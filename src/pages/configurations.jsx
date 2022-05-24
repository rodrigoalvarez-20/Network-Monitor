import axios from "axios";
import { useEffect, useState } from "react";
import { Col, Container, Form, Row, Button, Spinner } from "react-bootstrap";
import { useCookies } from "react-cookie";
import Selector from "../components/selector";
import { available_logs, update_intervals, lost_percentage } from "../utils/common";
import { ToastContainer, toast } from 'react-toastify';

const ConfigsPage = () => {

    const [cookies] = useCookies(['token']);
    const [appConfigs, setAppConfigs] = useState({
        actual_log: "",
        logs_timer: 5,
        map_interval: 5,
        interface_interval: 5,
        lost_packets_percentage: 10
    })

    const [isLoading, setIsLoading] = useState(false);

    const options = [
        {
            label: "Archivo de logs seleccionado",
            dataset: available_logs,
            selected: appConfigs.actual_log,
            select_name: "actual_log"
        },
        {
            label: "Actualizacion de logs",
            dataset: update_intervals,
            selected: appConfigs.logs_timer,
            select_name: "logs_timer"
        },
        {
            label: "Actualización de mapeo de red",
            dataset: update_intervals,
            selected: appConfigs.map_interval,
            select_name: "map_interval"
        },
        {
            label: "Actualización de interfaz monitoreada",
            dataset: update_intervals,
            selected: appConfigs.interface_interval,
            select_name: "interface_interval"
        },
        {
            label: "Porcentaje de paquetes perdidos",
            dataset: lost_percentage,
            selected: appConfigs.lost_packets_percentage,
            select_name: "lost_packets_percentage"
        }
    ]

    useEffect(() => {
        axios.get("/api/app/configurations", { headers: { "Authorization": cookies.token } }).then(configRsp => {
            //console.log(configRsp.data);
            setAppConfigs(configRsp.data["configs"])
        }).catch(configsErr => {
            console.log(configsErr);
            if (configsErr.response.data) {
                toast.warning(configsErr.response.data.error);
            }
        });
    }, []);

    const updateConfigValue = (e) => {
        setAppConfigs({ ...appConfigs, [[e.target.name]]: e.target.value })
    }

    const savePrefs = (e) => {
        e.preventDefault();
        setIsLoading(true)
        axios.post("/api/app/configurations", { ...appConfigs }, { headers: { "Authorization": cookies.token } }).then(updateRsp => {
            toast.success(updateRsp.data.message);
        }).catch(updateErr => {
            console.log(updateErr);
            if (updateErr.data.response.error) {
                toast.error(updateErr.data.response.error);
            }
        }).finally(() => {
            setIsLoading(false);
        })
    }

    return (
        <Container style={{ "marginTop": "12px" }}>
            <h3>Configuración de la aplicación</h3>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick />
            <Form onSubmit={savePrefs}>
                <Row style={{ "marginTop": "12px" }}>
                    {
                        options.map(({ label, dataset, selected, select_name }) => {
                            return (
                                <Col xs={12} sm={4} key={select_name}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{label}</Form.Label>
                                        <Selector dataset={dataset} def_value={selected} action={updateConfigValue} select_name={select_name} />
                                    </Form.Group>
                                </Col>
                            )
                        })
                    }
                    <Col xs={12} sm={4} style={{ "margin": "auto", "justifyContent": "center", "display": "flex" }}>
                        {
                            isLoading ? <Spinner animation="border" /> :
                                <Button type="submit" variant="outline-success">Guardar cambios</Button>
                        }

                    </Col>
                </Row>
            </Form>
        </Container>
    )
}

export default ConfigsPage;