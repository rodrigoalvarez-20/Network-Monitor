
import axios from "axios";
import { JSEncrypt } from "jsencrypt";
import md5 from "blueimp-md5";


const publicKeyStr = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCMIQ7PqWWWJ7/DvCZcnyUqwP46
s4glueHiMmXlJLisMjUQi9jpiV3W8iu1ZCEM7J0jzkY4RhZUtLnK4mMHdrckwvKC
CkdzLt8O2dr1GzIAzCuY0xNKaxTnEdwF9Wfz+7KV6h6lDC4fhuTB51VLOXAf3vsv
wHBG4Mz3NS2dMe9QSQIDAQAB
-----END PUBLIC KEY-----`;

async function validateToken(tk) {
    try {
        await axios.post("/api/auth/validate", { "token": tk });
        return { "message": "Token correcta" }
    } catch (error) {
        console.log(error);
        return { "error": error.response.data.message }
    }
}

function encrypt_data(plain_value) {
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKeyStr);
    return encrypt.encrypt(plain_value);
}

function hash_md5(value) {
    return md5(value);
}

export { validateToken, encrypt_data, hash_md5 }