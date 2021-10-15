const checkBonusEntries = (bonusEntries) => {
    return new Function('member', `
                        const bonusEntries = [${bonusEntries}]
                        let entries = null;
                        bonusEntries.forEach(entry => {
                            if(member.roles.cache.some((r) => r.name === entry.role)){
                                if(entries === null){
                                    entries = entry.entries
                                } else{
                                    if(entries < entry.entries){
                                        entries = entry.entries
                                    }
                                }
                            }
                        })
                        return entries
                    `)
}

module.exports = checkBonusEntries