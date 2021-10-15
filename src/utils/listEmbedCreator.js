const timestampParser = require("./timestampParser")
const _ = require("lodash")

const listEmbedCreator = (message, giveaways) => {
    const embed = timestampParser(message)

    if(!embed.fields){
        return embed;
    }

    const fields = giveaways.map(g => {
        let field = _.cloneDeep(embed.fields)

        if(field.name?.includes("{prize}")){
            field.name = field.name.split("{prize}").join(g.prize);
        }
        if(field.name?.includes("{endAt}")){
            field.name = field.name.split("{endAt}").join(g.ended ? "`ended`" : `<t:${Math.round(g.endAt / 1000)}:R>`);
        }

        if(field.value?.includes("{prize}")){
            field.value= field.value.split("{prize}").join(g.prize);
        }
        if(field.value?.includes("{endAt}")){
            field.value= field.value.split("{endAt}").join(g.ended ? "`ended`" : `<t:${Math.round(g.endAt / 1000)}:R>`);
        }
        return field;
    })

    embed.fields = fields

    return embed;
}

module.exports = listEmbedCreator