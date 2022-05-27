import { useState, useEffect } from "react";
import { ListGroup } from "react-bootstrap";
import RouterUser from "./router_user";

const RouterUsers = ({users, route}) => {

    const [usersInRouter, setUsersInRouter] = useState([]);
    const [actualRoute, setActualRoute] = useState([]);

    useEffect(() => {
        setActualRoute(route);
    },[route])

    useEffect(() => {
        setUsersInRouter([...users, { "username": "", "privilege": 0, "type": "add" }]);
    }, [users])

    return (
        <ListGroup variant="flush">
            {
                usersInRouter.map((user,idx) => {
                    return <ListGroup.Item key={idx}><RouterUser {...user} route={actualRoute} /></ListGroup.Item>
                })
            }
        </ListGroup>
    )

}

export default RouterUsers;