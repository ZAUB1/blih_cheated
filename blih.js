const Env = require("./env");
const Input = require('prompt-input');
const prompts = require("prompts")
const https = require("https");
const crypto = require("crypto");

const USER_AGENT = "blih-1.7";
const BASE_URL = "blih.epitech.eu";

class Blih {
    constructor()
    {
        //Stuff
    }

    async AskForPass(cb)
    {
        if (Env.PASSWD)
            return cb();

        const response = await prompts([{
            type: 'password',
            name: 'pass',
            message: 'Password:'
        },
        {
            type: "text",
            name: "validate",
            message: "Save ? (y/n)"
        }]);

        Env.PASSWD = response.pass;

        if (response.validate == "y")
            Env.SavePass(Env.PASSWD);

        cb();
    }

    AskUser(cb, args)
    {
        const input = await prompts([{
            name: "username",
            type: "text",
            message: "Username (epitech.eu)"
        },
        {
            type: "text",
            name: "validate",
            message: "Save ? (y/n)"
        }]);

        input.run().then((res) => {
            Env.USER = res;

            const save = new Input({
                name: "save",
                message: "Save ? (y/n)"
            });

            save.run().then((savea) => {
                if (savea == "y")
                    Env.SaveUser(res);

                cb(args);
            });
        });
    }

    GetToken()
    {
        return crypto.createHash("sha512").update(Env.PASSWD).digest("hex");
    }

    GetSignedData(data)
    {
        const signature = crypto.createHmac("sha512", new Buffer(this.GetToken(), "utf8"));
        signature.update(new Buffer(Env.PASSWD, "utf8"));

        if (data)
            signature.update(new Buffer(JSON.stringify(data), "utf8"));

        const signedData = {"user": Env.PASSWD, signature: signature.digest("hex")};

        if (data)
            signedData.data = data;

        return signedData;
    }

    ServRequest(resource, method, data)
    {
        const req = https.request({
            hostname: BASE_URL,
            method: method,
            path: resource,
            port: 443,
            headers: {
                "Content-Type": "application/json",
                "User-Agent": USER_AGENT,
            }
        }, res => {
            res.on("data", part => {
                console.log("Part " + part)
            });
        });

        req.write(JSON.stringify(this.GetSignedData(data)));

        req.end();
    }

    Create(name)
    {
        if (!Env.USER)
            throw "No user specified, repo creation aborted.";

        this.AskForPass(() => {
            this.ServRequest("");
        });
    }

    Delete(name)
    {
        if (!Env.USER)
            throw "No user specified, repo deletion aborted.";

        this.AskForPass(() => {
            this.ServRequest();
        });
    }

    List()
    {
        if (!Env.USER)
            throw "No user specified, repo deletion aborted.";

        this.AskForPass(() => {
            this.ServRequest("/repositories", "GET");
        });
    }
}

module.exports = new Blih;
