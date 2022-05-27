import Network from "react-graph-vis";
import axios from "axios";
import { Button, Col, Container, Form, Offcanvas, Row, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from 'react-toastify';

const NetworkMap = () => {

    const [networkNodes, setNetworkNodes] = useState([]);
    const [networkEdges, setNetworkEdges] = useState([]);
    const [fullSchema, setFullSchema] = useState({});
    const [selectedRouter, setSelectedRouter] = useState({});
    const [selectedRouterDefaults, setSelectedRouterDefaults] = useState({
        "snmp-v3": false,
        "name": "",
        "ssh_v2": false
    });
    const [displayProps, setDisplayProps] = useState(false);
    const [isUpdateLoading, setIsUpdateLoading] = useState(false);
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
            //console.log(schema);
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
            alert(error.response.data.error);
        })
    }, []);

    const events = {
        select: function (event) {
            var { nodes } = event;
            var router_name = nodes[0];
            if (fullSchema[router_name]) {
                setSelectedRouter(fullSchema[router_name]);
                setSelectedRouterDefaults({
                    "name": fullSchema[router_name]["name"],
                    "ssh_v2": fullSchema[router_name]["ssh_v2"],
                    "snmp-v3": fullSchema[router_name]["snmp-v3"]
                })
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

        var { name, ssh_v2, type, route, ip } = selectedRouter;
        var snmpv3 = selectedRouter["snmp-v3"];

        if (name.length < 2){
            alert("El nombre del router debe de tener +2 caracteres")
        }else {    
            setIsUpdateLoading(true);
            const original_name = selectedRouterDefaults["name"]; 
            const original_ssh = selectedRouterDefaults["ssh_v2"]
            const original_snmp = selectedRouterDefaults["snmp-v3"]

            route = type === "root" ? [ip] : route.split(",")

            var useSsh = true;
            var temp_route = [];

            if (selectedRouterDefaults["ssh_v2"] === false || selectedRouterDefaults["ssh_v2"] !== ssh_v2){
                useSsh = false;
            }
            
            Object.keys(fullSchema).forEach(k => {
                if(route.includes(fullSchema[k]["ip"])){
                    temp_route.push(fullSchema[k])
                }
            });
            
            for (let i in temp_route){
                if(!temp_route[i]["ssh_v2"]){
                    useSsh = false;
                    break;
                } 
            }
    
            var update_params = {
                original_name, 
                route,
                "method": useSsh ? "ssh" : "telnet"
            }
            
            if (name !== original_name){
                update_params["hostname"] = name;
            }
            if (ssh_v2 !== original_ssh){
                update_params["ssh_v2"] = ssh_v2;
            }
            if (snmpv3 !== original_snmp){
                update_params["snmp-v3"] = snmpv3;
            }

            if (Object.keys(update_params) < 4){
                alert("No se ha cambiado ningun valor");
            }else {
                console.log(update_params);

                axios.patch("/api/routers/config", update_params, { headers: { "Authorization": cookies.token } }).then(rspUpdate => {
                    if(rspUpdate.data){
                        toast.success(rspUpdate.data.message);
                    }else {
                        toast.warning("No se ha recibido una respuesta válida del servidor")
                    }
                }).catch(errUpdate => {
                    console.log(errUpdate);
                    if(errUpdate.response.data){
                        alert(errUpdate.response.data.error);
                    }else{
                        alert("Ha ocurrido un error en la petición")
                    }
                }).finally(() => {
                    setIsUpdateLoading(false);
                });
            }
        }        
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
                            
                            <Col xs={12} sm={6} style={{ "margin": "6px auto", "textAlign": "center" }}>
                            {
                                isUpdateLoading ? 
                                    <Spinner animation="border" /> :
                                    <Button style={{ "width": "100%" }} variant="outline-info" type="submit">Guardar cambios</Button>
                            }
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