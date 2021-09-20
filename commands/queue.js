const { GuildMember, MessageEmbed} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Muestra la cola... :O'),
	async execute(interaction) {
		let serverQueue = interaction.client.queue.get(interaction.guildId);
		if (serverQueue){
			//Check that user is GuildMember
			if(!interaction.member instanceof GuildMember){
				return await interaction.reply({content: 'Me parece que eres el impostor...', ethereal: true});
			}
			/*
				Printing queue
			*/
            console.log('Running command /queue');
            let i = 0;
            let titles = serverQueue.queue.map(track => {
                i++;
                return i + ".- " + track.title;
                });

            let description = titles.slice(0,50).join("\n");
            if (serverQueue.queue.length > 50) {
                const difference = serverQueue.queue.length - 50;
                description = description + `\n y ${difference} cancion(es) más.`
            }

            const embed = new MessageEmbed()
                .setColor("29d1ea")
                .setTitle("Canciones en cola: ")
                .setDescription(description);

            return await interaction.reply({embeds: [embed]});
		} else {
            const embed = new MessageEmbed()
                .setColor("29d1ea")
                .setDescription("No hay nada en cola. Usa /play para agregar más canciones.");
			return await interaction.reply({embeds: [embed], ethereal: true});
		}
	},
};