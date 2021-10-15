const giveawayModel = require("../models/giveaway.model")
const endMessages = require("../messages/endMessages.json")
const generalMessages = require("../messages/generalMessages.json")
const embedCreator = require("../utils/embedCreator")

const endCommand = async (message, client, args) => {
    let giveawayPrize = "";
    if(args[0].startsWith('"')){
        if(args[0].endsWith('"')){
            giveawayPrize = args[0].replace(/"/g,'');
        } else{
            for(let i = 0; i < args.length; i++){
                if(i === 0){
                    giveawayPrize = args[0].replace(/"/g,'');
                    if(i === args.length - 1){
                        giveawayPrize = ""
                        break;
                    }
                } else{
                    if(args[i].endsWith('"')){
                        giveawayPrize += " " + args[i].replace(/"/g,'');
                        break;
                    } else{
                        if(i === args.length - 1){
                            giveawayPrize = ""
                            break;
                        }
                    }
                    giveawayPrize += " " + args[i]
                }
            }
        }
    }

    const query = giveawayPrize || args[0];

    const giveaway =
        await giveawayModel.findOne({prize: query, guildId: message.guildId}).sort({startAt: -1}).exec() ||
        await giveawayModel.findOne({messageId: query, guildId: message.guildId}).sort({startAt: -1}).exec() ;

    if (!giveaway) {
        const embed = embedCreator(generalMessages.unabledToFind, query)
        return message.reply({ embeds: [embed] });
    }

    if (giveaway.ended) {
        const embed = embedCreator(endMessages.alreadyEnded , giveaway.prize)
        return message.reply({ embeds: [embed] });
    }

    if (giveaway.pauseOptions.isPaused) {
        const embed = embedCreator(endMessages.unpauseBeforeEnd , giveaway.prize)
        return message.reply({ embeds: [embed] });
    }

    client.giveawaysManager.end(giveaway.messageId)
    .then(() => {
        const embed = embedCreator(endMessages.endMessage, giveaway.prize)
        return message.reply({ embeds: [embed] });
    })
    .catch((e) => {
        const embed = embedCreator(generalMessages.unexpectedError, e)
        return message.reply({ embeds: [embed] });
    });
}

module.exports = endCommand