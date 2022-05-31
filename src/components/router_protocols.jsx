import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Alert, Spinner } from "react-bootstrap";
import { useCookies } from "react-cookie";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { _wait } from "../utils/common";

const RouterProtocols = (props) => {
    const [actualProtocols, setActualProtocols] = useState([])
    const [selectedProtocol, setSelectedProtocol] = useState("rip");
    const [protocolId, setProtocolId] = useState("");
    const [protocolData, setProtocolData] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [cookies] = useCookies(["token"]);

    useEffect(() => {
        setActualProtocols(props.protocols);
        setProtocolId("");
        setProtocolData("")
        setSelectedProtocol("rip")
    }, [props]);

    function setExample() {
        if (selectedProtocol === "rip") {
            return (
                <>
                    <div>Ejemplo:</div>
                    <div>net 10.0.0.0</div>
                    <div>net 127.5.0.0</div>
                    <div>net 192.168.0.0</div>
                </>

            )
        } else {
            return (
                <>
                    <div>Ejemplo:</div>
                    <div>net 10.0.0.0 0.255.255.255 area x</div>
                    <div>net 127.5.0.0 0.0.255.255 area x</div>
                    <div>net 192.168.0.0 0.0.0.255 area x</div>
                </>
            )
        }
    }

    const updateProtocol = () => {

        const nets = protocolData.split("\n");

        if (nets.length === 0){
            toast.error("El campo de redes no puede quedar vacio");
        }else {
            setIsLoading(true);
            var data = {
                "protocol": selectedProtocol,
                "networks": nets,
                "method": "ssh",
                "route": props.route
            }

            if (selectedProtocol !== "rip"){
                data["protocol_id"] = protocolId;
            }

            const headers = {
                headers: {
                    "Authorization": cookies.token
                }
            }

            axios.post("/api/routers/protocol", data, headers).then(rspProtocol => {
                if (rspProtocol.data.message){
                    toast.success(`${rspProtocol.data.message} via ${rspProtocol.data.method}`)
                }else {
                    toast.warning("Se ha actualizado la configuración de protocolos")
                }
                _wait().then(() => window.location.reload())
            }).catch(errProt => {
                console.log(errProt);
                if(errProt.response.data){
                    toast.error(errProt.response.data.error)
                }else {
                    toast.error("Ha ocurrido un error al realizar la petición")
                }
            }).finally(() => {
                setIsLoading(false);
            });

        }
    }

    return (
        <Container>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick />
            <Row style={{ "margin": "12px auto", "textAlign": "center" }}>
                <Col xs={12} sm={6}>
                    Protocolos en el dispositivo: {actualProtocols.join(", ")}
                </Col>
                <Col xs={12} sm={6} >
                    {
                        isLoading ? <Spinner animation="border" /> :
                            <Button onClick={updateProtocol} variant="outline-success">Guardar cambios</Button>
                    }

                </Col>
            </Row>
            <Row style={{ "margin": "12px auto", "textAlign": "center" }}>
                <Col xs={12} sm={4}>
                    <Form.Group>
                        <Form.Label> Agregar/Modificar un protocolo:</Form.Label>
                        <Form.Select value={selectedProtocol} onChange={(e) => setSelectedProtocol(e.target.value)}>
                            <option value="rip">RIP V-2</option>
                            <option value="ospf">OSPF</option>
                            <option value="eigrp">EIGRP</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                {
                    selectedProtocol !== "rip" ?
                        <Col xs={12} sm={3}>
                            <Form.Group>
                                <Form.Label>Identificador</Form.Label>
                                <Form.Control value={protocolId} onChange={(e) => setProtocolId(e.target.value)} type="text" />
                            </Form.Group>
                        </Col> : null
                }
            </Row>
            <Row>
                <Col xs={12} sm={6}>
                    <Alert style={{ "textAlign": "center" }} variant="warning">
                        Al agregar/cambiar un protocolo se eliminará toda la información de los protocolos existentes y se implementará el especificado
                    </Alert>
                </Col>
                <Col xs={12} sm={6} style={{ "textAlign": "center" }}>{setExample()}</Col>
            </Row>
            <Row>
                <Col xs={12} style={{ "margin": "auto" }}>
                    <Form.Control as="textarea" rows={10} value={protocolData} onChange={(e) => setProtocolData(e.target.value)} style={{ "fontSize": "small" }} />
                </Col>
            </Row>
        </Container>
    )

}

export default RouterProtocols;