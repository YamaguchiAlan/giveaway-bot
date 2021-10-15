const channelStatusModel = require("../models/channelState.model")
const startInteractiveMessages = require("../messages/startInteractive.json")
const generalMessages = require("../messages/generalMessages.json")
const embedCreator = require("../utils/embedCreator")

const {start, startInteractive, end, pause, unpause, edit, entry,
        reroll, list, blacklist, whitelistRole, deleteCommand, template} = require("../commands/index")
const runCommand = require("../utils/runCommand")

const messageCreate = async (message, client) => {
    if(message.author.bot) return;

    const channelId = message.channelId
    let channel;

    if(await channelStatusModel.exists({channelId})){
        channel = await channelStatusModel.findOne({channelId})
    } else{
        channel = await new channelStatusModel({
            channelId: channelId,
            channelStatus: 0,
            channelStatusString: "Waiting Giveaway",
            giveaway: {
                channel: null,
                duration: null,
                winnerCount: null,
                author: null
            }
        })
        await channel.save()
    }
    if(channel.channelStatus !== 0 && channel.giveaway.author === message.author.id){
        // CANCEL START-INTERACTIVE
        if(message.content === "cancel"){
            channel.channelStatus = 0;
            channel.channelStatusString = "Waiting Giveaway"
            channel.giveaway = {
                channel: null,
                duration: null,
                winnerCount: null,
                author: null
            }
            await channel.save()
            const embed = embedCreator(generalMessages.giveawayCanceled)
            return message.reply({ embeds: [embed] });
        } else{
            // START INTERACTIVE
            runCommand(message, client, () => startInteractive(message, channel, client))
            await channel.save()

        }
    } else if(message.content.startsWith(client.config.prefix)){
        const [CMD_NAME, ...args] = message.content.trim().substring(client.config.prefix.length).split(/\s+/)

        if(CMD_NAME === "start" && args[0]){
            // START COMMAND
            runCommand(message, client, () => start(message, client, args))

        } else if(CMD_NAME === "start" && !args[0]){
            // START INTERACTIVE COMMAND
            runCommand(message, client, async () => {
                channel.channelStatus = 1;
                channel.channelStatusString = "Waiting Channel"
                channel.giveaway.author = message.author.id
                await channel.save()
                const embed = embedCreator(startInteractiveMessages.askChannel)
                return message.reply({ embeds: [embed] });
            })

        } else if(CMD_NAME === "end"){
            // END COMMAND
            runCommand(message, client, () => end(message, client, args))

        } else if(CMD_NAME === "pause"){
            // PAUSE COMMAND
            runCommand(message, client, () => pause(message, client, args))

        } else if(CMD_NAME === "unpause"){
            // UNPAUSE COMMAND
            runCommand(message, client, () => unpause(message, client, args))

        } else if(CMD_NAME === "reroll"){
            // REROLL COMMAND
            runCommand(message, client, () => reroll(message, client, args))

        } else if(CMD_NAME === "list"){
            // LIST COMMAND
            runCommand(message, client, () => list(message, args))

        } else if(CMD_NAME === "blacklist"){
            // BLACKLIST COMMAND
            runCommand(message, client, () => blacklist(message, args, client))

        } else if(CMD_NAME === "whitelist"){
            // WHITELIST COMMAND
            runCommand(message, client, () => whitelistRole(message, args))

        } else if(CMD_NAME === "delete"){
            // DELETE COMMAND
            runCommand(message, client, () => deleteCommand(message, client, args))

        } else if(CMD_NAME === "edit"){
            // EDIT COMMAND
            runCommand(message, client, () => edit(message, client, args))

        } else if(CMD_NAME === "entry"){
            // ENTRY COMMAND
            runCommand(message, client, () => entry(message, client, args))

        } else if(CMD_NAME === "template"){
            // TEMPLATE COMMAND
            runCommand(message, client, () => template(message, client, args))

        }

    }
}

module.exports = messageCreate