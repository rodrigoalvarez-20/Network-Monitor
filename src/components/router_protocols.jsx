import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";

const RouterProtocols = (props) => {

    const [actualProtocols, setActualProtocls] = useState([])

    useEffect(() => {
        setActualProtocls(props.protocols)
    }, [props]);

    return (
        <Container>
            <Row style={{ "margin": "12px auto", "textAlign": "center" }}>
                <Col xs={12} sm={6}>
                    Protocolos en el dispositivo: {actualProtocols.join(", ")}
                </Col>
                <Col xs={12} sm={6} >
                    <Button variant="outline-success">Guardar cambios</Button>
                </Col>
            </Row>
            <Row style={{ "margin": "12px auto", "textAlign": "center" }}>
                <Col xs={12} sm={4}>
                    Agregar/Modificar un protocolo:
                </Col>
                <Col xs={12} sm={2}>
                    <Form.Select >
                        <option>RIP V-2</option>
                        <option>OSPF</option>
                        <option>EIGRP</option>
                    </Form.Select>
                </Col>
            </Row>
        </Container>
    )

}

export default RouterProtocols;