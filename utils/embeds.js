const { MessageEmbed } = require('discord.js');

module.exports = {
    songsAdd : function(songs) {
        const embed = new MessageEmbed()
        .setColor("C2D3E0")
        .setDescription(`Ahora hay ${songs.length} cancion(es) en la cola`);

        return embed;
    },
    songsPlay : function(song) {
        const embed = new MessageEmbed()
        .setColor("C2D3E0")
        .setAuthor(`${song.author}`,`${song.avatar}`,`${song.authorUrl}`)
        .setThumbnail(`${song.thumbnail}`)
        .setDescription(`[${song.title}](${song.url})`);

        return embed;
    },
    generic : function(string){
        const embed = new MessageEmbed()
        .setColor("eef0f4")
        .setDescription(`${string}`);

        return embed;
    }
}