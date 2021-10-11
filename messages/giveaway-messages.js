const config = require('../config.json');

module.exports = {
    giveaway: (config.everyoneMention ? "@everyone\n\n" : "")+"🎉🎉 **GIVEAWAY** 🎉🎉",
    giveawayEnded: (config.everyoneMention ? "@everyone\n\n" : "")+"🎉🎉 **GIVEAWAY ENDED** 🎉🎉",
    inviteToParticipate: "React with 🎉 to participate!",
    dropMessage: "Be the first to react with 🎉 !",
    drawing: 'Drawing: {timestamp}',
    winMessage: {}, // DONT CHANGE "winMessage" here, go to "winMessage.json"
    embedFooter: "Giveaways",
    noWinner: "Giveaway cancelled, no valid participants.",
    hostedBy: "Hosted by: {this.hostedBy}",
    winners: "winner(s)",
    endedAt: "Ended at"
};