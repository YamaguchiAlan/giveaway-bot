const {model, Schema} = require("mongoose")

const userBlacklistSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    giveawayAmount: {
        type: Number,
        required: true,
        default: 0
    },
    serverId: {
        type: String,
        required: true
    },
    blockedGiveaways: [String]
})

module.exports = model("userBlacklist", userBlacklistSchema)