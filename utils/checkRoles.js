const checkRoles = (message, client) => {
    const roles = client.config.roles
    let authorized = false;

    roles.forEach(e => {
        if(message.member.roles.cache.some(role => role.name === e)){
            authorized = true;
        }
    })

    return authorized;
}

module.exports = checkRoles