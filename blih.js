const Env = require("./env");
const prompts = require("prompts")
const crypto = require("crypto");
const request = require("request");
const ora = require("ora");
const exec = require("child_process").exec;
const fs = require("fs");

const USER_AGENT = "blih-1.7";
const BASE_URL = "https://blih.epitech.eu";

const delay = (ms) => { //Awaitable
    return new Promise (bullshit => {
        setTimeout(bullshit, ms);
    });
};

const trim = (str) => {
    return String(str).replace(/(\r\n|\n|\r)/gm, '');
};

class Blih {
    constructor()
    {
        this.spinner;
        this.child;

        this.requesting = false;
        this.fetchingAcls = false;
    }

    async AskForPass(cb)
    {
        this.requesting = true;

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
            this.requesting = true;

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

    ServRequest(resource, method, idata, cb)
    {
        this.requesting = true;

        const options = {
            url: BASE_URL + resource,
            method: method,
            headers: {
                "Content-Type": "application/json",
                "User-Agent": USER_AGENT,
            },
            body: JSON.stringify(this.GetSignedData(idata))
        };

        request(options, (err, res, body) => {
            const data = JSON.parse(body);

            if (cb)
                return cb(data);

            if (data.error)
            {
                this.spinner.fail(data.error);

                process.exit(184);
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

            this.requesting = false;
        });
    }

    async WhoAmI()
    {
        if (!Env.USER)
        {
            ora().fail("No user currently set");
            process.exit(184);
        }

        ora().succeed("You are: " + Env.USER);
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

    async Search(looking)
    {
        if (!Env.USER)
            await this.AskUser();

        this.AskForPass(() => {
            this.spinner = ora('Getting repos').start();

            this.ServRequest("/repositories", "GET", null, data => {
                if (data)
                {
                    const arr = Object.keys(data.repositories);

                    for (let i = 0; arr[i]; i++)
                    {
                        const name = arr[i];

                        if (name.includes(looking))
                        {
                            if (this.spinner.isSpinning)
                                this.spinner.succeed("Some repos where found");

                            console.log("• " + name);

                            if (i == arr.length - 1)
                                return process.exit();
                        }
                    }

                    this.spinner.fail("No repos found with the specified name");
                    process.exit(128);
                }
            });
        });
    }

    async UpSsh(path)
    {
        fs.readFile(path, async (err, data) => {
            console.log(encodeURI(trim(data)));

            if (err)
                return console.log("File specified not found. Aborting");

            if (!Env.USER)
                await this.AskUser();

            this.AskForPass(() => {
                this.spinner = ora('Setting SSH Key').start();

                this.ServRequest("/sshkeys", "POST", { sshkey: encodeURI(trim(data)) });
            });
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
        this.requesting = true;

        this.spinner = ora("Cloning repo").start();

        this.child = exec("git clone git@git.epitech.eu:/" + Env.USER + "/" + name, {
            cmd: Env.WORK_PATH,
            silent: true,
            stdio: "ignore"
        });
    
        this.child.on("exit", (code, sig) => {
            if (code == 128)
                return this.spinner.fail("Repo not cloned, you do suck");

            this.spinner.succeed("Repo successfully cloned");

            this.requesting = false;
        });
    }

    async GlobalClone(args)
    {
        args.every(async val => {
            while (this.requesting)
                await delay(0);

            await this.Clone(val);
        });
    }

    async Prepare(name)
    {
        await this.Create(name);

        while (this.requesting)
            await delay(0);

        await this.SetAcl(name, "ramassage-tek", 'r');

        while (this.requesting)
            await delay(0);

        await this.Clone(name);
    }
}

module.exports = new Blih;
