const giveawayModel = require("../models/giveaway.model")
const editMessages = require("../messages/editMessages.json")
const embedCreator = require("../utils/embedCreator")
const generalMessages = require("../messages/generalMessages.json")
const endMessages = require("../messages/endMessages.json")
const startMessages = require("../messages/startMessages.json")
const ms = require("ms")

const findGiveaway = async (query, message) => {
    const giveaway =
        await giveawayModel.findOne({prize: query, guildId: message.guildId}).sort({startAt: -1}).exec() ||
        await giveawayModel.findOne({messageId: query, guildId: message.guildId}).sort({startAt: -1}).exec() ;

    if (!giveaway) {
        const embed = embedCreator(generalMessages.unabledToFind, query)
        message.reply({ embeds: [embed] });
        return false;
    }

    if (giveaway.ended) {
        const embed = embedCreator(endMessages.alreadyEnded , giveaway.prize)
        message.reply({ embeds: [embed] });
        return false;
    }

    return giveaway;
}

const editCommand = async (message, client, args) => {
    if(!args[2]) return;

    let giveawayPrize = "";
    let queryByName = false;
    let argsIndex = 2;
    if(args[1].startsWith('"')){
        queryByName = true;
        if(args[1].endsWith('"')){
            giveawayPrize = args[1].replace(/"/g,'');
        } else{
            for(let i = 1; i < args.length; i++){
                if(i === 1){
                    giveawayPrize = args[1].replace(/"/g,'');
                    if(i === args.length - 1){
                        giveawayPrize = ""
                        break;
                    }
                } else{
                    if(args[i].endsWith('"')){
                        giveawayPrize += " " + args[i].replace(/"/g,'');
                        argsIndex = i + 1;
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

    if(queryByName && !giveawayPrize){
        const embed = embedCreator(generalMessages.noValidName)
        return message.reply({ embeds: [embed] });
    }
    const query = giveawayPrize || args[1];

    if(args[0] === "name"){
        const giveaway = await findGiveaway(query, message)
        if(!giveaway){
            return;
        }

        let giveawayPrize = "";
        for(let i = argsIndex; i < args.length; i++){
            if(giveawayPrize !== ""){
                giveawayPrize += " "
            }
            giveawayPrize += args[i]
        }

        client.giveawaysManager.edit(giveaway.messageId, {
            newPrize: giveawayPrize
        })
        .then(() => {
            const embed = embedCreator(editMessages.giveawayEdited, giveaway.prize)
            return message.reply({ embeds: [embed] });
        })
        .catch((e) => {
            const embed = embedCreator(generalMessages.unexpectedError, e)
            return message.reply({ embeds: [embed] });
        });

    } else if(args[0] === "winners"){
        const giveaway = await findGiveaway(query, message)
        if(!giveaway){
            return;
        }

        if(isNaN(parseInt(args[argsIndex]))){
            const embed = embedCreator(startMessages.invalidWinnersCount)
            return message.reply({ embeds: [embed] });
        }

        client.giveawaysManager.edit(giveaway.messageId, {
            newWinnerCount: parseInt(args[argsIndex])
        })
        .then(() => {
            const embed = embedCreator(editMessages.giveawayEdited, giveaway.prize)
            return message.reply({ embeds: [embed] });
        })
        .catch((e) => {
            const embed = embedCreator(generalMessages.unexpectedError, e)
            return message.reply({ embeds: [embed] });
        });

    } else if(args[0] === "duration"){
        const giveaway = await findGiveaway(query, message)
        if(!giveaway){
            return;
        }

        if(args[argsIndex].startsWith("-") || args[argsIndex].startsWith("+")){
            const duration = ms(args[argsIndex].slice(1))
            if(!duration){
                const embed = embedCreator(startMessages.invalidDuration)
                return message.reply({ embeds: [embed] });
            }

            let newDuration;
            if(args[argsIndex].startsWith("+")){
                newDuration = giveaway.endAt + duration
            } else{
                newDuration = giveaway.endAt - duration
            }

            client.giveawaysManager.edit(giveaway.messageId, {
                setEndTimestamp: newDuration
            })
            .then(() => {
                const embed = embedCreator(editMessages.giveawayEdited, giveaway.prize)
                return message.reply({ embeds: [embed] });
            })
            .catch((e) => {
                const embed = embedCreator(generalMessages.unexpectedError, e)
                return message.reply({ embeds: [embed] });
            });
        } else{
            const duration = ms(args[argsIndex])
            if(!duration){
                const embed = embedCreator(startMessages.invalidDuration)
                return message.reply({ embeds: [embed] });
            }

            client.giveawaysManager.edit(giveaway.messageId, {
                setEndTimestamp: Date.now() + duration
            })
            .then(() => {
                const embed = embedCreator(editMessages.giveawayEdited, giveaway.prize)
                return message.reply({ embeds: [embed] });
            })
            .catch((e) => {
                const embed = embedCreator(generalMessages.unexpectedError, e)
                return message.reply({ embeds: [embed] });
            });
        }
    } else {
        return;
    }
}

module.exports = editCommand