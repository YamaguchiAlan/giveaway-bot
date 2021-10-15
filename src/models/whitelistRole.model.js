const {model, Schema} = require("mongoose")

const whitelistRoleSchema = new Schema({
    serverId: {
        type: String,
        required: true
    },
    messageId: {
        type: String,
        required: true
    },
    roles: [String]
})

module.exports = model("whitelistRole", whitelistRoleSchema)