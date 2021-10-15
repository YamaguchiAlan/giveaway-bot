const whitelistRoleModel = require("../models/whitelistRole.model")
const giveawayModel = require("../models/giveaway.model")
const embedCreator = require("../utils/embedCreator")
const listRolesEmbed = require("../utils/listRolesEmbedCreator")
const whitelistMessages = require("../messages/whitelistMessages.json")
const generalMessages = require("../messages/generalMessages.json")

const whitelistRoleCommand = async (message, args) => {
    if(args[0] === "role"){
        const query = args[1];

        const giveaway =
            await giveawayModel.findOne({prize: query, guildId: message.guildId}).sort({startAt: -1}).exec() ||
            await giveawayModel.findOne({messageId: query, guildId: message.guildId}).sort({startAt: -1}).exec() ;

        if (!giveaway) {
            const embed = embedCreator(generalMessages.unabledToFind, query)
            return message.reply({ embeds: [embed] });
        }

        if(!args[2]){
            const embed = embedCreator(whitelistMessages.emptyRole)
            return message.reply({ embeds: [embed] });
        }

        let roleName = "";
        for(let i = 2; i < args.length; i++){
            if(roleName !== ""){
                roleName += " "
            }
            roleName += args[i]
        }

        const exists = await whitelistRoleModel.exists({serverId: message.guildId, messageId: giveaway.messageId})
        let newWhitelistRole;

        if(exists){
            newWhitelistRole = await whitelistRoleModel.findOne({serverId: message.guildId, messageId: giveaway.messageId})
            if(newWhitelistRole.roles.includes(roleName)){
                const embed = embedCreator(whitelistMessages.roleAlreadyExists)
                return message.reply({ embeds: [embed] });
            } else {
                newWhitelistRole.roles.push(roleName)
            }
        } else{
            newWhitelistRole = await new whitelistRoleModel({
                serverId: message.guildId,
                messageId: giveaway.messageId,
                roles: [roleName]
            })
        }

        await newWhitelistRole.save()

        const embed = embedCreator(whitelistMessages.addedToWhitelist)
        return message.reply({ embeds: [embed] });
    } else if(args[0] === "remove"){
        const query = args[1];

        const giveaway =
            await giveawayModel.findOne({prize: query, guildId: message.guildId}).sort({startAt: -1}).exec() ||
            await giveawayModel.findOne({messageId: query, guildId: message.guildId}).sort({startAt: -1}).exec() ;

        if (!giveaway) {
            const embed = embedCreator(generalMessages.unabledToFind, query)
            return message.reply({ embeds: [embed] });
        }

        if(!args[2]){
            const embed = embedCreator(whitelistMessages.emptyRole)
            return message.reply({ embeds: [embed] });
        }

        let roleName = "";
        for(let i = 2; i < args.length; i++){
            if(roleName !== ""){
                roleName += " "
            }
            roleName += args[i]
        }

        const whitelist = await whitelistRoleModel.findOne({serverId: message.guildId, roles: roleName, messageId: giveaway.messageId})
        if(!whitelist){
            const embed = embedCreator(whitelistMessages.roleNotExists)
            return message.reply({ embeds: [embed] });
        }

        const index = whitelist.roles.indexOf(roleName)
        const newRoles = whitelist.roles
        newRoles.splice(index, 1)
        whitelist.roles = newRoles

        await whitelist.save()
        const embed = embedCreator(whitelistMessages.removedFromWhitelist)
        return message.reply({ embeds: [embed] });
    } else if(args[0] === "list"){
        const query = args[1];

        const giveaway =
            await giveawayModel.findOne({prize: query, guildId: message.guildId}).sort({startAt: -1}).exec() ||
            await giveawayModel.findOne({messageId: query, guildId: message.guildId}).sort({startAt: -1}).exec() ;

        if (!giveaway) {
            const embed = embedCreator(generalMessages.unabledToFind, query)
            return message.reply({ embeds: [embed] });
        }

        const whitelist = await whitelistRoleModel.findOne({serverId: message.guildId, messageId: giveaway.messageId})

        if(!whitelist){
            const embed = embedCreator(whitelistMessages.noRolesYet)
            return message.reply({ embeds: [embed] });
        }
        if(!whitelist.roles[0]){
            const embed = embedCreator(whitelistMessages.noRolesYet)
            return message.reply({ embeds: [embed] });
        }

        const embed = listRolesEmbed(whitelistMessages.listWhitelist, whitelist.roles)
        return message.reply({ embeds: [embed] });
    } else{
        return;
    }
}

module.exports = whitelistRoleCommand