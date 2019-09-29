const os = require("os");
const fs = require("fs");

const ENVFILE = os.homedir() + "/.blihrc";

class Env {
    constructor()
    {
        this.USER = null;
        this.PASSWD = null;
        this.jdata = {};

        fs.readFile(ENVFILE, (err, data) => {
            if (err)
                return fs.writeFileSync(ENVFILE, "{}");

            this.jdata = JSON.parse(data);

            if (this.jdata.user)
                this.USER = this.jdata.user;

            if (this.jdata.passwd)
                this.PASSWD = this.jdata.passwd;
        });
    }

    SaveUser(usr)
    {
        this.jdata.user = usr;
        this.USER = usr;

        fs.writeFileSync(ENVFILE, JSON.stringify(this.jdata));
    }

    SavePass(pass)
    {
        this.jdata.passwd = pass;
        this.PASSWD = pass;

        fs.writeFileSync(ENVFILE, JSON.stringify(this.jdata));
    }
}

module.exports = new Env;