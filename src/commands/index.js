const startCommand = require("./start")
const startInteractive = require("./startInteractive")
const endCommand = require("./end")
const pauseCommand = require("./pause")
const unpauseCommand = require("./unpause")
const rerollCommand = require("./reroll")
const listCommand = require("./list")
const blacklistCommand = require("./blacklist")
const whitelistRoleCommand = require("./whitelistRole")
const deleteCommand = require("./delete")
const editCommand = require("./edit")
const entryCommand = require("./entry")
const templateCommand = require("./template")

module.exports = {
    start: startCommand,
    startInteractive: startInteractive,
    end: endCommand,
    pause: pauseCommand,
    unpause: unpauseCommand,
    reroll: rerollCommand,
    list: listCommand,
    blacklist: blacklistCommand,
    whitelistRole: whitelistRoleCommand,
    deleteCommand: deleteCommand,
    edit: editCommand,
    entry: entryCommand,
    template: templateCommand
}