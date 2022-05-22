
import axios from "axios";
import md5 from "blueimp-md5";


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

export { validateToken, hash_md5, _wait }