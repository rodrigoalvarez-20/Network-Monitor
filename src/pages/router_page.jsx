import { useEffect, useState } from "react";
import { Container, Col, Row, Spinner, Form, Tabs, Tab } from "react-bootstrap";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from 'react-toastify';
import Lottie from "react-lottie";
import * as routerAnimation from "../assets/routerAnimation.json";
import axios from "axios";
import RouterUsers from "../components/router_users";
import RouterInterfaces from "../components/router_interfaces";
import RouterProtocols from "../components/router_protocols";
import RouterMIB from "../components/router_mib";

const animOptions = {
    loop: true,
    autoplay: true,
    animationData: routerAnimation,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
    }
};

const RouterPage = () => {
    const [networkMap, setNetworkMap] = useState({});
    const [selectedRouter, setSelectedRouter] = useState({})
    const [routersOptions, setRoutersOptions] = useState([]);
    const [actualRoute, setActualRoute] = useState([])
    const [monitorStateLoading, setMonitorStateLoading] = useState(false);
    const [cookies] = useCookies(["token"])

    function updateRoute() {
        if (selectedRouter["type"] === "root") {
            setActualRoute([selectedRouter["ip"]])
        } else if (selectedRouter["type"] === "child") {
            setActualRoute([...selectedRouter["route"].split(",")])
        }
    }

    useEffect(() => {
        axios.get("/api/routers/graph", { headers: { "Authorization": cookies.token } }).then(graphResp => {
            const { schema } = graphResp.data;
            const routersNames = Object.keys(schema)
            setNetworkMap(schema);
            setRoutersOptions(routersNames);
            setSelectedRouter(schema[routersNames[0]])
        }).catch(graphErr => {
            if (graphErr.response.data) {
                toast.error(graphErr.response.data.error);
            }
        })
    }, []);

    useEffect(() => {
        updateRoute();
    }, [selectedRouter])

    const updateDeviceMonitorStatus = (e) => {
        setMonitorStateLoading(true);
        const data = { "device": selectedRouter["name"], "monitor": e.target.checked}
        axios.post("/api/routers/monitor", data, { headers: { "Authorization": cookies.token } }).then(monResp => {
            if (monResp.data.message) {
                toast.success(monResp.data.message);
            } else {
                toast.warning("No se ha recibido una respuesta válida del servidor")
            }
            setSelectedRouter({ ...selectedRouter, "monitor_status": e.target.checked })
        }).catch(monErr => {
            console.log(monErr);
            if (monErr.response.data) {
                toast.error(monErr.response.data.error);
            }
        }).finally(() => {
            setMonitorStateLoading(false);
        })
    }

    return (
        <Container>
            <h3 style={{ margin: "12px 0" }}>Configuración del router</h3>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick />
            <Row>
                <Col xs={12} sm={4}>
                    <Form.Group>
                        <Form.Label>Dispositivo</Form.Label>
                        <Form.Select onChange={(e) => { setSelectedRouter(networkMap[e.target.value]) }}>
                            {
                                routersOptions.map(r => <option value={r} key={r}>{r}</option>)
                            }
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col xs={12} sm={4} style={{ "display": "flex", "flex": 1, "flexDirection": "column" }}>
                    {
                        monitorStateLoading ? <Spinner style={{"marginTop":"auto"}} animation="border" /> :
                            <Form.Check style={{ "marginTop": "auto" }} onChange={updateDeviceMonitorStatus}
                                type="checkbox" label="Monitoreando dispositivo" checked={selectedRouter["monitor_status"] || false} />
                    }

                </Col>
                {
                    Object.keys(selectedRouter).length === 0 ?
                        <div style={{ "margin": "12px auto" }}>
                            <Lottie options={animOptions}
                                height={160}
                                width={160} />
                        </div> :
                        <div style={{ "margin": "12px auto" }}>
                            <Tabs defaultActiveKey="users" className="mb-3" mountOnEnter={true} unmountOnExit={true}>
                                <Tab eventKey="users" title="Usuarios">
                                    <RouterUsers users={selectedRouter["users"]} route={actualRoute} />
                                </Tab>
                                <Tab eventKey="interfaces" title="Interfaces">
                                    <RouterInterfaces interfaces={selectedRouter["interfaces"]} device={selectedRouter["name"]} monitor={selectedRouter["monitor_status"]} route={actualRoute} />
                                </Tab>
                                <Tab eventKey="protocols" title="Protocolos">
                                    <RouterProtocols protocols={selectedRouter["protocols"]} />
                                </Tab>
                                <Tab eventKey="mib" title="MIB-II">
                                    <RouterMIB protocols={selectedRouter["mib"]} />
                                </Tab>
                            </Tabs>
                        </div>
                }
            </Row>

        </Container>
    )
}

export default RouterPage;