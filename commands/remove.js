const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildMember} = require('discord.js');
const embeds = require('../utils/embeds.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Quita una canción de la cola. Checa /queue')
		.addStringOption(option => 
            option.setName('canción')
                .setDescription('El nombre de la canción a quitar.')
                .setRequired(true)),
	async execute(interaction) {
		const { QUEUE } = require('../index')
		let serverQueue = QUEUE.get(interaction.guildId);
		if (serverQueue){
			//Check that user is GuildMember and is connected to same vc as bot.
			if(
			!interaction.member instanceof GuildMember || 
			!(interaction.member.voice.channel.id === serverQueue.voiceConnection.joinConfig.channelId)){
				return await interaction.reply({content: '¡Conéctate a la sala de voz donde estoy!', ephemeral: true});
			}
			/*
				Removing song from query
			*/
			console.log('Running command /remove');
			let query = interaction.options.getString('canción');
			query.trim();

            const prevQueueLength = serverQueue.queue.length;
            serverQueue.queue = serverQueue.queue.filter(item => item.title !== query);

			if (serverQueue.queue.length === prevQueueLength) {
				return await interaction.reply({content: `${query} no está en /queue. ¿Está bien escrito?`, ephemeral: true});	
			  } else {
				const embed = embeds.generic(`${query} ha sido removida de la cola.`);
				return await interaction.reply({embeds: [embed], ephemeral: true});
			  }
		} else {
			return await interaction.reply({content: '¡Nada tocando en el servidor!', ephemeral: true});
		}
	},
};
