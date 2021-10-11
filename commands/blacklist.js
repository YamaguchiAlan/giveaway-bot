const userBlacklistModel = require("../models/userBlacklist.model")
const embedCreator = require("../utils/embedCreator")
const blacklistMessages = require("../messages/blacklistMessages.json")

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
                serverId: message.guildId,
                giveawayAmount: args[2]
            })
        }

        await newUserBlacklist.save()

        const embed = embedCreator(blacklistMessages.addedToBlacklist)
        return message.reply({ embeds: [embed] });
    } else{
        return;
    }
}

module.exports = blacklistCommand;