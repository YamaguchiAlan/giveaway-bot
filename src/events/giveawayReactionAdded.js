const userBlacklistModel = require("../models/userBlacklist.model")
const whitelistRoleModel = require("../models/whitelistRole.model")

const {userBlocked} = require("../messages/generalMessages.json")
const {roleNotAuthorized} = require("../messages/whitelistMessages.json")
const embedCreator = require("../utils/embedCreator")

const giveawayReactionAdded = async (giveaway, member, reaction, client) => {
    const {channelId, guildId, messageId} = giveaway
    const channel = await client.channels.fetch(channelId);

    const whitelist = await whitelistRoleModel.findOne({serverId: guildId, messageId: messageId})
    let authorized = false;

    if(whitelist){
        if(whitelist.roles[0]){
            whitelist.roles.forEach(e => {
                if(member.roles.cache.some(role => role.name === e)){
                    authorized = true;
                }
            })
        } else{
            authorized = true;
        }
    } else {
        authorized = true;
    }

    if(!authorized){
        reaction.users.remove(member.user);
        const embed = embedCreator(roleNotAuthorized)
        return channel.send({ embeds: [embed] , content: `<@${member.user.id}>`})
    }

    const exists = await userBlacklistModel.exists({userId: member.user.id, serverId: guildId, blockedGiveaways: messageId})

    if (exists) {
         reaction.users.remove(member.user);
         const embed = embedCreator(userBlocked)
         return channel.send({ embeds: [embed] , content: `<@${member.user.id}>`})
    }
}


module.exports = giveawayReactionAdded