import Network from "react-graph-vis";
import axios from "axios";
import { Button, Col, Container, Form, ListGroup, Offcanvas, Row, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from 'react-toastify';

const NetworkMap = () => {

    const [networkNodes, setNetworkNodes] = useState([]);
    const [networkEdges, setNetworkEdges] = useState([]);
    const [fullSchema, setFullSchema] = useState({});
    const [selectedRouter, setSelectedRouter] = useState({});
    const [selectedRouterName, setSelectedRouterName] = useState("");
    const [displayProps, setDisplayProps] = useState(false);
    const [isMonLoading, setIsMonLoading] = useState(false);
    const {isUpdateLoading, setIsUpdateLoading} = useState(false);
    const [cookies] = useCookies(['token']);

    const prefPanelOptions = [
        {
            "label": "Nombre del dispositivo",
            "name": "name",
            "type": "input",
            "disabled": false
        },
        {
            "label": "Direccion IP accesible",
            "name": "ip",
            "type": "input",
            "disabled": true
        },
        {
            "label": "Ruta de acceso",
            "name": "route",
            "type": "input",
            "disabled": true
        },
        {
            "label": "Conexión SSH V2",
            "name": "ssh_v2",
            "type": "checkbox",
            "disabled": false
        },
        {
            "label": "SNMP V3",
            "name": "snmp-v3",
            "type": "checkbox",
            "disabled": false
        }
    ]

    useEffect(() => {
        axios.get("/api/routers/graph", { headers: { "Authorization": cookies.token } }).then(response => {
            const { schema } = response.data;
            setFullSchema(schema);
            if (schema.length === 0) {
                //
                toast.warning("Aun no hay datos de la topología")
            } else {
                var nodes = [{ "id": 0, "label": "Monitor" }]
                var edges = []
                Object.keys(schema).forEach(key => {
                    //Primero buscar las raices
                    const { name } = schema[key];
                    nodes.push({ "id": name, "label": name })
                    if (schema[key]["type"] === "root") {
                        edges.push({ from: 0, to: name, width: 2 })
                    } else if (schema[key]["type"] === "child") {
                        const { parent } = schema[key];
                        edges.push({ from: parent["host"], to: name, width: 2 })
                    }
                });

                setNetworkNodes(nodes)
                setNetworkEdges(edges)

            }

        }).catch(error => {
            console.log(error)
            toast.error(error.response.data.error);
        })
    }, []);

    const events = {
        select: function (event) {
            var { nodes } = event;
            var router_name = nodes[0];
            if (fullSchema[router_name]) {
                setSelectedRouter(fullSchema[router_name]);
                setSelectedRouterName(fullSchema[router_name]["name"]);
                setDisplayProps(true);
            }
        }
    };

    const hidePropsPanel = () => {
        setSelectedRouter({});
        setDisplayProps(false);
    }

    const updateRouterProps = (e) => {
        e.preventDefault();
        console.log(selectedRouter)
        fullSchema[selectedRouterName] = selectedRouter;
        console.log("To update: " + selectedRouterName);
    }

    const updateMonitoredDevice = () => {
        setIsMonLoading(true);
        axios.post("/api/app/configurations", {"device_mon": selectedRouter["name"]}, {headers: {"Authorization": cookies.token}}).then(cfgResp => {
            if(cfgResp.data){
                toast.success(cfgResp.data.message);
            }
        }).catch(cfgErr => {
            if(cfgErr.response.data){
                toast.error(cfgErr.response.data.error);
            }else{
                toast.error("Ha ocurrido un error en la petición")
            }
        }).finally(() => {
            setIsMonLoading(false);
        });
    }

    return (
        <Container style={{ "margin": "12px auto" }}>
            <h3>Topología actual</h3>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick />
            <Offcanvas show={displayProps} placement="end" onHide={hidePropsPanel}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Propiedades del dispositivo</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form onSubmit={updateRouterProps}>
                        <Row>
                            {
                                prefPanelOptions.map(({ name, type, disabled, label }) => {
                                    if (type === "input") {
                                        return (
                                            <Col xs={12} key={name} style={{ "margin": "6px auto" }}>
                                                <Form.Group>
                                                    <Form.Label>{label}</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={selectedRouter[name]}
                                                        disabled={disabled}
                                                        name={name}
                                                        onChange={(e) => setSelectedRouter({ ...selectedRouter, [[e.target.name]]: e.target.value })} />
                                                </Form.Group>
                                            </Col>
                                        )
                                    } else {
                                        return (
                                            <Col xs={12} style={{ "margin": "6px auto" }} key={name}>
                                                <Form.Group>
                                                    <Form.Check
                                                        type="checkbox"
                                                        label={label}
                                                        name={name}
                                                        checked={selectedRouter[name]}
                                                        disabled={disabled}
                                                        onChange={(e) => setSelectedRouter({ ...selectedRouter, [[e.target.name]]: e.target.checked })} />
                                                </Form.Group>
                                            </Col>
                                        )
                                    }
                                })
                            }
                            <Col xs={12} sm={6} style={{ "margin": "6px auto", "textAlign":"center" }}>
                            {
                                isMonLoading ? 
                                    <Spinner animation="border" /> :
                                    <Button style={{"width":"100%"}} onClick={updateMonitoredDevice} variant="outline-warning">Monitorear</Button>
                            }
                                
                            </Col>
                            <Col xs={12} sm={6} style={{ "margin": "6px auto", "textAlign": "center" }}>
                                <Button style={{ "width": "100%" }} variant="outline-info" type="submit">Guardar cambios</Button>
                            </Col>
                        </Row>
                    </Form>
                </Offcanvas.Body>
            </Offcanvas>
            <Network
                style={{ "backgroundColor": "#F9F3EE", "height": "80vh" }}
                graph={{ nodes: networkNodes, edges: networkEdges }}
                options={{
                    layout: {
                        hierarchical: {
                            levelSeparation: 120,
                            nodeSpacing: 120,
                            direction: "LR",
                            sortMethod: "directed"
                        },

                    },
                    "nodes": {
                        color: "#9AD0EC",
                        shape: "image",
                        image: {
                            unselected: `${process.env.PUBLIC_URL}/router.png`,
                            selected: `${process.env.PUBLIC_URL}/router_selected.png`
                        }
                    },
                    edges: {
                        color: "#f56c42",
                        dashes: true
                    },
                    physics: {
                        enabled: true
                    }
                }}
                events={events}
            />
        </Container>
    )
}

export default NetworkMap;