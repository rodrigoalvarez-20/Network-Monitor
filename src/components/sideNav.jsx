import { Col, Container, Image, Row } from "react-bootstrap"
import { Link } from "react-router-dom"

import devices from "../assets/devices.png";
import home from "../assets/home.png";
import users from "../assets/users.png";
import settings from "../assets/settings.png";
import net from "../assets/network.png";

import "../styles/side_nav.css";

const routes = [
    {
        "name": "Principal",
        "route": "/",
        "icon": home
    },
    {
        "name": "Administrar usuarios",
        "route": "/users",
        "icon": users
    },
    {
        "name": "Administrar dispositivos",
        "route": "/devices",
        "icon": devices
    },
    {
        "name": "Consultar topologia",
        "route": "/network",
        "icon": net
    },
    {
        "name": "Configuraciones",
        "route": "/settings",
        "icon": settings
    }
]


const SideNav = () => {
    return (
        <div className="sidenav">
            {
                routes.map(({ name, route, icon }) => {
                    return (
                        <Row style={{"margin":"8px auto", "width":"100%"}} key={route}>
                            <Col xs={12} lg={3} className="iconCol">
                                <Image src={icon} className="iconImage" rounded /></Col>
                            <Col style={{
                                "fontSize": "1.0vmax",
                                "textAlign": "center",
                                "color": "#242F9B",
                                "wordBreak": "break-word",
                                "margin":"auto"
                            }}>
                                <Link to={route}>{name}</Link>
                            </Col>
                        </Row>
                    )
                })
            }
        </div>
    )
}

export default SideNav