const { SlashCommandBuilder } = require('@discordjs/builders');
const { GuildMember} = require('discord.js');
var validator = require('validator');
const embeds = require('../utils/embeds.js');
const { maxSongs } = require('../config.json');
const {Track} = require('../dist/lib/serverQueue');
const fetchP = import('node-fetch').then(mod => mod.default);
const fetch = (...args) => fetchP.then(fn => fn(...args));
const { clientId } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Añade una canción al inicio de la cola')
		.addStringOption(option => 
            option.setName('canción')
                .setDescription('Lo que quieres buscar')
                .setRequired(true)),
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
				Adding query to serverQueue
			*/
			console.log('Running command /add');
			let query = interaction.options.getString('canción');
			query.trim();
			//We only want this command to handle single songs.
			if (validator.isURL(query)) return await interaction.reply({content: '¡Este comando no acepta enlaces!', ethereal: true});

			if (serverQueue.queue.length < maxSongs + 1) {
				let track = createTrack(query,interaction);
				serverQueue.queue.unshift(track);

				const embed = embeds.generic(`${query} ha sido añadida a la cola.`);
				return await interaction.reply({embeds: [embed]});
			  } else {
				return await interaction.reply({content: `¡Sólo puede haber hasta ${config.maxSongs} canciones en la cola!`, ethereal: true});
			  }
		} else {
			return await interaction.reply({content: '¡Nada tocando en el servidor!', ethereal: true});
		}
	},
};

function createTrack(string, interaction){
	const track = Track.from(string,{
		onStart(song) {
			const embed = embeds.songsPlay(song);
			interaction.channel.send({embeds: [embed]}).catch(console.warn);
		},
		onFinish(){
			//Delete original message after song ends to keep text channel clean.
			fetch(
				`https://discordapp.com/api/webhooks/${clientId}/${interaction.token}/messages/@original`, 
				{ method: "DELETE" }
				).catch(console.warn);
		},
		onError(error) {
			console.warn(error);
			interaction.followUp({ content: `Error: ${error.message}`, ephemeral: true }).catch(console.warn);
		}
	});
	return track;
}