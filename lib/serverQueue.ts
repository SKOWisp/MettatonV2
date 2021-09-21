import {
	AudioPlayer,
	AudioPlayerStatus,
	AudioResource,
	createAudioPlayer,
	createAudioResource,
	entersState,
	VoiceConnection,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
    demuxProbe
} from '@discordjs/voice';
import { promisify } from 'util';
import { raw as ytdl } from 'youtube-dl-exec';
import { config } from 'dotenv';
import { safeSong } from './safeSong';

config();
const wait = promisify(setTimeout);


export class ServerQueue{
    public readonly voiceConnection: VoiceConnection;
    public readonly audioPlayer: AudioPlayer;
    public readonly timeoutID = null;
    public readonly onCountDown = false;

    public queue: Track[];
	public currentSong: SongData | undefined;

    public prevMembers = null;

    public readyLock = false;
    public queueLock = false;

    public constructor(voiceConnection: VoiceConnection){
        this.voiceConnection = voiceConnection;
        this.audioPlayer = createAudioPlayer();
        this.queue = [];

        //Manages reconnection after a disconnect
        this.voiceConnection.on('stateChange', async (_, newState) => {
            if (newState.status === VoiceConnectionStatus.Disconnected) {
				if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
					/*
						If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
						but there is a chance the connection will recover itself if the reason of the disconnect was due to
						switching voice channels. This is also the same code for the bot being kicked from the voice channel,
						so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
						the voice connection.
					*/
					try {
						await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
						// Probably moved voice channel
					} catch {
						this.voiceConnection.destroy();
						// Probably removed from voice channel
					}
				} else if (this.voiceConnection.rejoinAttempts < 5) {
					/*
						The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
					*/
					await wait((this.voiceConnection.rejoinAttempts + 1) * 5_000);
					this.voiceConnection.rejoin();
				} else {
					/*
						The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
					*/
					this.voiceConnection.destroy();
				}
			} else if (newState.status === VoiceConnectionStatus.Destroyed) {
				/*
					Once destroyed, stop the subscription
				*/
				this.stop();
            } else if (
                !this.readyLock && 
                (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)
            ){
                /*
					In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
					before destroying the voice connection. This stops the voice connection permanently existing in one of these
					states.
				*/
                this.readyLock = true;
                try {
					await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
				} catch {
					if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) this.voiceConnection.destroy();
				} finally {
					this.readyLock = false;
				}
            }
        });

		//Manages the end of a Track
        this.audioPlayer.on('stateChange', (oldState, newState) => {
			if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
				// If the Idle state is entered from a non-Idle state, it means that an audio resource has finished playing.
				// The queue is then processed to start playing the next track, if one is available.
				(oldState.resource as AudioResource<Track>).metadata.onFinish();
				void this.processQueue();
			} else if (newState.status === AudioPlayerStatus.Playing) {
				// If the Playing state has been entered, then a new track has started playback.
				// Metadata can't be undefined because it was obtained on song load.
				console.log(`Now playing ${this.currentSong!.title}`);
				(newState.resource as AudioResource<Track>).metadata.onStart(this.currentSong!);
			}
		});

        this.audioPlayer.on('error', error => {
            const info = (error.resource as AudioResource<Track>);
            console.warn(`Error while streaming ${info.metadata.title}`);
			(error.resource as AudioResource<Track>).metadata.onError(error)
        });

        voiceConnection.subscribe(this.audioPlayer);
    }

    public enqueue(tracks: Track[]) {
		let difference = Number(process.env.MAX_SONGS) - this.queue.length;
		if (difference < 0){
			return;
		}
		let newArray = this.queue.concat(tracks.slice(0,difference))
		this.queue = newArray;
		void this.processQueue();
	}


    public stop() {
		this.queueLock = true;
		this.queue = [];
		this.currentSong = undefined;
		this.audioPlayer.stop(true);
	}

    private async processQueue(): Promise<void>{
        //Return if queue is locked, empty or audio playing.
        if (this.queueLock || this.audioPlayer.state.status !== AudioPlayerStatus.Idle || this.queue.length === 0) {
			return;
		}
		// Lock the queue to guarantee safe access
		this.queueLock = true;

        // Take the first item from the queue. This is guaranteed to exist due to the non-empty check above.
		const nextTrack = this.queue.shift()!; // ! significa que no puede ser null

		let info = await safeSong(nextTrack.title);
		// If getting info fails, try next song
		if (info === null) {
			console.log( `ytsr no pudo encontrat ${nextTrack.title}`)
			this.queueLock = false;
			return this.processQueue();
		}

		this.currentSong = info!;
		nextTrack.url = info!.url;
		nextTrack.title = info!.title;

        try {
			// Attempt to convert the Track into an AudioResource (i.e. start streaming the video)
			const resource = await nextTrack.createAudioResource();
			this.audioPlayer.play(resource);
			this.queueLock = false;
		} catch (error) {
			console.log(error);
			// If an error occurred, try the next item of the queue instead
			nextTrack.onError(error as Error);
			this.queueLock = false;
			return this.processQueue();
		}
    }
}


export interface TrackData {
	title: string;
    url: string;
	onStart: (song: SongData) => void;
	onFinish: () => void;
	onError: (error: Error) => void;
}

const noop = () => {};

export class Track implements TrackData{
    public title: string;
    public url: string;
	public readonly onStart: (song: SongData) => void;
	public readonly onFinish: () => void;
	public readonly onError: (error: Error) => void;

    private constructor({title, url, onStart,onFinish,onError}:TrackData) {
        this.title = title;
		this.url = url;
		this.onStart = onStart;
		this.onFinish = onFinish
		this.onError = onError;
	}

    public createAudioResource(): Promise<AudioResource<Track>> {
		return new Promise((resolve, reject) => {
			const process = ytdl(
				this.url,
				{
					o: '-',
					q: '',
					f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
					r: '100K',
				},
				{ stdio: ['ignore', 'pipe', 'ignore'] },
			);
			if (!process.stdout) {
				reject(new Error('No stdout'));
				return;
			}
			const stream = process.stdout;
			const onError = (error: Error) => {
				if (!process.killed) process.kill();
				stream.resume();
				reject(error);
			};
			process
				.once('spawn', () => {
					demuxProbe(stream)
						.then((probe) => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type })))
						.catch(onError);
				})
				.catch(onError);
		});
	}

    public static from(title: string, methods: Pick<Track, 'onStart' | 'onFinish' | 'onError'>): Track {
		const wrappedMethods = {
			onStart(song: SongData) {
				wrappedMethods.onStart = noop;
				methods.onStart(song);
			},
			onFinish(){
				wrappedMethods.onStart = noop;
				methods.onFinish();
			},
			onError(error: Error) {
				wrappedMethods.onError = noop;
				methods.onError(error);
			},
		};
        return new Track({
            title: title,
            url: "",
			...wrappedMethods, 
        });
    }
}

export class SongData{
	public readonly title: string;
    public readonly url: string;
	public readonly author: string;
	public readonly authorUrl: string;
    public readonly avatar: string;
	public readonly thumbnail: string;

	public constructor(title: string, url: string, author: string, authorUrl: string, avatar: string, thubmnail: string){
		this.title = title;
		this.url = url;
		this.author = author;
		this.authorUrl = authorUrl;
		this.avatar = avatar;
		this.thumbnail = thubmnail;
	}
}


