import { Container, Row, Col, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useCookies } from "react-cookie";
import { available_logs, update_intervals } from "../utils/common";
import Selector from "../components/selector";

const Home = () => {

    const [sckConn, setSckConn] = useState(null);
    const [logText, setLogText] = useState("");
    const [selectedLogs, setSelectedLogs] = useState("all");
    const [logsInterval, setLogsInterval] = useState(5);
    const [cookies, state] = useCookies(['token']);

    useEffect(() => {
        const logsCont = window.document.getElementById("logs_container");
        const sck = io("http://127.0.0.1:5000/", {
            cors: {
                credentials: true,
            },
            reconnectionAttempts: 5,
            reconnection: true,
            rejectUnauthorized: false
        });

        sck.on("conn-resp", ({ log_name, interval }) => {
            console.log("Socket connected");
            setSelectedLogs(log_name)
            setLogsInterval(interval)
            sck.emit("get_log");
            sck.emit("get_monitored_interfaces")
            setSckConn(sck);
        });

        sck.on("log_data", ({ log, name }) => {
            console.log("Recibiendo datos de: " + name)
            if (log === null || log === undefined) {
                setLogText("No se han encontrado logs");
            } else {
                setLogText(log.join("\n"));
            }
            logsCont.scrollTop = logsCont.scrollHeight;
        });

        sck.on("devices_monitoring", (monitored_dev => {
            console.log("Datos de dispositivos monitoreados")
            console.log(monitored_dev)
        }));

        return () => {
            sck.disconnect()
            if (sckConn !== null) {
                sckConn.disconnect();
            }
        }

    }, []);

    const update_selected_log = (e) => {
        if (sckConn !== null) {
            sckConn.emit("update_selected_log_prefs", e.target.value !== "all" ? e.target.value : null);
            setSelectedLogs(e.target.value)
        }
    }

    const update_log_interval = (e) => {
        if (sckConn !== null) {
            sckConn.emit("update_timer_logs_prefs", parseInt(e.target.value));
            setLogsInterval(parseInt(e.target.value));
        }
    }

    return (
        <Container>
            <h3>Inicio</h3>
            <Row>
                <Col xs={12} sm={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Archivo de logs seleccionado</Form.Label>
                        <Selector dataset={available_logs} def_value={selectedLogs} action={update_selected_log} />
                    </Form.Group>
                </Col>
                <Col xs={12} sm={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Intervalo de actualización</Form.Label>
                        <Selector dataset={update_intervals} def_value={logsInterval} action={update_log_interval} />
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