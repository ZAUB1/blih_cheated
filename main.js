const Blih = require("./blih");

const CBS = [];

CBS["-h"] = CBS["--help"] = () => {
    console.log(`
Advanced blih (EPITECH repository tool) by ZAUB1.

Options:
• -h | --help -- Shows this
• -v | --verbose -- Shows advanced logging about what's going on
• -u | --user -- Runs the command as a specific user (allows to switch between users as this saves it)

Commands:
• repo | repository -- Allows for repository managment
• who -- In case you forgot who you are, it prints it.
    `);

    process.exit();
};

CBS["repo"] = CBS["repository"] = async args => {
    if (args.length == 0)
    {
        console.log(`
Repository command usage: zblih + [options] repository [command]

Commands:
• create -- Creates a repo on EPITECH's servers
• list -- Lists your repos on EPITECH's servers
• delete -- Deletes the specified repo
• setacl -- Allows to set permission to users on the repo
• getacl -- Shows users perms on the repo
        `);

        process.exit();
    }

    args.forEach((val, index) => {
        switch (val)
        {
            case "create":
                Blih.Create(args[index + 1]);
                break;
        }
    });
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