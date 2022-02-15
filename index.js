#! /usr/bin/env node

var inquirer = require('inquirer');
var path = require('path');
var fs = require('fs');
var simpleGit = require('simple-git');
var git = simpleGit();
var args = process.argv.slice(2);
if(args[args.length - 1] === "sh") {
    args.pop()
}
var useGit = args.includes("-g")

if(useGit && args.includes("-m")) {
    console.error("Not allowed to specify a message when using git kermit")
    process.exit(1)
}
if(useGit && args[0] != "-g") {
    console.error("-g must be specified as the first option")
    process.exit(1)
}

function makeKermit() {
    var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    var cacheDir = process.platform == 'win32' ?  path.join(homeDir, 'AppData', 'kermit') : path.join(homeDir, '.kermit');

    try {
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir)
      }
    } catch (err) {
      console.error(err)
    }
    var suggestScope = ""
    try {
      suggestScope = fs.readFileSync(cacheDir + '/suggestScope.txt', 'utf8')
    } catch (err) {
    }

    inquirer
      .prompt([
        {
            prefix: '🐸',
            name: 'type',
            type: 'list',
            message: 'Select commit type:',
            choices: [ 'build', 'ci', 'chore', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'],
            default: 'feat',
            pageSize: 11,
            loop: false
        },
        {
            prefix: '🐸',
            name: 'scope',
            type: 'input',
            message: 'Enter an optional scope:',
            default: suggestScope,
            validate: (input) => {
                                if(input.match("[A-Z]")) return "Scope must be lowercase"
                                if(input.match("\\s[^a-z-s]")) return "No special chars except '-' are allowed"
                                return true;
                                 }
        },
        {
            prefix: '🐸',
            name: 'breaking',
            type: 'confirm',
            message: 'Includes breaking changes?',
            default: false
            },
        {
            prefix: '🐸',
            name: 'description',
            type: 'input',
            message: 'Enter description:',
            validate: (input) => { if(input.length == 0) {
                                    return 'Description cannot be empty';
                                    } if(input[0] == input[0].toUpperCase()) {
                                    return 'Must start with lowercase letter';
                                    }
                                    return true;
                                }
        }
      ])
      .then((answers) => {
        if(answers.scope === ' ') answers.scope = ''
        if(answers.scope != '') fs.writeFileSync(cacheDir + '/suggestScope.txt', answers.scope)

        var message = answers.type
        + (answers.scope != '' ? '(' + answers.scope + ')' : '' )
        + (answers.breaking ? '!' : '')
        + ': ' + answers.description
        if(useGit) {
            var cmd = "git commit -m \"" + message + "\""
            for(let i = 1; i < args.length; args++){
                cmd += " " + args[i]
            }
            require('child_process').exec(cmd,function(err, stdout, stderr) {
              if (err) {
                console.error(err);
                return;
              }
              console.log(stdout);
              })
        }
        else {
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

if(useGit) {
    git.status().then(result => {
    if(result.detached) {
        console.error("HEAD is currently detached, cannot kermit")
        process.exit(1)
    }
    if(result.staged.length == 0 && !(args.includes("--amend") || args.includes("-a"))) {
        console.error("No changes are staged, cannot kermit")
        process.exit(1)
    }
    makeKermit()
    });
}
else {
    makeKermit();
}