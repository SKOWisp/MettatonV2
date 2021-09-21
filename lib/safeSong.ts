import ytsr from "ytsr";
import { config } from 'dotenv';
import { SongData } from "./serverQueue";
config();

const searchLimit = Number(process.env.SEARCH_LIMIT);
const options = {
    maxRetries: 4,
    maxReconnects: 2,
}
export async function safeSong(query: string): Promise<SongData | null>{ 
    let ytData = await ytsr(query, {limit: searchLimit, requestOptions: {options}}).catch((err) => console.warn(err));

    // ytsr will return null when unable to find data.
    if (ytData === null) return null;
    
    let ytVideo: any = null;
    for (let i = 0; i < searchLimit; i++) {
      if (ytData!.items[i].type === 'video'){
        ytVideo = ytData!.items[i];
        break;
      }
    }

    // Somehow none of the results is of type video....
    if (ytVideo === null) return null;

    return new SongData(ytVideo.title,
        ytVideo.url,
        ytVideo.author.name,
        ytVideo.author.url,
        ytVideo.author.bestAvatar.url,
        ytVideo.bestThumbnail.url,)
}


async function getSong(){}