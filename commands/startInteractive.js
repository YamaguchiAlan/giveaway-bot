const giveawayMessages = require("../messages/giveaway-messages")
const ms = require('ms');
const startMessages = require("../messages/startMessages.json")
const startInteractiveMessages = require("../messages/startInteractive.json")
const embedCreator = require("../utils/embedCreator")
const interactiveEmbedCreator = require("../utils/interactiveStartEmbedCreator")
const userBlacklistModel = require("../models/userBlacklist.model")

const startInteractive = async (message, channel, client) => {
    switch (channel.channelStatus) {
        case 1:
            if(!message.content.startsWith("<")){
                let giveawayChannel;

                if(message.content === "here" || message.content === "Here"){
                    giveawayChannel = await client.channels.fetch(message.channelId)
                } else {
                    const guild = await client.guilds.fetch(message.guildId)
                    giveawayChannel = guild.channels.cache.find(g => g.name === message.content && g.type !== "GUILD_CATEGORY")
                }
                if(giveawayChannel){
                    if(!giveawayChannel.isText()) {
                        const embed = embedCreator(startMessages.notTextBased)
                        return message.reply({ embeds: [embed] });
                    } else{
                        channel.channelStatus = 2;
                        channel.channelStatusString = "Waiting Duration"
                        channel.giveaway.channel = giveawayChannel.id
                        channel.giveaway.channelName = giveawayChannel.name
                        const embed = interactiveEmbedCreator(startInteractiveMessages.askDuration, channel.giveaway)
                        return message.reply({ embeds: [embed] });
                    }
                }else{
                    const embed = embedCreator(startMessages.channelNotFound)
                    return message.reply({ embeds: [embed] });
                }
            } else{
                client.channels.fetch(message.content.replace(/\D/g, ""))
                .then(giveawayChannel => {
                    if(!giveawayChannel.isText()) {
                        const embed = embedCreator(startMessages.notTextBased)
                        return message.reply({ embeds: [embed] });
                    } else{
                        channel.channelStatus = 2;
                        channel.channelStatusString = "Waiting Duration"
                        channel.giveaway.channel = message.content.replace(/\D/g, "")
                        channel.giveaway.channelName = giveawayChannel.name
                        const embed = interactiveEmbedCreator(startInteractiveMessages.askDuration, channel.giveaway)
                        return message.reply({ embeds: [embed] });
                    }
                })
                .catch(err => {
                    const embed = embedCreator(startMessages.channelNotFound)
                    return message.reply({ embeds: [embed] });
                })
            }

            break;
        case 2:
            const duration = ms(message.content)
            if(duration){
                channel.channelStatus = 3;
                channel.channelStatusString = "Waiting WinnerCount"
                channel.giveaway.duration = message.content
                const embed = interactiveEmbedCreator(startInteractiveMessages.askWinnerCount, channel.giveaway)
                return message.reply({ embeds: [embed] });
            } else{
                const embed = embedCreator(startMessages.invalidDuration)
                return message.reply({ embeds: [embed] });
            }

            break;
        case 3:
            if(isNaN(parseInt(message.content))){
                const embed = embedCreator(startMessages.invalidWinnersCount)
                return message.reply({ embeds: [embed] });
            } else{
                channel.channelStatus = 4;
                channel.channelStatusString = "Waiting Prize"
                channel.giveaway.winnerCount = parseInt(message.content)
                const embed = interactiveEmbedCreator(startInteractiveMessages.askPrize, channel.giveaway)
                return message.reply({ embeds: [embed] });
            }

            break;
        case 4:
            const giveawayChannel = await client.channels.fetch(channel.giveaway.channel);

            client.giveawaysManager.start(giveawayChannel, {
                duration: ms(channel.giveaway.duration),
                prize: message.content,
                winnerCount: channel.giveaway.winnerCount,
                hostedBy: client.config.hostedBy ? message.author : null,
                messages: giveawayMessages
            }).then(async gData => {
                const blockedUsers = await userBlacklistModel.find({serverId: message.guildId})
                if(blockedUsers[0]){
                    await Promise.all(blockedUsers.map(async user => {
                        if(user.giveawayAmount > 0){
                            user.blockedGiveaways.push(gData.messageId)
                            user.giveawayAmount = user.giveawayAmount - 1
                            await user.save()
                        }
                    }))
                }
            })

            channel.channelStatus = 0;
            channel.channelStatusString = "Waiting Giveaway"
            channel.giveaway = {
                channel: null,
                duration: null,
                winnerCount: null,
                author: null
            }
            break;

        default:
            break;
    }
}

module.exports = startInteractive