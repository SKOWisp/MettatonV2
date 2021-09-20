const ytsr = require('ytsr');
const { searchLimit } = require('../config.json');

const options = {
    limit: searchLimit
};

async function getSong(query){ //Uses ytsr to get a YouTube video link. Returns null on error
    let youtubeSearch = await ytsr(query, options)
      .catch(err => {
        console.log(err);
        return null;
      });
    
    if (youtubeSearch.items[0] === undefined || youtubeSearch === null){
      return null;
    }
    
    let youtubeResult;
    for (let i = 0; i < options.limit; i++) {
      if (youtubeSearch.items[i].type === 'video'){
        youtubeResult = youtubeSearch.items[i];
        break;
      }
    }
    return youtubeResult;
}


// Shuffles array in place.
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }  return a;
}

module.exports = {getSong, shuffle}