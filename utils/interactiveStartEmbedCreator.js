const timestampParser = require("./timestampParser")

const interactiveEmbedCreator = (message, giveaway) => {
    const embed = timestampParser(message)

    if(giveaway){
        if(embed.title?.includes("{channelName}")){
            embed.title = embed.title.split("{channelName}").join(giveaway.channelName ? giveaway.channelName : "");
        }
        if(embed.title?.includes("{duration}")){
            embed.title = embed.title.split("{duration}").join(giveaway.duration ? giveaway.duration : "");
        }
        if(embed.title?.includes("{winnerCount}")){
            embed.title = embed.title.split("{winnerCount}").join(giveaway.winnerCount ? giveaway.winnerCount : "");
        }

        if(embed.description?.includes("{channelName}")){
            embed.description = embed.description.split("{channelName}").join(giveaway.channelName ? giveaway.channelName : "");
        }
        if(embed.description?.includes("{duration}")){
            embed.description = embed.description.split("{duration}").join(giveaway.duration ? giveaway.duration : "");
        }
        if(embed.description?.includes("{winnerCount}")){
            embed.description = embed.description.split("{winnerCount}").join(giveaway.winnerCount ? giveaway.winnerCount : "");
        }
    }

    return embed;
}

module.exports = interactiveEmbedCreator