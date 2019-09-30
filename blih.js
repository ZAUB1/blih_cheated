const Env = require("./env");
const prompt = require("password-prompt");

const USER_AGENT = "blih-1.7";
const BASE_URL = "https://blih.epitech.eu/";

class Blih {
    constructor()
    {
        //Stuff
    }

    Create(name)
    {
        if (!Env.USER)
            throw "No user specified, repo creation aborted.";

        if (!Env.PASSWD)
            Env.PASSWD = prompt("Password: ");

        
    }

    Delete(name)
    {
        if (!Env.USER)
            throw "No user specified, repo deletion aborted.";

        if (!Env.PASSWD)
            Env.PASSWD = prompt("Password: ");
    }

    List()
    {

    }
}

module.exports = new Blih;