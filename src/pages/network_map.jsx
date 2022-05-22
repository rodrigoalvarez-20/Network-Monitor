import Network from "react-graph-vis";
import axios from "axios";
import { Container } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from 'react-toastify';

const NetworkMap = () => {

    const [networkNodes, setNetworkNodes] = useState([]);
    const [networkEdges, setNetworkEdges] = useState([]);
    const [cookies, state] = useCookies(['token']);


    useEffect(() => {
        axios.get("/api/routers/graph", {headers: { "Authorization": cookies.token }}).then(response => {
            const {schema} = response.data;
            console.log(schema)

            if (schema.length === 0){
                //
                toast.warning("Aun no hay datos de la topología")
            }else {
                
                var nodes = [{ "id":0, "label": "Monitor" }]
                var edges = []
                Object.keys(schema).forEach(key => {
                    //Primero buscar las raices
                    const { name, ip } = schema[key];
                    nodes.push({ "id": name, "label": name })
                    if(schema[key]["type"] === "root"){
                        edges.push({from: 0, to: name, width: 2 })
                    }else if (schema[key]["type"] === "child") {
                        const { parent } = schema[key];
                        edges.push({ from: parent["host"], to: name, width: 2 })
                    }
                });

                setNetworkNodes(nodes)
                setNetworkEdges(edges)

            }

        }).catch(error => {
            console.log(error)
        }).finally(() => {
            //
        });
    }, []);

    const events = {
        select: function (event) {
            var { nodes, edges } = event;
            console.log("nodes");
            console.log(nodes);
            console.log("edges")
            console.log(edges);
        }
    };

    return (
        <Container style={{"margin":"12px auto"}}>
            <h3>Topología actual</h3>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick />
            <Network
                style={{ "backgroundColor": "#F9F3EE", "height": "80vh"}}
                graph={{ nodes: networkNodes, edges: networkEdges }}
                options={{
                    layout: {
                        hierarchical: {
                            levelSeparation: 120,
                            nodeSpacing: 120,
                            direction: "LR",
                            sortMethod: "directed"
                        },
                        
                    },
                    "nodes": {
                        color: "#9AD0EC",
                        shape: "image",
                        image: {
                            unselected: `${process.env.PUBLIC_URL}/router.png`,
                            selected: `${process.env.PUBLIC_URL}/router_selected.png`
                        }
                    },
                    edges: {
                        color: "#f56c42",
                        dashes: true
                    },
                    physics: {
                        enabled: true
                    }
                }}
                events={events}
            />
        </Container>
    )
}

export default NetworkMap;