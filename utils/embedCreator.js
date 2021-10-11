const timestampParser = require("./timestampParser")

const embedCreator = (message, prize) => {
    const embed = timestampParser(message)

    if(prize){
        if(embed.title?.includes("{prize}")){
            embed.title = embed.title.split("{prize}").join(prize);
        }
        if(embed.description?.includes("{prize}")){
            embed.description = embed.description.split("{prize}").join(prize);
        }
    }

    return embed;
}

module.exports = embedCreator