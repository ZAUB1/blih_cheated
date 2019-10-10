const Env = require("./env");
const prompts = require("prompts")
const crypto = require("crypto");
const request = require("request");
const ora = require("ora");
const nodegit = require("nodegit");

const USER_AGENT = "blih-1.7";
const BASE_URL = "https://blih.epitech.eu";

class Blih {
    constructor()
    {
        this.spinner;

        this.fetchingAcls = false;
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

    async AskUser()
    {
        if (!Env.USER)
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
        }
        //cb(args);
    }

    Logout()
    {
        Env.ResetEnv();
    }

    GetToken()
    {
        return crypto.createHash("sha512").update(Env.PASSWD).digest("hex");
    }

    GetSignedData(data)
    {
        const signature = crypto.createHmac("sha512", this.GetToken());
        signature.update(Env.USER, "utf8");

        if (data)
        {
            const ordered = {};

            Object.keys(data).sort().forEach(key => {
                ordered[key] = data[key];
            });

            signature.update(JSON.stringify(ordered, null, 4));
        }

        const signedData = {"user": Env.USER, signature: signature.digest("hex")};

        if (data)
            signedData["data"] = data;

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
            const data = JSON.parse(body);

            if (data.error)
            {
                this.spinner.fail(data.error);

                process.error();
            }
            else if (data.repositories)
            {
                this.spinner.info("Repositories fetched correctly");

                Object.keys(data.repositories).map(key => {
                    console.log("• " + key);
                });

				process.exit();
            }
            else if (data.message)
            {
                this.spinner.succeed(data.message);
            }
            else
            {
                if (this.fetchingAcls)
                {
                    this.spinner.info("Repository acls fetched correctly");

                    Object.keys(data).map(key => {
                        console.log("• " + key + " -> " + data[key]);
                    });
                }
            }
        });
    }

    async Create(name)
    {
        if (!Env.USER)
            await this.AskUser();

        this.AskForPass(() => {
            this.spinner = ora('Creating repo').start();

            this.ServRequest("/repositories", "POST", { name: name, type: "git" });
        });
    }

    async Delete(name)
    {
        if (!Env.USER)
            await this.AskUser();

        this.AskForPass(() => {
            this.spinner = ora('Deleting repo').start();

            this.ServRequest("/repository/" + name, "DELETE");
        });
    }

    async Info(name)
    {
        if (!Env.USER)
            await this.AskUser();

        this.AskForPass(() => {
            this.spinner = ora('Getting repo infos').start();

            this.ServRequest("/repository/" + name, "GET");
        });
    }

    async List()
    {
        if (!Env.USER)
            await this.AskUser();

        this.AskForPass(() => {
            this.spinner = ora('Getting repos').start();

            this.ServRequest("/repositories", "GET");
        });
    }

    async GetAcl(name)
    {
        this.fetchingAcls = true;

        if (!Env.USER)
            await this.AskUser();

        this.AskForPass(() => {
            this.spinner = ora("Getting repo's acls").start();

            this.ServRequest("/repository/" + name + "/acls", "GET");
        });
    }

    async SetAcl(name, user, perm)
    {
        if (!Env.USER)
            await this.AskUser();

        this.AskForPass(() => {
            this.spinner = ora("Setting repo's acls").start();

            this.ServRequest("/repository/" + name + "/acls", "POST", { user: user, acl: perm });
        });
    }

    async Clone(name)
    {
        /*const cloneoptions = {
            fetchOpts: {
                callbacks: {
                    certificateCheck: function() { return 0; },
                    credentials: function(url, userName) {
                        console.log(userName);
                        return nodegit.Cred.sshKeyFromAgent(userName);
                    }
                }
            }
        };

        nodegit.Clone.clone("git@git.epitech.eu:/" + Env.USER + "/" + name, name, cloneoptions).then(repo => {
            console.log(repo)
        }).catch(console.log);*/

		console.log("Nah, this doesn't work yet");
    }
}

module.exports = new Blih;
