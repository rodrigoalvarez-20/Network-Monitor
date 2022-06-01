import { Container, Row, Col, Form, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useCookies } from "react-cookie";
import { available_logs, update_intervals } from "../utils/common";
import Selector from "../components/selector";
import { ToastContainer, toast } from 'react-toastify';


import MetricsChart from "../components/metric_chart";

const Home = () => {

    const [sckConn, setSckConn] = useState(null);
    const [logText, setLogText] = useState("");
    const [selectedLogs, setSelectedLogs] = useState("all");
    const [monitoredDevices, setMonitoredDevices] = useState([])
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [logsInterval, setLogsInterval] = useState(5);
    const [actualMetrics, setActualMetrics] = useState({});
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
            sck.emit("get_metrics")
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
            setMonitoredDevices(monitored_dev)
        }));

        sck.on("metrics_data", (data => {
            var parsed_metrics = {}
            for (var k in data) {
                parsed_metrics = {
                    ...parsed_metrics,
                    [[k]]: data[k].map(d => ({ "time": d["x"].split(" ")[1], "packets": d["y"]  }))
                }
            }
            setActualMetrics(parsed_metrics)
        }));

        sck.on("metrics_error", err => {
            console.log(err)
            setActualMetrics({});
            toast.error(err)
        })

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

    const updateSelectedMonitoredDevices = (e) => {
        const idx = parseInt(e.target.value)
        if (sckConn !== null && monitoredDevices.length > 0) {
            sckConn.emit("set_selected_interface", monitoredDevices[idx])
            setSelectedIndex(idx)
        }
    }

    function renderMetricsData() {
        return (
            <Row>
                <Col xs={12} style={{ "margin": "12px 0" }}>
                    <MetricsChart metrics={actualMetrics["in_packets"] || []} title="Paquetes correctos recibidos" type="# Paquetes" color="#14C38E" />
                </Col>
                <Col xs={12} style={{ "margin": "12px 0" }}>
                    <MetricsChart metrics={actualMetrics["in_disc"] || []} title="Paquetes recibidos descartados" type="# Paquetes" color="#EC9B3B" />
                </Col>
                <Col xs={12} style={{ "margin": "12px 0" }}>
                    <MetricsChart metrics={actualMetrics["in_err"] || []} title="Paquetes recibidos con errores" type="# Paquetes" color="#D82148" />
                </Col>
            </Row>
        )
    }

    return (
        <Container style={{ "padding": "12px" }}>
            <h3>Dashboard</h3>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick />
            <Row>
                <Col xs={12} sm={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Dispositivo/Interfaz monitoreada</Form.Label>
                        <Form.Select value={selectedIndex} onChange={updateSelectedMonitoredDevices} disabled={monitoredDevices.length === 0} >
                            <option value={-1} disabled>{ }</option>
                            {
                                monitoredDevices.map((dev, idx) => {
                                    return (
                                        <option key={dev["device"]} value={idx}>{dev["device"]} - {dev["interfaces"]["name"]}</option>
                                    )
                                })
                            }
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
            {
                Object.keys(actualMetrics).length !== 0 ? renderMetricsData() : <div style={{"textAlign":"center", "margin": "24px"}}><Spinner animation="border" /></div>
            }

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