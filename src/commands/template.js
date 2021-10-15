const templateModel = require("../models/template.model")
const userBlacklistModel = require("../models/userBlacklist.model")
const whitelistRoleModel = require("../models/whitelistRole.model")
const giveawayMessages = require("../messages/giveaway-messages")
const embedCreator = require("../utils/embedCreator")
const templateMessages = require("../messages/templateMessages.json")
const startMessages = require("../messages/startMessages.json")
const listTemplatesEmbed = require("../utils/listTemplatesEmbedCreator")
const viewTemplateEmbed = require("../utils/viewTemplateEmbedCreator")
const ms = require("ms")
const _ = require("lodash")

const checkTemplateName = (args) => {
    let templateName = "";
    let argsIndex = 2;
    if(args[1].startsWith('"')){
        if(args[1].endsWith('"')){
            templateName = args[1].replace(/"/g,'');
        } else{
            for(let i = 1; i < args.length; i++){
                if(i === 1){
                    templateName = args[1].replace(/"/g,'');
                    if(i === args.length - 1){
                        templateName = ""
                        break;
                    }
                } else{
                    if(args[i].endsWith('"')){
                        templateName += " " + args[i].replace(/"/g,'');
                        argsIndex = i + 1;
                        break;
                    } else{
                        if(i === args.length - 1){
                            templateName = ""
                            break;
                        }
                    }
                    templateName += " " + args[i]
                }
            }
        }
    }

    return {templateName, argsIndex}
}

const getArguments = async (message, client, args, argsIndex) => {
    const newArgs = args.slice(argsIndex)
    let template = {}
    let currentOption = ""
    const availableOptions = ["name", "duration", "channel", "winners", "role"]
    const availableAbbreviateOption = ["n", "d", "c", "w", "r"]

    newArgs.forEach(a => {
        if(a.startsWith("--")){
            const option = a.replace(/-/g,'');
            if(availableOptions.includes(option)){
                currentOption = option
            }
        } else if(a.startsWith("-")){
            const option = a.replace(/-/g,'');

            if(availableAbbreviateOption.includes(option)){
                if(option === "n"){
                    currentOption = "name"
                }else if(option === "d"){
                    currentOption = "duration"
                }else if(option === "c"){
                    currentOption = "channel"
                }else if(option === "w"){
                    currentOption = "winners"
                }else if(option === "r"){
                    currentOption = "role"
                }
            }
        }else if(currentOption){
            if(currentOption === "name" || currentOption === "role"){
                let value = template[currentOption] || "";
                if(value !== ""){
                    value += " "
                }
                value += a
                template[currentOption] = value
            } else{
                template[currentOption] = a
                currentOption = ""
            }
        }
    })

    if(template.channel){
        let giveawayChannel;
        if(!template.channel.startsWith("<")){
            let checkGiveawayChannel;

            if(template.channel === "here" || template.channel === "Here"){
                checkGiveawayChannel = await client.channels.fetch(message.channelId)
            } else {
                const guild = await client.guilds.fetch(message.guildId)
                checkGiveawayChannel = guild.channels.cache.find(g => g.name === template.channel && g.type !== "GUILD_CATEGORY")
            }
            if(checkGiveawayChannel){
                giveawayChannel = checkGiveawayChannel;
            }else{
                const embed = embedCreator(startMessages.channelNotFound)
                message.reply({ embeds: [embed] });
                throw "Error"
            }
        } else{
            try{
                const checkGiveawayChannel = await client.channels.fetch(template.channel.replace(/\D/g, ""))
                giveawayChannel = checkGiveawayChannel;
            } catch(err){
                const embed = embedCreator(startMessages.channelNotFound)
                message.reply({ embeds: [embed] });
                throw "Error"
            }
        }

        if(!giveawayChannel.isText()) {
            const embed = embedCreator(startMessages.notTextBased)
            message.reply({ embeds: [embed] });
            throw "Error"
        }
        template.channel = giveawayChannel.id
    }

    if(template.duration){
        const giveawayDuration = ms(template.duration)
        if(!giveawayDuration) {
            const embed = embedCreator(startMessages.invalidDuration)
            message.reply({ embeds: [embed] });
            throw "Error"
        } else{
            template.duration = giveawayDuration
        }
    }

    if(template.winners){
        if(isNaN(parseInt(template.winners))) {
            const embed = embedCreator(startMessages.invalidWinnersCount)
            message.reply({ embeds: [embed] });
            throw "Error"
        } else{
            template.winners = parseInt(template.winners)
        }
    }

    return template;
}

const createTemplateCommands = async (message, client, args) => {
    if(args[0] === "create" && args[1]){
        const {templateName, argsIndex} = checkTemplateName(args)

        if(!templateName){
            const embed = embedCreator(templateMessages.noTemplateName)
            return message.reply({ embeds: [embed] });
        }

        const exists = await templateModel.exists({serverId: message.guildId, name: templateName})
        if(exists){
            const embed = embedCreator(templateMessages.templateAlreadyExists)
            return message.reply({ embeds: [embed] });
        }

        let template;
        if(args[argsIndex]){
            try{
                template = await getArguments(message, client, args, argsIndex)
            } catch(err){
                return;
            }
        }

        if(_.isEmpty(template)){
            const embed = embedCreator(templateMessages.noOptionsCreate)
            return message.reply({ embeds: [embed] });
        }

        const newTemplate = await new templateModel({
            serverId: message.guildId,
            name: templateName,
            channel: template.channel,
            duration: template.duration,
            winners: template.winners,
            prize: template.name,
            role: template.role
        })

        await newTemplate.save()

        const embed = embedCreator(templateMessages.created)
        return message.reply({ embeds: [embed] });

    } else if(args[0] === "start" && args[1]){
        const {templateName, argsIndex} = checkTemplateName(args)

        if(!templateName){
            const embed = embedCreator(templateMessages.noTemplateName)
            return message.reply({ embeds: [embed] });
        }

        let newArguments;
        if(args[argsIndex]){
            try{
                newArguments = await getArguments(message, client, args, argsIndex)
            } catch(err){
                return;
            }
        }

        const template = await templateModel.findOne({serverId: message.guildId, name: templateName})

        if(!template){
            const embed = embedCreator(templateMessages.templateNotFound)
            return message.reply({ embeds: [embed] });
        }

        const giveawayValues = {
            channel: newArguments?.channel || template?.channel,
            duration: newArguments?.duration || template?.duration,
            prize: newArguments?.name || template?.prize,
            winners: newArguments?.winners || template?.winners,
            role: newArguments?.role || template?.role
        }

        if(!giveawayValues.channel){
            const embed = embedCreator(templateMessages.channelMising)
            return message.reply({ embeds: [embed] });
        }
        if(!giveawayValues.duration){
            const embed = embedCreator(templateMessages.durationMising)
            return message.reply({ embeds: [embed] });
        }
        if(!giveawayValues.prize){
            const embed = embedCreator(templateMessages.nameMising)
            return message.reply({ embeds: [embed] });
        }
        if(!giveawayValues.winners){
            const embed = embedCreator(templateMessages.winnersMising)
            return message.reply({ embeds: [embed] });
        }

        const giveawayChannel = await client.channels.fetch(giveawayValues.channel)

        client.giveawaysManager.start(giveawayChannel, {
            duration: giveawayValues.duration,
            prize: giveawayValues.prize,
            winnerCount: giveawayValues.winners,
            hostedBy: client.config.hostedBy ? message.author : null,
            messages: giveawayMessages
        })
        .then(async gData => {
            const blockedUsers = await userBlacklistModel.find({serverId: message.guildId})
            if(blockedUsers[0]){
                await Promise.all(blockedUsers.map(async user => {
                    if(user.giveawayAmount > 0){
                        user.blockedGiveaways.push(gData.messageId)
                        user.giveawayAmount = user.giveawayAmount - 1
                        await user.save()
                    }
                }))
            }

            if(giveawayValues.role){
                const newWhitelistRole = await new whitelistRoleModel({
                    serverId: message.guildId,
                    messageId: gData.messageId,
                    roles: [giveawayValues.role]
                })

                await newWhitelistRole.save()
            }
        })
    } else if(args[0] === "edit" && args[1]){
        const {templateName, argsIndex} = checkTemplateName(args)

        if(!templateName){
            const embed = embedCreator(templateMessages.noTemplateName)
            return message.reply({ embeds: [embed] });
        }

        const template = await templateModel.findOne({serverId: message.guildId, name: templateName})

        if(!template){
            const embed = embedCreator(templateMessages.templateNotFound)
            return message.reply({ embeds: [embed] });
        }

        let newArguments;
        if(args[argsIndex]){
            try{
                newArguments = await getArguments(message, client, args, argsIndex)
            } catch(err){
                return;
            }
        }

        if(_.isEmpty(newArguments)){
            const embed = embedCreator(templateMessages.noOptionsEdit)
            return message.reply({ embeds: [embed] });
        }

        const giveawayValues = {
            channel: newArguments?.channel || template?.channel,
            duration: newArguments?.duration || template?.duration,
            prize: newArguments?.name || template?.prize,
            winners: newArguments?.winners || template?.winners,
            role: newArguments?.role || template?.role
        }

        if(giveawayValues.channel){
            template.channel = giveawayValues.channel
        }
        if(giveawayValues.duration){
            template.duration = giveawayValues.duration
        }
        if(giveawayValues.prize){
            template.prize = giveawayValues.prize
        }
        if(giveawayValues.winners){
            template.winners = giveawayValues.winners
        }
        if(giveawayValues.role){
            template.role = giveawayValues.role
        }
        await template.save()

        const embed = embedCreator(templateMessages.edited)
        return message.reply({ embeds: [embed] });
    } else if(args[0] === "remove" && args[1]){
        const {templateName, argsIndex} = checkTemplateName(args)

        if(!templateName){
            const embed = embedCreator(templateMessages.noTemplateName)
            return message.reply({ embeds: [embed] });
        }

        const template = await templateModel.findOne({serverId: message.guildId, name: templateName})

        if(!template){
            const embed = embedCreator(templateMessages.templateNotFound)
            return message.reply({ embeds: [embed] });
        }

        await template.remove()

        const embed = embedCreator(templateMessages.removed)
        return message.reply({ embeds: [embed] });
    } else if(args[0] === "list"){
        const templates = await templateModel.find({serverId: message.guildId})

        if(!templates[0]){
            const embed = embedCreator(templateMessages.noTemplatesYet)
            return message.reply({ embeds: [embed] });
        }

        const embed = listTemplatesEmbed(templateMessages.list, templates)
        return message.reply({ embeds: [embed] });
    } else if(args[0] === "view" && args[1]){
        const {templateName, argsIndex} = checkTemplateName(args)

        if(!templateName){
            const embed = embedCreator(templateMessages.noTemplateName)
            return message.reply({ embeds: [embed] });
        }

        const template = await templateModel.findOne({serverId: message.guildId, name: templateName})

        if(!template){
            const embed = embedCreator(templateMessages.templateNotFound)
            return message.reply({ embeds: [embed] });
        }

        const embed = viewTemplateEmbed(templateMessages.viewTemplate, template)
        return message.reply({ embeds: [embed] });
    } else{
        return;
    }
}

module.exports = createTemplateCommands