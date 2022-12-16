var validator = require('validator');
var URL = require('url-parse');
const embeds = require('./embeds.js');

const fetch = require('isomorphic-unfetch')
const { getTracks } = require('spotify-url-info')(fetch)
// const { getData, getPreview, getTracks, getDetails } = require('spotify-url-info')(fetch)

const ytdl = require('ytdl-core');
const ytpl = require('ytpl');

const options = {
    require_host: true,
    host_whitelist: ['youtu.be','www.youtube.com', 'open.spotify.com']
}

const ytHostnames = ['youtu.be','www.youtube.com']

async function handleUrls(url){ //Handles urls and retruns array with titles + authors. Returns Discord embed on error.
    if (validator.isURL(url,options)){
        let parsed = new URL(url);
        let hostname = parsed.hostname;

        if(matches(hostname,ytHostnames)){ //Handles YouTube playlists and videos
            let pathname = parsed.pathname;
            if (pathname === '/watch') {
                let track = await ytdl.getBasicInfo(url)
                    .then(data => {
                        let title = data.videoDetails.title;
                        let author = data.videoDetails.author.name;
                        return [title + " " + author];
                    })
                    .catch(() => {
                        return embeds.generic('No se puede accesar a ese enlace.');
                    });
                return track;
            } else if(pathname === '/playlist'){
                let tracks = await ytpl(url)
                    .then(data => {
                        let titles = data.items.map(track =>{
                            return track.title + " " + track.author.name;
                        });
                        return titles;
                    })
                    .catch(() => {
                        return embeds.generic('No se puede accesar a ese enlace.');
                    });
                return tracks;
            } else{
                return embeds.generic('El enlace de youtube parece defectuoso. Intenta con otro.')
            }
        } else { // Handles Spotify playlists and tracks
            // If shit breaks, it's probably got something to do with spotify-url-info
            let tracks = await getTracks(url)
                .then(data => {
                    let titles = data.map(track => {
                        return track.title + " " + track.subtitle;
                    });
                    return titles;
                })
                .catch((err) => {
                    console.error(err);
                    return embeds.generic('Algo salió mal al buscar las canciones de Spotify. Prueba otro enlace.');
                });

            return tracks;
        }
        
    } else if (validator.isURL(url)){
        return embeds.generic('Aún no manejo esa pagína :(');
    } else {
        //No url = no need to get extra data
        url = [url]
        return url;
    }
}

function matches(query,array){
    for (let i = 0; i<array.length;i++){
        let element = array[i];
        if (query === element){
            return true;
        }
    }
    return false;
}

module.exports= {handleUrls};
