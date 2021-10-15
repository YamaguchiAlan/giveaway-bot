const timestampParser = require("./timestampParser")
const _ = require("lodash")

const listEntryEmbedCreator = (message, entries) => {
    const embed = timestampParser(message)

    if(!embed.fields){
        return embed;
    }

    const fields = entries.map(e => {
        let field = _.cloneDeep(embed.fields)

        if(field.name?.includes("{role}")){
            field.name = field.name.split("{role}").join(e.role);
        }
        if(field.name?.includes("{entries}")){
            field.name = field.name.split("{entries}").join(e.entries);
        }

        if(field.value?.includes("{role}")){
            field.value= field.value.split("{role}").join(e.role);
        }
        if(field.value?.includes("{entries}")){
            field.value= field.value.split("{entries}").join(e.entries);
        }
        return field;
    })

    embed.fields = fields

    return embed;
}

module.exports = listEntryEmbedCreator