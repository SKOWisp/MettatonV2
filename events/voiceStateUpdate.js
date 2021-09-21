const embeds = require('../utils/embeds.js');
const { tolerance } = require('../config.json');

module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    async execute(oldMember, _) {
        const { QUEUE } = require('../index');
        const serverQueue = QUEUE.get(oldMember.guild.id);
        if (!serverQueue) return;

        const voiceChannelId = serverQueue.voiceConnection.joinConfig.channelId;
        const voiceChannel = oldMember.guild.channels.cache.get(voiceChannelId);
        
        let currMemNum = voiceChannel.members.size;
        
        if(currMemNum < serverQueue.prevMembers){
            let users = false;
            for (const member of voiceChannel.members.values()){
                if (member.user.bot === false) {
                    users = true;
                    break;
                }
            }

            if (!users){
                console.log('Count down started');
                serverQueue.onCountDown = true;
                serverQueue.timeoutID = setTimeout(
                    disconnectBot, 
                    1000 * 60 * tolerance,
                    oldMember.guild.id);
            }
        } else if (currMemNum > serverQueue.prevMembers && serverQueue.onCountDown){
            console.log("Count down stopped...")
            serverQueue.onCountDown = false;
            clearTimeout(serverQueue.timeoutID)
            serverQueue.timeoutID = null;
        }

        serverQueue.prevMembers = currMemNum;
    }
}

function disconnectBot(guildId){
    const { QUEUE } = require('../index');
    const serverQueue = QUEUE.get(guildId);
    serverQueue.voiceConnection.destroy();
    const embed = embeds.generic('¡Nos vemos!');
    serverQueue.textChannel.send({embeds: [embed]}).catch(err => console.warn(err));
    QUEUE.delete(guildId);
}