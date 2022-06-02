import { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import * as mibanimation from "../assets/network_mib.json";
import * as errorAnimation from "../assets/error.json";
import Lottie from "react-lottie";
import { _wait } from "../utils/common";

const RouterMIB = (props) => {
    const [selectedHost, setSelectedHost] = useState("");
    const [cookies, setCookies] = useCookies(["token"]);
    const [isFetchingMib, setIsFetchingMib] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [animOptions, setAnimOptions] = useState({
        loop: true,
        autoplay: true,
        animationData: mibanimation,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    });

    const [mibData, setMibData] = useState({
        "sysContact": "",
        "sysDescr": "",
        "sysLocation": "",
        "sysName": "",
        "sysUpTime": 0
    });

    const updateData = (e) => {
        setMibData({ ...mibData, [[e.target.name]]: e.target.value })
    }

    useEffect(() => {
        const { route } = props;
        setSelectedHost(route[route.length - 1])
    }, [props])

    useEffect(() => {
        setIsFetchingMib(true);
        if (selectedHost !== "" && selectedHost !== undefined) {
            axios.get(`/api/routers/mib/${selectedHost}`, { headers: { "Authorization": cookies.token } }).then(mibRsp => {
                const { mib } = mibRsp.data;
                if (mib.error) {
                    toast.error(mib.error);
                    setAnimOptions({ ...animOptions, animationData: errorAnimation })
                } else {
                    // Hacer el set de todo
                    var new_schema = {}
                    for (const k in mib) {
                        const mibKey = k.split("::")[1].split(".")[0];
                        new_schema[mibKey] = mib[k];
                    }
                    setMibData(new_schema);
                    setIsFetchingMib(false);
                }
            }).catch(mibError => {
                console.log(mibError);
                if (mibError.response.data.error) {
                    toast.error(mibError.response.data.error);
                } else {
                    toast.warning("Ha ocurrido un error al realizar la petición")
                }
                setAnimOptions({ ...animOptions, animationData: errorAnimation })
            });
        }
    }, [selectedHost])

    const updateMibData = () => {
        setIsLoading(true);
        const { sysContact, sysName, sysLocation, sysDescr } = mibData;

        if (sysName.length === 0) {
            toast.warning("El nombre del dispositivo no puede estar en blanco")
            setIsLoading(false);
        } else {
            axios.post(`/api/routers/mib/${selectedHost}`, {
                "contact": sysContact,
                "name": sysName,
                "location": sysLocation
            }, { headers: { "Authorization": cookies.token } }).then(rspUpdate => {
                if (rspUpdate.data.message) {
                    toast.success(rspUpdate.data.message);
                }
                _wait().then(() => window.location.reload())
            }).catch(errUpdate => {
                console.log(errUpdate);
                if (errUpdate.response.data.error) {
                    toast.error(errUpdate.response.data.error);
                } else {
                    toast.warning("Ha ocurrido un error al realizar la petición")
                }
            }).finally(() => {
                setIsLoading(false);
            })
        }
    }

    function renderMibForm() {
        return (
            <>
                <Row>
                    <Col xs={12} sm={4}>
                        <Form.Group>
                            <Form.Label>Nombre del dispositivo</Form.Label>
                            <Form.Control name="sysName" value={mibData.sysName} onChange={updateData} />
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={4}>
                        <Form.Group>
                            <Form.Label>Informacion de contacto</Form.Label>
                            <Form.Control name="sysContact" value={mibData.sysContact} onChange={updateData} />
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={4}>
                        <Form.Group>
                            <Form.Label>Informacion de ubicación</Form.Label>
                            <Form.Control name="sysLocation" value={mibData.sysLocation} onChange={updateData} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row style={{ "marginTop": "12px" }}>
                    <Col xs={12} sm={6} >
                        <Form.Group>
                            <Form.Label>Descripcion del dispositivo</Form.Label>
                            <Form.Control name="sysDescr" as="textarea" rows={5} value={mibData.sysDescr} disabled />
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={2} >
                        <Form.Group>
                            <Form.Label>Tiempo de ejecución</Form.Label>
                            <Form.Control value={mibData.sysUpTime} disabled />
                        </Form.Group>
                    </Col>
                </Row>
            </>
        )
    }

    return (
        <Container>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick />
            <Row>
                <Col xs={12} sm={8}>
                    <h3 style={{ margin: "12px 0" }}>Información MIB-II del dispositivo</h3>
                </Col>
                <Col xs={4} sm={4} style={{ "margin": "auto", "textAlign": "center" }}>
                    {
                        isLoading ? <Spinner animation="border" /> :
                            <Button onClick={updateMibData} variant="outline-danger">Actualizar</Button>
                    }
                </Col>
            </Row>
            {
                isFetchingMib ?
                    <div style={{ "margin": "10% auto" }}>
                        <Lottie options={animOptions}
                            height={160}
                            width={160} />
                    </div> : renderMibForm()
            }

        </Container>
    )

}

export default RouterMIB;