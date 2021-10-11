const channelStatusModel = require("../models/channelState.model")
const startInteractiveMessages = require("../messages/startInteractive.json")
const generalMessages = require("../messages/generalMessages.json")
const embedCreator = require("../utils/embedCreator")
const checkRoles = require("../utils/checkRoles")

const startCommand = require("../commands/start")
const startInteractive = require("../commands/startInteractive")
const endCommand = require("../commands/end")
const pauseCommand = require("../commands/pause")
const unpauseCommand = require("../commands/unpause")
const rerollCommand = require("../commands/reroll")
const listCommand = require("../commands/list")
const blacklistCommand = require("../commands/blacklist")
const whitelistRoleCommand = require("../commands/whitelistRole")

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
            if(checkRoles(message, client)){
                startInteractive(message, channel, client)
                await channel.save()
            } else{
                const embed = embedCreator(generalMessages.roleUnauthorized)
                return message.reply({ embeds: [embed] });
            }
        }
    } else if(message.content.startsWith(client.config.prefix)){
        const [CMD_NAME, ...args] = message.content.trim().substring(client.config.prefix.length).split(/\s+/)

        if(CMD_NAME === "start" && args[0]){
            // START COMMAND
            if(checkRoles(message, client)){
                startCommand(message, client, args)
            } else{
                const embed = embedCreator(generalMessages.roleUnauthorized)
                return message.reply({ embeds: [embed] });
            }

        } else if(CMD_NAME === "start" && !args[0]){
            // START INTERACTIVE COMMAND
            if(checkRoles(message, client)){
                channel.channelStatus = 1;
                channel.channelStatusString = "Waiting Channel"
                channel.giveaway.author = message.author.id
                await channel.save()
                const embed = embedCreator(startInteractiveMessages.askChannel)
                return message.reply({ embeds: [embed] });
            } else{
                const embed = embedCreator(generalMessages.roleUnauthorized)
                return message.reply({ embeds: [embed] });
            }
        } else if(CMD_NAME === "end"){
            // END COMMAND
            if(checkRoles(message, client)){
                endCommand(message, client, args)
            } else{
                const embed = embedCreator(generalMessages.roleUnauthorized)
                return message.reply({ embeds: [embed] });
            }

        } else if(CMD_NAME === "pause"){
            // PAUSE COMMAND
            if(checkRoles(message, client)){
                pauseCommand(message, client, args)
            } else{
                const embed = embedCreator(generalMessages.roleUnauthorized)
                return message.reply({ embeds: [embed] });
            }

        } else if(CMD_NAME === "unpause"){
            // UNPAUSE COMMAND
            if(checkRoles(message, client)){
                unpauseCommand(message, client, args)
            } else{
                const embed = embedCreator(generalMessages.roleUnauthorized)
                return message.reply({ embeds: [embed] });
            }

        } else if(CMD_NAME === "reroll"){
            // UNPAUSE COMMAND
            if(checkRoles(message, client)){
                rerollCommand(message, client, args)
            } else{
                const embed = embedCreator(generalMessages.roleUnauthorized)
                return message.reply({ embeds: [embed] });
            }
        } else if(CMD_NAME === "list"){
            // UNPAUSE COMMAND
            if(checkRoles(message, client)){
                listCommand(message)
            } else{
                const embed = embedCreator(generalMessages.roleUnauthorized)
                return message.reply({ embeds: [embed] });
            }
        } else if(CMD_NAME === "blacklist"){
            // UNPAUSE COMMAND
            if(checkRoles(message, client)){
                blacklistCommand(message, args, client)
            } else{
                const embed = embedCreator(generalMessages.roleUnauthorized)
                return message.reply({ embeds: [embed] });
            }
        } else if(CMD_NAME === "whitelist"){
            // UNPAUSE COMMAND
            if(checkRoles(message, client)){
                whitelistRoleCommand(message, args, client)
            } else{
                const embed = embedCreator(generalMessages.roleUnauthorized)
                return message.reply({ embeds: [embed] });
            }
        }

    }
}

module.exports = messageCreate