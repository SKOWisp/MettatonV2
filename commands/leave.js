const embeds = require('../utils/embeds.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildMember} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Finaliza la conexión'),
	async execute(interaction) {
		const { QUEUE } = require('../index')
		let serverQueue = QUEUE.get(interaction.guildId);
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
			try{
				console.log('Running command /leave')
				serverQueue.voiceConnection.destroy();
            	const embed = embeds.generic('¡Nos vemos!');
            	await interaction.reply({embeds: [embed]});
			} catch (err){
				console.log(err);
			}
			
			QUEUE.delete(interaction.guildId);
                
		} else {
			return await interaction.reply({content: '¡Nada tocando en el servidor!', ethereal: true});
		}
	},
};