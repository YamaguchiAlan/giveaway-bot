const timestampParser = require("./timestampParser")
const ms = require("ms")

const viewTemplateEmbedCreator = (message, template) => {
    const embed = timestampParser(message)

    if(!embed.description){
        return embed;
    }

    if(embed.description?.includes("{templateName}")){
        embed.description = embed.description.split("{templateName}").join(template.name ? template.name : "None");
    }
    if(embed.description?.includes("{channel}")){
        embed.description = embed.description.split("{channel}").join(template.channel ? `<#${template.channel}>` : "None");
    }
    if(embed.description?.includes("{duration}")){
        embed.description = embed.description.split("{duration}").join(template.duration ? ms(template.duration) : "None");
    }
    if(embed.description?.includes("{winners}")){
        embed.description = embed.description.split("{winners}").join(template.winners ? template.winners : "None");
    }
    if(embed.description?.includes("{prize}")){
        embed.description = embed.description.split("{prize}").join(template.prize ? template.prize : "None");
    }
    if(embed.description?.includes("{role}")){
        embed.description = embed.description.split("{role}").join(template.role ? template.role : "None");
    }

    return embed;
}

module.exports = viewTemplateEmbedCreator