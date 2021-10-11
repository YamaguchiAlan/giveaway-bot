const _ = require("lodash")

const timestampParser = (message) => {
    const embed = _.cloneDeep(message)
    if(embed.timestamp){
        embed.timestamp = new Date().toISOString()
    } else{
        embed.timestamp = null
    }
    return embed;
}

module.exports = timestampParser