const {model, Schema} = require("mongoose")

const bonusEntriesSchema = new Schema({
    serverId: {
        type: String,
        required: true
    },
    messageId: {
        type: String,
        required: true
    },
    bonusEntries: [
        {
            _id : false,
            role: String,
            entries: Number
        }
    ]
})

module.exports = model("bonusEntries", bonusEntriesSchema)