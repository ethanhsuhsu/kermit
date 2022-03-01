#! /usr/bin/env node

var inquirer = require('inquirer');
var path = require('path');
var fs = require('fs');
var simpleGit = require('simple-git');
var git = simpleGit();
var args = process.argv.slice(2);
const {exec} = require("child_process");

if (args[args.length - 1] === "sh") {
    args.pop()
}

const useGit = args.includes("-g");
const isBreaking = args.includes("-b")

if (useGit && args.includes("-m")) {
    console.error("Not allowed to specify a message when using git kermit")
    process.exit(1)
}
if (useGit && args[0] !== "-g") {
    console.error("-g must be specified as the first option")
    process.exit(1)
}

function makeKermit() {
    var homeDir = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
    var cacheDir = process.platform === 'win32' ? path.join(homeDir, 'AppData', 'kermit') : path.join(homeDir, '.kermit');

    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir)
    }
    var suggestScope = ""
    try {
        suggestScope = fs.readFileSync(cacheDir + '/suggestScope.txt', 'utf8')
    } catch (err) {
    }
    var questions = [{
        prefix: '🐸',
        name: 'type',
        type: 'list',
        message: 'Select commit type:',
        choices: ['build', 'ci', 'chore', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'],
        default: 'feat',
        pageSize: 11,
        loop: false
    }, {
        prefix: '🐸',
        name: 'scope',
        type: 'input',
        message: 'Enter an optional scope:',
        default: suggestScope,
        validate: (input) => {
            if (input.match("[A-Z]")) return "Scope must be lowercase"
            if (input.match("\\s[^a-z-s]")) return "No special chars except '-' are allowed"
            return true;
        }
    }, {
        prefix: '🐸', name: 'description', type: 'input', message: 'Enter description:', validate: (input) => {
            if (input.length === 0) {
                return 'Description cannot be empty';
            }
            if (input[0] === input[0].toUpperCase()) {
                return 'Must start with lowercase letter';
            }
            return true;
        }
    }]
    inquirer
        .prompt(questions)
        .then((answers) => {
            if (answers.scope === ' ') answers.scope = ''
            if (answers.scope !== '') fs.writeFileSync(cacheDir + '/suggestScope.txt', answers.scope)

            var message = answers.type + (answers.scope !== '' ? '(' + answers.scope + ')' : '') + (isBreaking ? '!' : '') + ': ' + answers.description
            if (useGit) {
                var cmd = "git commit -m \"" + message + "\" --no-verify"
                for (let i = 1; i < args.length; args++) {
                    cmd += " " + args[i]
                }
                exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log(stdout);
                })
            } else {
                console.log(message)
            }
        })
        .catch((error) => {
            if (error.isTtyError) {
                // Prompt couldn't be rendered in the current environment
            } else {
                // Something else went wrong
            }
        });
}

if (useGit) {
    git.status().then(result => {
        if (result.detached) {
            console.error("HEAD is currently detached, cannot kermit")
            process.exit(1)
        }
        if (result.staged.length === 0 && !(args.includes("--amend") || args.includes("-a"))) {
            console.error("No changes are staged, cannot kermit")
            process.exit(1)
        }
        exec("git rev-parse --show-toplevel", (error, project, stderr) => {
            if (error) {
                console.log(`encountered error: ${error.message}`)
                process.exit(1)
            }
            if (stderr) {
                console.log(`encountered stderr: ${stderr}`);
                process.exit(1)
            }
            exec("git config core.hooksPath", (error, stdout, stderr) => {
                const path = stdout === "" ? ".git/hooks" : stdout.substring(0, stdout.length - 1)
                hook = project.substring(0, project.length - 1) + "/" + path  + "/pre-commit"
                if (fs.existsSync(hook)) {
                    exec("sh " + hook, (error, stdout, stderr) => {
                        if (error || stderr) {
                            console.log(`could not kermit because prekermit hook error encountered`)
                            console.log(`error: ${error}`)
                            console.log(`stderror: ${stderr}`);
                            console.log(`stdout: ${stdout}`);
                            process.exit(1)
                        }
                        makeKermit()
                    });
                } else {
                    makeKermit()
                }
            })
        });
    });
} else {
    makeKermit();
}