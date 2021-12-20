const { GuildMember} = require('discord.js');
const embeds = require('../utils/embeds.js');
const utils =  require('../utils/utility.js')
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Mueve la cola... :O'),
	async execute(interaction) {
		const { QUEUE } = require('../index')
		let serverQueue = QUEUE.get(interaction.guildId);
		if (serverQueue){
			//Check that user is GuildMember
			if(!interaction.member instanceof GuildMember){
				return await interaction.reply({content: 'Me parece que eres el impostor...', ephemeral: true});
			}
			/*
				Shuffle songs
			*/
            console.log('Running command /shuffle');
            const trackArray = utils.shuffle(serverQueue.queue);
            serverQueue.queue = trackArray;
            
            const embed = embeds.generic('Se ha mezclado la cola.')
            return await interaction.reply({embeds: [embed]});
		} else {
            return await interaction.reply({content: '¡Nada tocando en el servidor!', ephemeral: true});
		}
	},
};