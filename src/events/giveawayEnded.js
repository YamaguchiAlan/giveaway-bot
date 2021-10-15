const userBlacklistModel = require("../models/userBlacklist.model")
const whitelistRoleModel = require("../models/whitelistRole.model")
const bonusEntriesModel = require("../models/bonusEntries.model")
const giveawayModel = require("../models/giveaway.model")
const winEmbed = require("../utils/winEmbedCreator")

const giveawayEnded = async (giveaway, winners, client) => {
    const {channelId, guildId, messageId} = giveaway
    if(giveaway.winnerIds[0]){
        try{
            const newGiveaway = await giveawayModel.findOne({channelId, guildId, messageId})
            const prize = newGiveaway.prize
            const channel = await client.channels.fetch(channelId);
            const message = await channel.messages.fetch(messageId)
            const entrants = (message.reactions.cache.get(client.config.reaction).count) - 1

            const embed = winEmbed({entrants, prize, winners})
            channel.send({ embeds: [embed] })
        } catch(err){
            console.log(err)
        }
    }

    const blockedUsers = await userBlacklistModel.find({serverId: guildId, blockedGiveaways: messageId})
    if(blockedUsers[0]){
        await Promise.all(blockedUsers.map(async user => {
            const index = user.blockedGiveaways.indexOf(messageId)
            const newBlockedGiveaways = user.blockedGiveaways
            newBlockedGiveaways.splice(index, 1)
            user.blockedGiveaways = newBlockedGiveaways

            if(user.giveawayAmount <= 0 && user.blockedGiveaways.length === 0){
                await user.remove()
            } else {
                await user.save()
            }
        }))
    }

    await whitelistRoleModel.findOneAndDelete({serverId: guildId, messageId: messageId})
    await bonusEntriesModel.findOneAndDelete({serverId: guildId, messageId: messageId})
}


module.exports = giveawayEnded