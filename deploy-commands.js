/*
    Run This file after adding or editing commands.
*/

const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId } = require('./config.json');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}


	
const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

(async () => {
	try {
		await rest.put(
            // Deploys global commands if application has applications.commands scope authorized.
            Routes.applicationCommands(clientId),
            { body: commands },
			);

			//Routes.applicationGuildCommands(clientId, guildId),
			//{ body: commands },);


		console.log('Successfully registered application commands.');
	}
	catch (error) {
		console.error(error);
	}
})();