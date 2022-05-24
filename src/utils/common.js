
import axios from "axios";
import md5 from "blueimp-md5";

const available_logs = [
    { "value": "all", "label": "Todos los logs" },
    { "value": "general", "label": "Logs generales" },
    { "value": "network", "label": "Logs de la red" },
    { "value": "users", "label": "Logs de usuarios" },
    { "value": "mapping", "label": "Logs del mapeo" },
]

const update_intervals = [
    { "value": 5, "label": "5 segundos" },
    { "value": 10, "label": "10 segundos" },
    { "value": 15, "label": "15 segundos" },
    { "value": 20, "label": "20 segundos" },
    { "value": 30, "label": "30 segundos" },
    { "value": 60, "label": "1 minuto" },
    { "value": 120, "label": "2 minutos" },
    { "value": 300, "label": "5 minutos" },
    { "value": 600, "label": "10 minutos" }
]

const lost_percentage = [
    { "value": 10, "label": "10%" },
    { "value": 15, "label": "15%" },
    { "value": 20, "label": "20%" },
    { "value": 30, "label": "30%" },
    { "value": 45, "label": "45%" },
    { "value": 50, "label": "50%" },
]

async function validateToken(tk) {
    try {
        await axios.post("/api/auth/validate", { "token": tk });
        return { "message": "Token correcta" }
    } catch (error) {
        console.log(error);
        return { "error": error.response.data.message }
    }
}

function hash_md5(value) {
    return md5(value);
}

function _wait(ms = 5000){
    return new Promise(r => setTimeout(r, ms));
}

export { validateToken, hash_md5, _wait, update_intervals, available_logs, lost_percentage }