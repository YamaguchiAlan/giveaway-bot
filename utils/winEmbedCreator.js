const winMessage = require("../messages/winMessage.json")
const timestampParser = require("./timestampParser")

const winEmbed = ({entrants, prize, winners}) => {
    const embed = timestampParser(winMessage);

    if(embed.title?.includes("{entrants}")){
        embed.title = embed.title.split("{entrants}").join(entrants);
    }
    if(embed.title?.includes("{prize}")){
        embed.title = embed.title.split("{prize}").join(prize);
    }
    if(embed.title?.includes("{winners}")){
        embed.title = embed.title.split("{winners}").join(winners.map((member) => "`" + member.user.username + "`").join(', '));
    }

    if(embed.description?.includes("{entrants}")){
        embed.description= embed.description.split("{entrants}").join(entrants);
    }
    if(embed.description?.includes("{prize}")){
        embed.description= embed.description.split("{prize}").join(prize);
    }
    if(embed.description?.includes("{winners}")){
        embed.description= embed.description.split("{winners}").join(winners.map((member) => "`" + member.user.username + "`").join(', '));
    }

    return embed;
}

module.exports = winEmbed