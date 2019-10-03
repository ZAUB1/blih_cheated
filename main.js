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

            case "remove":
            case "delete":
                Blih.Delete(args[index + 1]);
                break;

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

            /*default:
                repo_man();*/
        }
    });
};

/*CBS["-u"] = CBS["--user"] = async args => {
    Blih.AskUser(CBS[args[0]], args.slice(0));
};*/

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
