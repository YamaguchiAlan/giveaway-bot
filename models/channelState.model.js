const {model, Schema} = require("mongoose")

const channelStateSchema = new Schema({
    channelId: {type: String, required: true},
    channelStatus: {type: Number, required: true},
    channelStatusString: {type: String, required: true},
    giveaway: {
        channel: {type: String},
        channelName: {type: String},
        duration: {type: String},
        winnerCount: {type: Number},
        author: {type: String}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

channelStateSchema.index({"createdAt": 1}, {expireAfterSeconds: 900})

module.exports = model("channelStates", channelStateSchema)