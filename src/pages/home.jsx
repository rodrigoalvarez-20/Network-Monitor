import { Container, Button, Row, Col, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useCookies } from "react-cookie";
import axios from "axios";

const Home = () => {

    const [sckConn, setSckConn] = useState(null);
    const [logText, setLogText] = useState("");
    const [cookies, state] = useCookies(['token']);

    useEffect(() => {
        const logsCont = window.document.getElementById("logs_container");
        logsCont.scrollTop = logsCont.scrollHeight;
        const sck = io("http://127.0.0.1:5000/", {
            cors: {
                credentials: true,
            },
            reconnectionAttempts: 5,
            reconnection: true,
            rejectUnauthorized: false
        });

        sck.on("conn-resp", () => {
            console.log("Socket connected");
            sck.emit("get_log", null);
            setSckConn(sck);
        });

        sck.on("log_data", ({ log, name }) => {
            console.log("Recibiendo datos de: " + name)
            /* if (text === undefined) {
                setLogText("No se han encontrado logs");
            } else {
                setLogText(text.join("\n"));
            }
            logsCont.scrollTop = logsCont.scrollHeight; */
        });

        return () => {
            sck.disconnect()
            if (sckConn !== null) {
                sckConn.disconnect();
            }
        }

    }, []);

    const get_log = (e) => {
        if (sckConn !== null) {
            sckConn.emit("get_log", e.target.value !== "all" ? e.target.value : null);
        }
    }

    const update_wait_time = () => {
        axios.post()
    }

    const available_logs = [
        { "value": "all", "label": "Todos los logs" },
        { "value": "general", "label": "Logs generales" },
        { "value": "network", "label": "Logs de la red" },
        { "value": "users", "label": "Logs de usuarios" },
        { "value": "mapping", "label": "Logs del mapeo" },
    ]

    const update_values = [
        { "value": 5, "label": "5 segundos" },
        { "value": 10, "label": "10 segundos" },
        { "value": 15, "label": "15 segundos" },
        { "value": 20, "label": "20 segundos" },
        { "value": 30, "label": "30 segundos" }
    ]

    function renderSelector(data, action) {
        return (
            <Form.Select style={{}} onChange={action} >
                {
                    data.map((item, i) => {
                        return (
                            <option key={i} value={item.value}>{item.label}</option>
                        )
                    })
                }
            </Form.Select>
        )
    }

    return (
        <Container>
            <h3>Inicio</h3>
            <Row>
                <Col xs={12} sm={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Archivo de logs seleccionado</Form.Label>
                        {renderSelector(available_logs, get_log)}
                    </Form.Group>
                </Col>
                <Col xs={12} sm={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Intervalo de actualización</Form.Label>
                        {renderSelector(update_values, null)}
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col xs={12}>
                    <Form.Group className="mb-3">
                        <Form.Label>Logs</Form.Label>
                        <Form.Control id="logs_container" as="textarea" rows={15} disabled value={logText} style={{ "fontSize": "small" }} />
                    </Form.Group>
                </Col>
            </Row>
        </Container>
    )
}

export default Home;