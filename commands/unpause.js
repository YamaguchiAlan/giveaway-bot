const giveawayModel = require("../models/giveaway.model")
const unpauseMessages = require("../messages/unpauseMessages.json")
const generalMessages = require("../messages/generalMessages.json")
const embedCreator = require("../utils/embedCreator")

const unpauseCommand = async (message, client, args) => {
    const query = args[0];

    const giveaway =
        await giveawayModel.findOne({prize: query, guildId: message.guildId}).sort({startAt: -1}).exec() ||
        await giveawayModel.findOne({messageId: query, guildId: message.guildId}).sort({startAt: -1}).exec() ;

    if (!giveaway) {
        const embed = embedCreator(generalMessages.unabledToFind, query)
        return message.reply({ embeds: [embed] });
    }

    if (!giveaway.pauseOptions.isPaused) {
        const embed = embedCreator(unpauseMessages.notPaused, giveaway.prize)
        return message.reply({ embeds: [embed] });
    }

    client.giveawaysManager.unpause(giveaway.messageId)
    .then(() => {
        const embed = embedCreator(unpauseMessages.unpauseMessage, giveaway.prize)
        return message.reply({ embeds: [embed] });
    })
    .catch((e) => {
        const embed = embedCreator(generalMessages.unexpectedError, e)
        return message.reply({ embeds: [embed] });
    });
}

module.exports = unpauseCommand