![npm](https://img.shields.io/npm/v/git-kermit?color=76FF03)

![Sippin](https://user-images.githubusercontent.com/24931732/154041469-7df2baad-c8ee-4c0c-a17e-63d7626ef40f.gif)

# Kermit
Quickly generate conventional commits using the command line.


## Inspiration
Using [conventional commits styling](https://www.conventionalcommits.org/en/v1.0.0/) makes a git history much more organized and readable.
However, creating conventional commit messages from scratch can be a nightmare. Luckily, the kermit CLI is here to save the day and make commit messages fun again!

## Installation
Kermit is hosted as an npm package, so you will need to have [Node.js](https://nodejs.org/en/) installed beforehand.
```bash
npm install git-kermit # Install git-kermit from npm

# Configure the git kermit alias
git config --global alias.kermit '!sh -c '\''kermit -g "$0" "$@"'\'''
```
## Usage
There are two ways to generate commit messages:
* `git kermit` creates a git commit with the generated message
* `kermit` prints out the generated messsage

Kermit uses an inuitive form built with [Inquirer.js](https://www.npmjs.com/package/inquirer) to build commit messages in a user-friendly way.

<img width="322" alt="Screen Shot 2022-02-15 at 2 31 16 AM" src="https://user-images.githubusercontent.com/24931732/154043866-46cd428a-afbc-4e66-8f2d-67023915f956.png">

## Features
* Automatically caches the last used commit scope (can be ignored by entering a space " " for the commit scope)
* Includes an option to specify breaking changes
* All fields are input validated
* `git kermit` supports argument passthrough so flags like `--amend` and `-a` still work

## Contributing
This project is small, but plays an important role for teams that use conventional commits. Feel free to add issues or pull requests suggesting new functionality!
