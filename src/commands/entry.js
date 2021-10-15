const bonusEntriesModel = require("../models/bonusEntries.model")
const giveawayModel = require("../models/giveaway.model")
const embedCreator = require("../utils/embedCreator")
const generalMessages = require("../messages/generalMessages.json")
const endMessages = require("../messages/endMessages.json")
const entryMessages = require("../messages/entryMessages.json")
const checkBonusEntries = require("../utils/checkBonusEntries")
const listEntryEmbedCreator = require("../utils/listEntryEmbedCreator")
const blacklistMessages = require("../messages/blacklistMessages.json")

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

const entryCommands = async (message, client, args) => {
    if(!args[1]) return;

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

    if(args[0] === "add" && args[3]){
        const giveaway = await findGiveaway(query, message)
        if(!giveaway){
            return;
        }

        let roleName = "";
        for(let i = argsIndex; i < (args.length - 1); i++){
            if(roleName !== ""){
                roleName += " "
            }
            roleName += args[i]
        }

        const entries = parseInt(args[args.length - 1])
        if(isNaN(entries)){
            const embed = embedCreator(entryMessages.invalidEntriesValue, giveaway.prize)
            return message.reply({ embeds: [embed] });
        }
        if(entries <= 0){
            const embed = embedCreator(entryMessages.negativeEntries, giveaway.prize)
            return message.reply({ embeds: [embed] });
        }

        const bonusEntry = {
            role: roleName,
            entries: entries
        }

        const exists = await bonusEntriesModel.exists({serverId: message.guildId, messageId: giveaway.messageId})
        let newBonusEntries;

        if(exists){
            newBonusEntries = await bonusEntriesModel.findOne({serverId: message.guildId, messageId: giveaway.messageId})
            newBonusEntries.bonusEntries.push(bonusEntry)
        } else{
            newBonusEntries = await new bonusEntriesModel({
                serverId: message.guildId,
                messageId: giveaway.messageId,
                bonusEntries: [bonusEntry]
            })
        }

        await newBonusEntries.save()

        client.giveawaysManager.edit(giveaway.messageId, {
            newBonusEntries: [
                {
                    bonus: checkBonusEntries(newBonusEntries.bonusEntries),
                    cumulative: false
                }
            ]
        })
        .then(() => {
            const embed = embedCreator(entryMessages.entriesAdded, giveaway.prize)
            return message.reply({ embeds: [embed] });
        })
        .catch((e) => {
            const embed = embedCreator(generalMessages.unexpectedError, e)
            return message.reply({ embeds: [embed] });
        });

    } else if(args[0] === "remove" && args[2]){
        const giveaway = await findGiveaway(query, message)
        if(!giveaway){
            return;
        }

        let roleName = "";
        for(let i = argsIndex; i < args.length; i++){
            if(roleName !== ""){
                roleName += " "
            }
            roleName += args[i]
        }

        const newBonusEntries = await bonusEntriesModel.findOne({serverId: message.guildId, messageId: giveaway.messageId, "bonusEntries.role": roleName})
        if(!newBonusEntries){
            const embed = embedCreator(entryMessages.entryDoesNotExist, giveaway.prize)
            return message.reply({ embeds: [embed] });
        }

        const index = newBonusEntries.bonusEntries.findIndex(b => b.role === roleName)
        const newEntries = newBonusEntries.bonusEntries
        newEntries.splice(index, 1)
        newBonusEntries.bonusEntries = newEntries

        await newBonusEntries.save()

        client.giveawaysManager.edit(giveaway.messageId, {
            newBonusEntries: [
                {
                    bonus: checkBonusEntries(newBonusEntries.bonusEntries),
                    cumulative: false
                }
            ]
        })
        .then(() => {
            const embed = embedCreator(entryMessages.entriesRemoved, giveaway.prize)
            return message.reply({ embeds: [embed] });
        })
        .catch((e) => {
            const embed = embedCreator(generalMessages.unexpectedError, e)
            return message.reply({ embeds: [embed] });
        });

    } else if(args[0] === "list"){
        const giveaway = await findGiveaway(query, message)
        if(!giveaway){
            return;
        }

        const bonusEntries = await bonusEntriesModel.findOne({serverId: message.guildId, messageId: giveaway.messageId})
        if(!bonusEntries){
            const embed = embedCreator(entryMessages.noEntries, giveaway.prize)
            return message.reply({ embeds: [embed] });
        }
        if(!bonusEntries.bonusEntries[0]){
            const embed = embedCreator(entryMessages.noEntries, giveaway.prize)
            return message.reply({ embeds: [embed] });
        }

        const embed = listEntryEmbedCreator(entryMessages.list, bonusEntries.bonusEntries)
        return message.reply({ embeds: [embed] });
    } else if(args[0] === "check" && args[2]){
        const giveaway = await findGiveaway(query, message)
        if(!giveaway){
            return;
        }

        let user;
        try{
            user = await client.users.fetch(args[argsIndex])
        } catch(err){
            const embed = embedCreator(blacklistMessages.invalidUserId)
            return message.reply({ embeds: [embed] });
        }

        const managerGiveaway = await client.giveawaysManager.giveaways.find(g => g.messageId === giveaway.messageId && g.guildId === giveaway.guildId)
        try{
            const entries = await managerGiveaway.checkBonusEntries(user)
            if(entries){
                return message.reply(`You have ${entries} entries for this giveaway.`);
            } else{
                return message.reply("You have 1 entry for this giveaway.");
            }
        } catch(err){
            const embed = embedCreator(entryMessages.checkEntriesError)
            return message.reply({ embeds: [embed] });
        }

    } else{
        return;
    }
}

module.exports = entryCommands