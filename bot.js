const {Intents, Client} = require("discord.js")
const botToken = process.env.BOT_TOKEN
const giveawayModel = require("./models/giveaway.model")
const MessageCreate = require("./events/messageCreate")
const userBlacklistModel = require("./models/userBlacklist.model")
const whitelistRoleModel = require("./models/whitelistRole.model")

const winEmbed = require("./utils/winEmbedCreator")
const {userBlocked} = require("./messages/generalMessages.json")
const {roleNotAuthorized} = require("./messages/whitelistMessages.json")
const embedCreator = require("./utils/embedCreator")

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] })

const config = require('./config.json');
client.config = config;

const { GiveawaysManager } = require('discord-giveaways');

const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
    async getAllGiveaways() {
        return await giveawayModel.find().lean().exec();
    }

    async saveGiveaway(messageId, giveawayData) {
        await giveawayModel.create(giveawayData);
        return true;
    }

    async editGiveaway(messageId, giveawayData) {
        await giveawayModel.updateOne({ messageId }, giveawayData, { omitUndefined: true }).exec();
        return true;
    }

    async deleteGiveaway(messageId) {
        await giveawayModel.deleteOne({ messageId }).exec();
        return true;
    }
};

const manager = new GiveawayManagerWithOwnDatabase(client, {
    default: {
        botsCanWin: false,
        embedColor: '#FF0000',
        embedColorEnd: '#000000',
        reaction: '🎉'
    }
});

client.giveawaysManager = manager;

client.on("messageCreate", (message) => MessageCreate(message, client))

client.giveawaysManager.on("giveawayEnded", async (giveaway, winners) => {
    const {channelId, guildId, messageId} = giveaway
    if(giveaway.winnerIds[0]){
        try{
            const newGiveaway = await giveawayModel.findOne({channelId, guildId, messageId})
            const prize = newGiveaway.prize
            const channel = await client.channels.fetch(channelId);
            const message = await channel.messages.fetch(messageId)
            const entrants = (message.reactions.cache.get(client.config.emoji).count) - 1

            const embed = winEmbed({entrants, prize, winners})
            channel.send({ embeds: [embed] , content: winners.map((member) => `<@${member.user.id}>`).join(', ')})
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
});

client.giveawaysManager.on('giveawayReactionAdded', async (giveaway, member, reaction) => {
    const {channelId, guildId, messageId} = giveaway
    const channel = await client.channels.fetch(channelId);

    const whitelist = await whitelistRoleModel.findOne({serverId: guildId})
    let authorized = false;

    whitelist.roles.forEach(e => {
        if(member.roles.cache.some(role => role.name === e)){
            authorized = true;
        }
    })

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
});

client.giveawaysManager.on('endedGiveawayReactionAdded', (giveaway, member, reaction) => {
    return reaction.users.remove(member.user);
});

client.login(botToken)

module.exports = client