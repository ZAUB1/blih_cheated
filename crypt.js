const crypto = require("crypto"),
    algorithm = "aes-256-ctr",
    password = "originalblihreallysuckslmao";

class Crypter {
    Crypt(text)
    {
        const cipher = crypto.createCipher(algorithm, password);
        let crypted = cipher.update(text, 'utf8', 'hex');

        crypted += cipher.final('hex');

        return crypted;
    }

    Decrypt(text)
    {
        const decipher = crypto.createDecipher(algorithm, password);
        let dec = decipher.update(text, 'hex', 'utf8');

        dec += decipher.final('utf8');

        return dec;
    }
}

module.exports = new Crypter;
