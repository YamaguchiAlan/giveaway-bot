const timestampParser = require("./timestampParser")
const _ = require("lodash")

const listBlacklistEmbedCreator = (message, blacklist) => {
    const embed = timestampParser(message)

    if(!embed.fields){
        return embed;
    }

    const fields = blacklist.map(u => {
        let field = _.cloneDeep(embed.fields)

        if(field.name?.includes("{username}")){
            field.name = field.name.split("{username}").join(u.userName);
        }
        if(field.name?.includes("{block}")){
            field.name = field.name.split("{block}").join(u.giveawayAmount);
        }

        if(field.value?.includes("{username}")){
            field.value= field.value.split("{username}").join(u.userName);
        }
        if(field.value?.includes("{block}")){
            field.value= field.value.split("{block}").join(u.giveawayAmount);
        }
        return field;
    })

    embed.fields = fields

    return embed;
}

module.exports = listBlacklistEmbedCreator