const {
	entersState,
	joinVoiceChannel,
	VoiceConnectionStatus,
} = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { handleUrls } = require('../utils/url-handler.js');
const embeds = require('../utils/embeds.js');
const { GuildMember} = require('discord.js');
const {ServerQueue,Track} = require('../dist/lib/serverQueue');
const { clientId } = require('../config.json');
const fetchP = import('node-fetch').then(mod => mod.default);
const fetch = (...args) => fetchP.then(fn => fn(...args));


module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Busca la canción y la añade a la cola')
        .addStringOption(option => 
            option.setName('canción')
                .setDescription('Lo que quieres buscar (palabras o enlace)')
                .setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();
        // Return if member isn't connected to voice
        if (!interaction.member instanceof GuildMember || !interaction.member.voice.channel){
            const embed = embeds.generic("¡Conéctate a una sala de voz!")
            return await interaction.followUp({embeds: [embed], ephemeral: true});
        }

        let serverQueue = interaction.client.queue.get(interaction.guildId);

        let query = interaction.options.getString('canción');
        query.trim();

        let tracks = await handleUrls(query);

		if (!Array.isArray(tracks)) {
            return await interaction.followUp({embeds: [tracks], ephemeral: true});
        } 
        
        if (serverQueue) {
            const trackArray = createTrackArray(tracks,interaction);
            serverQueue.enqueue(trackArray);
            const embed = embeds.songsAdd(tracks);
            return await interaction.followUp({embeds: [embed], ephemeral: true});
        }
        
        const channel = interaction.member.voice.channel;

        //Create a new server queue object
        serverQueue = new ServerQueue(
            joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: true
            }),
        );

        serverQueue.voiceConnection.on('error', console.warn);
        interaction.client.queue.set(interaction.guildId,serverQueue);

        // Make sure the connection is ready before processing the user's request
		try {
			await entersState(serverQueue.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
		} catch (error) {
			console.warn(error);
			await interaction.followUp({content: 'Failed to join voice channel within 20 seconds, please try again later!', ephemeral: true});
			return;
		}

        try {
            const trackArray = createTrackArray(tracks,interaction);
			// Enqueue the track(s) and reply a success message to the user
			serverQueue.enqueue(trackArray);
            const embed = embeds.songsAdd(tracks);
			await interaction.followUp({embeds: [embed], ephemeral: true});
		} catch (error) {
			console.log(error);
			await interaction.editReply('Failed to play track, please try again later!');
		}
	},
};

function createTrackArray(tracks, interaction){
    let newArray = [];
    for (let i = 0; i < tracks.length; i++) {
        const track = Track.from(tracks[i],{
            onStart(song) {
                const embed = embeds.songsPlay(song);
                interaction.editReply({embeds: [embed], ephemeral: false}).catch(console.warn);
            },
            onFinish(){
                //Delete original message after song ends to keep text channel clean.
                //fetch(
                //    `https://discordapp.com/api/webhooks/${clientId}/${interaction.token}/messages/@original`, 
                //    { method: "DELETE" }
                //    ).catch(console.warn);
            },
            onError(error) {
                console.warn(error);
                interaction.followUp({ content: `Error: ${error.message}`, ephemeral: true }).catch(console.warn);
            }
        })
        newArray.push(track);
    }
    return newArray;
}
