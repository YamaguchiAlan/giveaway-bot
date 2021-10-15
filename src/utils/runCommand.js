const embedCreator = require("./embedCreator")
const generalMessages = require("../messages/generalMessages.json")

const runCommand = (message, client, command) => {
    const roles = client.config.roles
    let authorized = false;

    roles.forEach(e => {
        if(message.member.roles.cache.some(role => role.name === e)){
            authorized = true;
        }
    })

    if(authorized){
        command()
    } else{
        const embed = embedCreator(generalMessages.roleUnauthorized)
        return message.reply({ embeds: [embed] });
    }
}

module.exports = runCommand