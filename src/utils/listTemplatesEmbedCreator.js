const timestampParser = require("./timestampParser")

const listTemplatesEmbedCreator = (message, templates) => {
    const embed = timestampParser(message)

    let newDescription = "";

    if(!embed.description){
        return embed;
    }

    templates.forEach(t => {
        let description = embed.description;

        if(description?.includes("{templateName}")){
            description = description.split("{templateName}").join(t.name);
        }
        newDescription += description;
    })

    embed.description = newDescription

    return embed;
}

module.exports = listTemplatesEmbedCreator