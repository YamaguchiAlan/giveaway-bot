require("dotenv").config()
require('./database')

const {Intents, Client} = require("discord.js")
const botToken = process.env.BOT_TOKEN
const giveawayModel = require("./models/giveaway.model")

const MessageCreate = require("./events/messageCreate")
const GiveawayEnded = require("./events/giveawayEnded")
const GiveawayReactionAdded = require("./events/giveawayReactionAdded")

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] })

const config = require('../config.json');
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
        botsCanWin: config.botsCanWin,
        embedColor: config.giveawayEmbedColor,
        embedColorEnd: config.giveawayEmbedColorEnd,
        reaction: config.reaction
    }
});

client.giveawaysManager = manager;

client.on("messageCreate", (message) => MessageCreate(message, client))

client.giveawaysManager.on("giveawayEnded", (giveaway, winners) => GiveawayEnded(giveaway, winners, client));

client.giveawaysManager.on('giveawayReactionAdded', (giveaway, member, reaction) => GiveawayReactionAdded(giveaway, member, reaction, client));

client.giveawaysManager.on('endedGiveawayReactionAdded', (giveaway, member, reaction) => {
    return reaction.users.remove(member.user);
});

client.login(botToken)

module.exports = client