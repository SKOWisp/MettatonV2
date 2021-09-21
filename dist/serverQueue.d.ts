import { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice';
import { TextBasedChannels } from 'discord.js';
export declare class ServerQueue {
    readonly voiceConnection: VoiceConnection;
    readonly textChannel: TextBasedChannels;
    readonly audioPlayer: AudioPlayer;
    readonly timeoutID: any;
    readonly onCountDown: any;
    queue: Track[];
    currentSong: SongData | undefined;
    prevMembers: null;
    readyLock: boolean;
    queueLock: boolean;
    constructor(voiceConnection: VoiceConnection, textChannel: TextBasedChannels);
    enqueue(tracks: Track[]): void;
    stop(): void;
    private processQueue;
}
export interface TrackData {
    title: string;
    url: string;
    onStart: (song: SongData) => void;
    onFinish: () => void;
    onError: (error: Error) => void;
}
export declare class Track implements TrackData {
    title: string;
    url: string;
    readonly onStart: (song: SongData) => void;
    readonly onFinish: () => void;
    readonly onError: (error: Error) => void;
    private constructor();
    createAudioResource(): Promise<AudioResource<Track>>;
    static from(title: string, methods: Pick<Track, 'onStart' | 'onFinish' | 'onError'>): Track;
}
export declare class SongData {
    readonly title: string;
    readonly url: string;
    readonly author: string;
    readonly authorUrl: string;
    readonly avatar: string;
    readonly thumbnail: string;
    constructor(title: string, url: string, author: string, authorUrl: string, avatar: string, thubmnail: string);
}
