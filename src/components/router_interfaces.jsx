import { useEffect, useState } from "react";
import { Accordion, Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import { useCookies } from "react-cookie";
import axios from "axios";

const RouterInterfaces = ({ interfaces, device, monitor = false, route }) => {

    const [interfacesList, setInterfacesList] = useState([])
    const [cookies] = useCookies(["token"]);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        setInterfacesList(interfaces);
    }, [interfaces])

    useEffect(() => {
        console.log(route);
    }, [route]);

    function updateValues(ev, idx) {
        const field = ev.target.name;
        var toUpdate = interfacesList[idx];
        toUpdate[field] = ev.target.value;
        setInterfacesList(old => {
            return old.map((i, j) => {
                return j === idx ? toUpdate : i
            })
        })
    }

    function updateCheckBox(state, idx) {
        var toUpdate = interfacesList[idx];
        toUpdate["monitor_status"] = state;
        setInterfacesList(old => {
            return old.map((i, j) => {
                return j === idx ? toUpdate : i
            })
        })
    }

    const makeUpdates = () => {
        setIsLoading(true)
        const headers = { headers: { "Authorization": cookies.token } }

        const monitorInterfaces = interfacesList.map(i => {
            return {
                "name": i["interface"],
                "status": i["monitor_status"] || false
            }
        })

        const configInterfaces = interfacesList.map(i => {

            var new_schema = {
                "interface": i["interface"],
                "ip": i["ip"],
                "mask": i["mask"]
            }
            if (i["status"] === "down"){
                new_schema["shutdown"] = true
            }else if(i["status"] === "up"){
                new_schema["power"] = true
            }

            return new_schema;
        })

        const configData = {
            device,
            monitor,
            "interfaces": monitorInterfaces
        }

        const routerData = {
            "original_name": device,
            "route": route,
            "method": "ssh",
            "interfaces": interfacesList
        }

        const requests = [
            axios.post("/api/routers/monitor", configData, headers),
            axios.patch("/api/routers/config", routerData, headers)];

        axios.all(requests).then(axios.spread((...responses) => {
            const rspMonitor = responses[0];
            const rspConfig = responses[1];

            if (rspMonitor.data.message) {
                toast.success(rspMonitor.data.message)
            }
            if (rspConfig.data.message) {
                toast.success(rspConfig.data.message)
            }

        })).catch(errors => {
            const errMonitor = errors[0];
            const errConfig = errors[1];

            if (errMonitor) {
                if (errMonitor.response.data) {
                    toast.error(errMonitor.response.data.error);
                } else {
                    toast.error("Ha ocurrido un error al actualizar la configuracion del monitor");
                }
            }
            if (errConfig) {
                if (errConfig.response.data) {
                    toast.error(errConfig.response.data.error);
                } else {
                    toast.error("Ha ocurrido un error al actualizar las interfaces del dispositivo");
                }
            }
        }).finally(() => {
            setIsLoading(false);
        });
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick />
            <div style={{ "margin": "12px", "textAlign": "end" }}>
                {
                    isLoading ? <Spinner animation="border" /> :
                        <Button variant="outline-warning" onClick={makeUpdates}>
                            Guardar cambios
                        </Button>
                }
            </div>
            <Accordion flush>
                {
                    interfacesList.map((int, idx) => {
                        return (
                            <Accordion.Item eventKey={idx} key={idx} >
                                <Accordion.Header>{int["interface"]}</Accordion.Header>
                                <Accordion.Body>
                                    <Row>
                                        <Col xs={12} sm={3}>
                                            <Form.Group>
                                                <Form.Label>Direccion IP</Form.Label>
                                                <Form.Control name="ip" value={int["ip"]} minLength={7} maxLength={15} disabled={int["interface"] === "Loopback0"} onChange={(e) => updateValues(e, idx)} />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} sm={3}>
                                            <Form.Group>
                                                <Form.Label>Mascara de subred</Form.Label>
                                                <Form.Control name="mask" key={idx} value={int["mask"] || "0.0.0.0"} disabled={int["interface"] === "Loopback0"} onChange={(e) => updateValues(e, idx)} />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} sm={3}>
                                            <Form.Group>
                                                <Form.Label>Estatus</Form.Label>
                                                <Form.Select name="status" value={int["status"]} disabled={int["interface"] === "Loopback0"} onChange={(e) => updateValues(e, idx)}>
                                                    <option value="up">Activa</option>
                                                    <option value="down">Desactivada</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} sm={3} style={{ "margin": "auto", "display": "flex", "justifyContent": "center" }}>
                                            <Form.Check name="monitor_status" checked={int["monitor_status"] || false} label="Monitorear" disabled={int["interface"] === "Loopback0"} onChange={(e) => updateCheckBox(e.target.checked, idx)} />
                                        </Col>
                                    </Row>

                                </Accordion.Body>
                            </Accordion.Item>
                        )
                    })
                }
            </Accordion>
        </>
    )

}

export default RouterInterfaces;