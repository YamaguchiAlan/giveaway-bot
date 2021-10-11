const giveawayModel = require("../models/giveaway.model")
const listMessages = require("../messages/listMessages.json")
const listEmbed = require("../utils/listEmbedCreator")
const embedCreator = require("../utils/embedCreator")

const listCommand = async (message) => {
    const giveaways = await giveawayModel.find({guildId: message.guildId, ended: false}).sort({startAt: -1}).exec()

    if(!giveaways[0]){
        const embed = embedCreator(listMessages.noActiveGiveaways)
        return message.reply({ embeds: [embed] });
    }

    const embed = listEmbed(listMessages.list, giveaways)
    return message.reply({ embeds: [embed] });
}

module.exports = listCommand;