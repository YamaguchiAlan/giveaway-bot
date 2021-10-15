const {model, Schema} = require("mongoose")

const templateModel = new Schema({
    serverId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    channel: String,
    duration: Number,
    winners: Number,
    prize: String,
    role: String
})

module.exports = model("template", templateModel)