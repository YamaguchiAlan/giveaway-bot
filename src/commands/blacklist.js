const giveawayModel = require("../models/giveaway.model")
const userBlacklistModel = require("../models/userBlacklist.model")
const embedCreator = require("../utils/embedCreator")
const blacklistMessages = require("../messages/blacklistMessages.json")
const listBlacklistEmbedCreator = require("../utils/listBlacklistEmbedCreator")
const generalMessages = require("../messages/generalMessages.json")

const blacklistCommand = async (message, args, client) => {
    if(args[0] === "user"){
        let user;
        try{
            user = await client.users.fetch(args[1])
        } catch(err){
            const embed = embedCreator(blacklistMessages.invalidUserId)
            return message.reply({ embeds: [embed] });
        }
        if(!user){
            const embed = embedCreator(blacklistMessages.invalidUserId)
            return message.reply({ embeds: [embed] });
        }

        if(isNaN(parseInt(args[2]))){
            const embed = embedCreator(blacklistMessages.invalidGiveawaysAmount)
            return message.reply({ embeds: [embed] });
        }

        const exists = await userBlacklistModel.exists({userId: args[1], serverId: message.guildId})
        let newUserBlacklist;

        if(exists){
            newUserBlacklist = await userBlacklistModel.findOne({userId: args[1], serverId: message.guildId})
            newUserBlacklist.giveawayAmount = args[2]
        } else{
            newUserBlacklist = await new userBlacklistModel({
                userId: args[1],
                userName: user.username,
                serverId: message.guildId,
                giveawayAmount: args[2]
            })
        }

        await newUserBlacklist.save()

        const embed = embedCreator(blacklistMessages.addedToBlacklist)
        return message.reply({ embeds: [embed] });
    } else if(args[0] === "delete" && args[1]){
        const blacklist = await userBlacklistModel.findOne({guildId: message.guildId, userId: args[1]})

        if(!blacklist){
            const embed = embedCreator(blacklistMessages.unableToFind)
            return message.reply({ embeds: [embed] });
        }
        if(blacklist.giveawayAmount <= 0){
            const embed = embedCreator(blacklistMessages.noBlockRemaining)
            return message.reply({ embeds: [embed] });
        }

        blacklist.giveawayAmount = 0;

        if(blacklist.giveawayAmount <= 0 && blacklist.blockedGiveaways.length === 0){
            await blacklist.remove()
        } else {
            await blacklist.save()
        }

        const embed = embedCreator(blacklistMessages.remainingBlockDeleted)
        return message.reply({ embeds: [embed] });

    } else if(args[0] === "remove" && args[2]){
        let giveawayPrize = "";
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

        const query = giveawayPrize || args[1];

        const giveaway =
            await giveawayModel.findOne({prize: query, guildId: message.guildId}).sort({startAt: -1}).exec() ||
            await giveawayModel.findOne({messageId: query, guildId: message.guildId}).sort({startAt: -1}).exec() ;

        if (!giveaway) {
            const embed = embedCreator(generalMessages.unabledToFind, query)
            return message.reply({ embeds: [embed] });
        }

        const blacklist = await userBlacklistModel.findOne({guildId: message.guildId, userId: args[argsIndex]})

        if(!blacklist){
            const embed = embedCreator(blacklistMessages.unableToFind)
            return message.reply({ embeds: [embed] });
        }
        if(blacklist.blockedGiveaways.indexOf(giveaway.messageId) <= -1){
            const embed = embedCreator(blacklistMessages.giveawayNotFound)
            return message.reply({ embeds: [embed] });
        }

        const index = blacklist.blockedGiveaways.indexOf(giveaway.messageId)
        const newBlockedGiveaways = blacklist.blockedGiveaways
        newBlockedGiveaways.splice(index, 1)
        blacklist.blockedGiveaways = newBlockedGiveaways

        if(blacklist.giveawayAmount <= 0 && blacklist.blockedGiveaways.length === 0){
            await blacklist.remove()
        } else {
            await blacklist.save()
        }

        const embed = embedCreator(blacklistMessages.giveawayRemoved)
        return message.reply({ embeds: [embed] });

    } else if(args[0] === "list"){
        const blacklist = await userBlacklistModel.find({guildId: message.guildId}).sort({startAt: -1}).exec()

        if(!blacklist){
            const embed = embedCreator(blacklistMessages.emptyBlacklist)
            return message.reply({ embeds: [embed] });
        }
        if(!blacklist[0]){
            const embed = embedCreator(blacklistMessages.emptyBlacklist)
            return message.reply({ embeds: [embed] });
        }

        const activeBlacklist = blacklist.filter(u => u.giveawayAmount > 0)

        if(!activeBlacklist[0]){
            const embed = embedCreator(blacklistMessages.emptyBlacklist)
            return message.reply({ embeds: [embed] });
        }

        const embed = listBlacklistEmbedCreator(blacklistMessages.list, activeBlacklist)
        return message.reply({ embeds: [embed] });
    } else{
        return;
    }
}

module.exports = blacklistCommand;