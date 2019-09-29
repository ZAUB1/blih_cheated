const Env = require("./env");

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
    }

    Delete(name)
    {
        if (!Env.USER)
            throw "No user specified, repo deletion aborted.";
    }
}

module.exports = new Blih;