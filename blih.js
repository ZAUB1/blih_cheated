const Env = require("./env");
const prompts = require("prompts")
const crypto = require("crypto");
const request = require("request");

const USER_AGENT = "blih-1.7";
const BASE_URL = "https://blih.epitech.eu";

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

    async AskUser(cb, args)
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

        Env.USER = input.username;

        if (input.validate == "y")
            Env.SaveUser(input.username);

        cb(args);
    }

    GetToken()
    {
        return crypto.createHash("sha512").update(Env.PASSWD).digest("hex");
    }

    GetSignedData(data)
    {
        const signature = crypto.createHmac("sha512",this.GetToken());
        signature.update(Env.USER, "utf8");

        if (data)
            signature.update(JSON.stringify(data));

        const signedData = {"user": Env.USER, signature: signature.digest("hex")};

        if (data)
            signedData.data = data;

        return signedData;
    }

    ServRequest(resource, method, data)
    {
        const options = {
            url: BASE_URL + resource,
            method: method,
            headers: {
                "Content-Type": "application/json",
                "User-Agent": USER_AGENT,
            },
            body: JSON.stringify(this.GetSignedData(data))
        };

        request(options, (err, res, body) => {
            console.log(JSON.parse(body));
        });
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
