const { AudioPlayerStatus } = require('@discordjs/voice');
const { GuildMember, MessageEmbed} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pausa o resume al bot'),
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
				Pausing/Resuming the bot
			*/
			console.log('Running command /pause');
            if (serverQueue.audioPlayer.state.status !== AudioPlayerStatus.Paused){
                serverQueue.audioPlayer.pause();
                const embed = new MessageEmbed()
                    .setColor("fc4148")
                    .setDescription("Pausado - Utiliza /pausa otra vez para resumir");
                return await interaction.reply({embeds: [embed]});
            } else{
                const embed = new MessageEmbed()
                    .setColor("d2fddf")
                    .setDescription("Ha resumido la música :D")
                serverQueue.audioPlayer.unpause();
                return await interaction.reply({embeds: [embed]});
            }     
		} else {
			return await interaction.reply({content: '¡Nada tocando en el servidor!', ethereal: true});
		}
	},
};