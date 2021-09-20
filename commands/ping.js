const { SlashCommandBuilder } = require('@discordjs/builders');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Muestra el ping del bot,'),
	async execute(interaction) {
		interaction.reply(`Websocket heartbeat: ${interaction.client.ws.ping}ms.`);
	},
};