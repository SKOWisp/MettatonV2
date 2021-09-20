const embeds = require('../utils/embeds.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildMember} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Finaliza la conexión'),
	async execute(interaction) {
		let serverQueue = interaction.client.queue.get(interaction.guildId);
		if (serverQueue){
			//Check that user is GuildMember and is connected to same vc as bot.
			if(
			!interaction.member instanceof GuildMember || 
			!(interaction.member.voice.channel.id === serverQueue.voiceConnection.joinConfig.channelId)){
				return await interaction.reply({content: '¡Conéctate a la sala de voz donde estoy!', ethereal: true});
			}
			/*
				Destroying connection
			*/
			serverQueue.voiceConnection.destroy();
            interaction.client.queue.delete(interaction.guildId);
            const embed = embeds.generic('¡Nos vemos!')
            return await interaction.reply({embeds: [embed]});
                
		} else {
			return await interaction.reply({content: '¡Nada tocando en el servidor!', ethereal: true});
		}
	},
};