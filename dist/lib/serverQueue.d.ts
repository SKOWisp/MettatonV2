import { AudioPlayer, AudioResource, VoiceConnection } from '@discordjs/voice';
export declare class ServerQueue {
    readonly voiceConnection: VoiceConnection;
    readonly audioPlayer: AudioPlayer;
    readonly timeoutID: null;
    readonly onCountDown = false;
    queue: Track[];
    prevMembers: null;
    readyLock: boolean;
    queueLock: boolean;
    constructor(voiceConnection: VoiceConnection);
    enqueue(tracks: Track[]): void;
    stop(): void;
    private processQueue;
}
export interface TrackData {
    title: string;
    url: string;
    author: string;
    avatar: string;
    authorUrl: string;
    thumbnail: string;
    onStart: (song: Track) => void;
    onFinish: () => void;
    onError: (error: Error) => void;
}
export declare class Track implements TrackData {
    title: string;
    url: string;
    author: string;
    avatar: string;
    authorUrl: string;
    thumbnail: string;
    readonly onStart: (song: Track) => void;
    readonly onFinish: () => void;
    readonly onError: (error: Error) => void;
    private constructor();
    createAudioResource(): Promise<AudioResource<Track>>;
    static from(title: string, methods: Pick<Track, 'onStart' | 'onFinish' | 'onError'>): Track;
}
