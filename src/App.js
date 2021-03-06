import { Route, Routes, useNavigate } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import TopBar from './components/topBar';
import SideNav from './components/sideNav';
import Login from './pages/login';

import { useCookies } from 'react-cookie';
import { useEffect, useState } from 'react';
import axios from "axios";
import { validateToken } from './utils/common';
import RestorePassword from './pages/restore_password';
import UsersPage from './pages/users_page';
import NetworkMap from './pages/network_map';
import Home from './pages/home';
import ConfigsPage from './pages/configurations';
import RouterPage from './pages/router_page';


const App = () => {

  const [cookies, state] = useCookies(['token']);
  const [isUserLogged, setUserLogged] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api").then(response => {
      console.log(response.data);
    }).catch(error => {
      console.log(error);
    }).finally(async () => {
      const { pathname, search } = window.location;

      if (pathname === "/services/restore" && search.split("tk=").length > 0) {
        // Proceder a evaluar la token
        const tk_value = search.split("tk=")[1]
        const tk_status = await validateToken(tk_value);

        if (tk_status["error"]) {
          alert(tk_status["error"])
          navigate("/login", { "replace": true })
        }

      } else if (!cookies.token) { // Falta validar la token
        navigate("/login", { "replace": true })
      } else if (cookies.token) {
        const tk_status = await validateToken(cookies.token);
        if (tk_status["error"]) {
          alert(tk_status["error"])
          navigate("/login", { "replace": true })
        }
        setUserLogged(true);
      } else {
        navigate("/login", { "replace": true })
      }
    })
  }, [cookies, navigate])


  return (
    <div>
      {
        isUserLogged ? <TopBar /> : null
      }
      <Row style={{ "margin": "0" }}>
        {
          isUserLogged ?
            <Col xs={2}>
              <SideNav />
            </Col> : null
        }
        <Col xs={isUserLogged ? 10 : 12}>
          <Routes>
            {
              isUserLogged ?
                <>
                  <Route path="/" element={<Home />} />
                  <Route path="/network" element={<NetworkMap />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/settings" element={<ConfigsPage />} />
                  <Route path="/devices" element={<RouterPage />} />
                </> :
                <>
                  <Route path="/login" element={<Login />} />
                  <Route path="/services/restore" element={<RestorePassword />} />
                </>
            }
          </Routes>
        </Col>
      </Row>


    </div>
  )

}

export default App;
