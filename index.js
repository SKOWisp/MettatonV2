const fs = require('fs'); 
const { Client, Collection, Intents } = require('discord.js');
require('dotenv').config();

// Create a new client instance
const client = new Client({ 
	intents: [
		Intents.FLAGS.GUILDS, 
		Intents.FLAGS.GUILD_VOICE_STATES, 
		Intents.FLAGS.GUILD_MESSAGES] 
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); //Reads files from commands folder
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js')); //Reads files from commands folder

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

var my_QUEUE = new Map();

// Login to Discord with client's token.
client.login(process.env.BOT_TOKEN);

module.exports = {
	QUEUE: my_QUEUE
}
