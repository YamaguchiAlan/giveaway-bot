const whitelistRoleModel = require("../models/whitelistRole.model")
const embedCreator = require("../utils/embedCreator")
const whitelistMessages = require("../messages/whitelistMessages.json")

const whitelistRoleCommand = async (message, args, client) => {
    if(args[0] === "role"){
        const newWhitelistRole = await new whitelistRoleModel({
            serverId: message.guildId,
            roles: [args[1]]
        })
        await newWhitelistRole.save()

        const embed = embedCreator(whitelistMessages.addedToWhitelist)
        return message.reply({ embeds: [embed] });
    } else{
        return;
    }
}

module.exports = whitelistRoleCommand