const ms = require("ms")
const giveawayMessages = require("../messages/giveaway-messages")
const startMessages = require("../messages/startMessages.json")
const embedCreator = require("../utils/embedCreator")
const userBlacklistModel = require("../models/userBlacklist.model")

const startCommand = async (message, client, args) => {
    if(args.length < 4) {
        const embed = embedCreator(startMessages.missingArguments)
        return message.reply({ embeds: [embed] });
    }

    let giveawayChannel;
    if(!args[0].startsWith("<")){
        let checkGiveawayChannel;

        if(args[0] === "here" || args[0] === "Here"){
            checkGiveawayChannel = await client.channels.fetch(message.channelId)
        } else {
            const guild = await client.guilds.fetch(message.guildId)
            checkGiveawayChannel = guild.channels.cache.find(g => g.name === args[0] && g.type !== "GUILD_CATEGORY")
        }
        if(checkGiveawayChannel){
            giveawayChannel = checkGiveawayChannel;
        }else{
            const embed = embedCreator(startMessages.channelNotFound)
            return message.reply({ embeds: [embed] });
        }
    } else{
        try{
            const checkGiveawayChannel = await client.channels.fetch(args[0].replace(/\D/g, ""))
            giveawayChannel = checkGiveawayChannel;
        } catch(err){
            const embed = embedCreator(startMessages.channelNotFound)
            return message.reply({ embeds: [embed] });
        }
    }

    const giveawayDuration = ms(args[1])
    if(!giveawayDuration) {
        const embed = embedCreator(startMessages.invalidDuration)
        return message.reply({ embeds: [embed] });
    }

    if(isNaN(parseInt(args[2]))) {
        const embed = embedCreator(startMessages.invalidWinnersCount)
        return message.reply({ embeds: [embed] });
    }

    const giveawayWinnerCount = parseInt(args[2]);
    const giveawayPrize = args[3];

    if(!giveawayChannel.isText()) {
        const embed = embedCreator(startMessages.notTextBased)
        return message.reply({ embeds: [embed] });
    }

    client.giveawaysManager.start(giveawayChannel, {
        duration: giveawayDuration,
        prize: giveawayPrize,
        winnerCount: giveawayWinnerCount,
        hostedBy: client.config.hostedBy ? message.author : null,
        messages: giveawayMessages
    })
    .then(async gData => {
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
}

module.exports = startCommand