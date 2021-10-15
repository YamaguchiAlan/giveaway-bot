const timestampParser = require("./timestampParser")

const listRoleEmbedCreator = (message, roles) => {
    const embed = timestampParser(message)

    let newDescription = "";

    if(!embed.description){
        return embed;
    }

    roles.forEach(role => {
        let description = embed.description;

        if(description?.includes("{role}")){
            description = description.split("{role}").join(role);
        }
        newDescription += description;
    })

    embed.description = newDescription

    return embed;
}

module.exports = listRoleEmbedCreator