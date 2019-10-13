const os = require("os");
const fs = require("fs");
const Crypter = require("./crypt");

const ENVFILE = os.homedir() + "/.blihrc";

class Env {
    constructor()
    {
        this.USER = null;
        this.PASSWD = null;
        this.OSUSER = os.user;
        this.WORK_PATH = process.cwd();
        this.jdata = {};

        this.jdata = JSON.parse(fs.readFileSync(ENVFILE));

        if (this.jdata.user)
            this.USER = this.jdata.user;

        if (this.jdata.passwd)
            this.PASSWD = Crypter.Decrypt(this.jdata.passwd);
    }

    SaveUser(usr)
    {
        this.jdata.user = usr;
        this.USER = usr;

        fs.writeFileSync(ENVFILE, JSON.stringify(this.jdata));
    }

    SavePass(pass)
    {
        console.log(Crypter.Crypt(pass));

        this.jdata.passwd = Crypter.Crypt(pass);
        this.PASSWD = pass;

        fs.writeFileSync(ENVFILE, JSON.stringify(this.jdata));
    }

    ResetEnv()
    {
        Env.USER = null;
        Env.PASSWD = null;

        this.jdata = {};
        fs.writeFileSync(ENVFILE, JSON.stringify(this.jdata));
    }
}

module.exports = new Env;
