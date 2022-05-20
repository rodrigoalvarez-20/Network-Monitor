import { Col, Image, Nav, Navbar, Row } from "react-bootstrap";
import { useCookies } from "react-cookie";

const TopBar = () => {
    const [cookies, setCookies, removeCookie] = useCookies(["token", "name", "last_name"]);

    const logoutUser = () => {
        removeCookie("token", { path: "/" })
        removeCookie("name", { path: "/" })
        removeCookie("last_name", { path: "/" })
        window.location.reload()
    }

    return (
        <Navbar collapseOnSelect expand="lg" style={{ "backgroundColor": "#92d2ee" }}>
            <Navbar.Brand>
                <img
                    src={process.env.PUBLIC_URL + "ipn_logo.webp"}
                    width="76"
                    height="42"
                    alt="IPN Logo"
                    style={{ margin: "0 6px" }}
                />
                <img
                    src={process.env.PUBLIC_URL + "escom_logo.png"}
                    width="62"
                    height="42"
                    alt="Escom Logo"
                    style={{ margin: "0 6px" }}
                />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto" style={{ "margin": "auto", "textAlign":"center", "justifyContent":"center", "width":"80%" }}>
                    <Nav.Link href="/">Network-Monitor</Nav.Link>
                </Nav>
                <Row style={{"width":"260px", "margin":"auto"}}>
                    <Col xs={8} style={{ "margin": "auto" }}>
                        <Nav style={{ "fontSize": "smaller" }}>{cookies.name}&nbsp;{cookies.last_name}</Nav>
                        <Nav style={{ "fontSize": "smaller", "cursor": "pointer", "justifyContent": "center", "textDecoration":"underline", "color":"blue" }} 
                        onClick={logoutUser}>Cerrar sesión</Nav>
                    </Col>
                    <Col xs={4}>
                        <Image height={52} src={process.env.PUBLIC_URL + "user_icon.png"} />
                    </Col>
                </Row>
            </Navbar.Collapse>

        </Navbar>
    )
}

export default TopBar;