const { GuildMember} = require('discord.js');
const embeds = require('../utils/embeds.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('next')
		.setDescription('Salta canciones de la cola.')
		.addStringOption(option => 
            option.setName('saltos')
                .setDescription('El # de canción a saltar.')
                .setRequired(false)),
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
				Skipping songs
			*/
			console.log('Running command /next');
			let skipsX = interaction.options.getString('saltos');
            let skips = parseInt(skipsX,10);
            // Skips will be null if nothing is entered.
            if (skipsX === null || skips === Number.NaN) {
                serverQueue.audioPlayer.stop();
                const embed = embeds.generic('Saltando 1 cancion(es).');
                return await interaction.reply({embeds: [embed]});
            }
            
            if (skips <= 0 || skips > serverQueue.queue.length){
                return await interaction.reply({content: 'Algo hiciste mal...', ethereal: true});
            }
            
            const newArray = serverQueue.queue.slice(skips - 1);
			serverQueue.queue = newArray;
            serverQueue.audioPlayer.stop();
            const embed = embeds.generic(`Saltando ${skips} cancion(es).`);
            return await interaction.reply({embeds: [embed]});
		} else {
			return await interaction.reply({content: '¡Nada tocando en el servidor!', ethereal: true});
		}
	},
};