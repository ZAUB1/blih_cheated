#!/usr/bin/node

const Blih = require("./blih");
const CBS = [];

CBS["-h"] = CBS["--help"] = () => {
    console.log(`
Advanced blih (EPITECH repository tool) by ZAUB1.

Options:
• -h | --help -- Shows this
• -v | --verbose -- Shows advanced logging about what's going on

Commands:
• repo | repository -- Allows for repository managment
• who -- In case you forgot who you are, it prints it.
• userlogout -- Logs out current user in order to use the tool as another one
• sshkey -- Upload the SSH key specified in param
    `);

    process.exit();
};

const repo_man = () => {
    console.log(`
Repository command usage: zblih + [options] repository [command]

Commands:
• create -- Creates a repo on EPITECH's servers
• list -- Lists your repos on EPITECH's servers
• delete -- Deletes the specified repo
• setacl -- Allows to set permission to users on the repo
• getacl -- Shows users perms on the repo
• prepare -- Creates, Set default ACLs, Clones
• clone -- Clones the specified repos (yes you can clone multiple at once)
    `);
};

CBS["repo"] = CBS["repository"] = async args => {
    if (args.length == 0)
    {
        repo_man();

        process.exit();
    }

    args.every((val, index) => {
        switch (val)
        {
            case "create":
                Blih.Create(args[index + 1]);
                break;

            case "rm":
            case "remove":
            case "delete":
                Blih.Delete(args[index + 1]);
                break;

            case "ls":
            case "list":
                Blih.List();
                break;

            case "info":
                Blih.Info(args[index + 1]);
                break;

            case "getacl":
                Blih.GetAcl(args[index + 1]);
                break;

            case "setacl":
                Blih.SetAcl(args[index + 1], args[index + 2], args[index + 3]);
                break;

            case "clone":
                Blih.GlobalClone(args.slice(1));
                break;

            case "prepare":
                Blih.Prepare(args[index + 1]);
                break;

            case "search":
                Blih.Search(args[index + 1]);
            /*default:
                repo_man();*/
        }
    });
};

CBS["-ssh"] = CBS["sshkey"] = async args => {
    if (args.length == 0)
        return console.log("You must provide a path in order to upload the ssh key");

    Blih.UpSsh(args[0]);
};

CBS["userlogout"] = () => {
    Blih.Logout();
};

setImmediate(() => {
    if (process.argv.length <= 2)
        CBS["-h"]();

    process.argv.slice(2).every((val, index, array) => {
        try
        {
            CBS[val](array.slice(1));
            return false;
        }
        catch(e)
        {
            console.log("Unknown command : " + val);
            CBS["-h"]();
        }
    });
});
