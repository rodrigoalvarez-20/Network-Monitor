import { useState, useEffect } from "react";

const RouterUsers = ({users, route}) => {

    const [usersInRouter, setUsersInRouter] = useState([]);

    useEffect(() => {
        setUsersInRouter(users);
    },[users])

    useEffect(() => {
        console.log(usersInRouter)
    }, [usersInRouter])

    return (
        <div>
            Usuarios en el router
        </div>
    )

}

export default RouterUsers;