"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Track = exports.ServerQueue = void 0;
var voice_1 = require("@discordjs/voice");
var util_1 = require("util");
var youtube_dl_exec_1 = require("youtube-dl-exec");
var utils = __importStar(require("../../utils/utility"));
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var wait = (0, util_1.promisify)(setTimeout);
var ServerQueue = /** @class */ (function () {
    function ServerQueue(voiceConnection) {
        var _this = this;
        this.timeoutID = null;
        this.onCountDown = false;
        this.prevMembers = null;
        this.readyLock = false;
        this.queueLock = false;
        this.voiceConnection = voiceConnection;
        this.audioPlayer = (0, voice_1.createAudioPlayer)();
        this.queue = [];
        //Manages reconnection after a disconnect
        this.voiceConnection.on('stateChange', function (_, newState) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(newState.status === voice_1.VoiceConnectionStatus.Disconnected)) return [3 /*break*/, 9];
                        if (!(newState.reason === voice_1.VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014)) return [3 /*break*/, 5];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, voice_1.entersState)(this.voiceConnection, voice_1.VoiceConnectionStatus.Connecting, 5000)];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _c.sent();
                        this.voiceConnection.destroy();
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 8];
                    case 5:
                        if (!(this.voiceConnection.rejoinAttempts < 5)) return [3 /*break*/, 7];
                        /*
                            The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
                        */
                        return [4 /*yield*/, wait((this.voiceConnection.rejoinAttempts + 1) * 5000)];
                    case 6:
                        /*
                            The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
                        */
                        _c.sent();
                        this.voiceConnection.rejoin();
                        return [3 /*break*/, 8];
                    case 7:
                        /*
                            The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
                        */
                        this.voiceConnection.destroy();
                        _c.label = 8;
                    case 8: return [3 /*break*/, 15];
                    case 9:
                        if (!(newState.status === voice_1.VoiceConnectionStatus.Destroyed)) return [3 /*break*/, 10];
                        /*
                            Once destroyed, stop the subscription
                        */
                        this.stop();
                        return [3 /*break*/, 15];
                    case 10:
                        if (!(!this.readyLock &&
                            (newState.status === voice_1.VoiceConnectionStatus.Connecting || newState.status === voice_1.VoiceConnectionStatus.Signalling))) return [3 /*break*/, 15];
                        /*
                            In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
                            before destroying the voice connection. This stops the voice connection permanently existing in one of these
                            states.
                        */
                        this.readyLock = true;
                        _c.label = 11;
                    case 11:
                        _c.trys.push([11, 13, 14, 15]);
                        return [4 /*yield*/, (0, voice_1.entersState)(this.voiceConnection, voice_1.VoiceConnectionStatus.Ready, 20000)];
                    case 12:
                        _c.sent();
                        return [3 /*break*/, 15];
                    case 13:
                        _b = _c.sent();
                        if (this.voiceConnection.state.status !== voice_1.VoiceConnectionStatus.Destroyed)
                            this.voiceConnection.destroy();
                        return [3 /*break*/, 15];
                    case 14:
                        this.readyLock = false;
                        return [7 /*endfinally*/];
                    case 15: return [2 /*return*/];
                }
            });
        }); });
        //Manages the end of a Track
        this.audioPlayer.on('stateChange', function (oldState, newState) {
            if (newState.status === voice_1.AudioPlayerStatus.Idle && oldState.status !== voice_1.AudioPlayerStatus.Idle) {
                // If the Idle state is entered from a non-Idle state, it means that an audio resource has finished playing.
                // The queue is then processed to start playing the next track, if one is available.
                oldState.resource.metadata.onFinish();
                void _this.processQueue();
            }
            else if (newState.status === voice_1.AudioPlayerStatus.Playing) {
                // If the Playing state has been entered, then a new track has started playback.
                var metadata = newState.resource.metadata;
                console.log("Now playing " + metadata.title + " by " + metadata.author);
                newState.resource.metadata.onStart(metadata);
            }
        });
        this.audioPlayer.on('error', function (error) {
            var info = error.resource;
            console.warn("Error while streaming " + info.metadata.title);
            error.resource.metadata.onError(error);
        });
        voiceConnection.subscribe(this.audioPlayer);
    }
    ServerQueue.prototype.enqueue = function (tracks) {
        var difference = Number(process.env.MAX_SONGS) - this.queue.length;
        if (difference < 0) {
            return;
        }
        var newArray = this.queue.concat(tracks.slice(0, difference));
        this.queue = newArray;
        void this.processQueue();
    };
    ServerQueue.prototype.stop = function () {
        this.queueLock = true;
        this.queue = [];
        this.audioPlayer.stop(true);
    };
    ServerQueue.prototype.processQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nextTrack, info, resource, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //Return if queue is locked, empty or audio playing.
                        if (this.queueLock || this.audioPlayer.state.status !== voice_1.AudioPlayerStatus.Idle || this.queue.length === 0) {
                            return [2 /*return*/];
                        }
                        // Lock the queue to guarantee safe access
                        this.queueLock = true;
                        nextTrack = this.queue.shift();
                        return [4 /*yield*/, utils.getSong(nextTrack.title)];
                    case 1:
                        info = _a.sent();
                        nextTrack.title = info.title;
                        nextTrack.author = info.author.name;
                        nextTrack.authorUrl = info.author.url;
                        nextTrack.avatar = info.author.bestAvatar.url;
                        nextTrack.thumbnail = info.bestThumbnail.url;
                        nextTrack.url = info.url;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, nextTrack.createAudioResource()];
                    case 3:
                        resource = _a.sent();
                        this.audioPlayer.play(resource);
                        this.queueLock = false;
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.log(error_1);
                        // If an error occurred, try the next item of the queue instead
                        nextTrack.onError(error_1);
                        this.queueLock = false;
                        return [2 /*return*/, this.processQueue()];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return ServerQueue;
}());
exports.ServerQueue = ServerQueue;
var noop = function () { };
var Track = /** @class */ (function () {
    function Track(_a) {
        var title = _a.title, url = _a.url, author = _a.author, avatar = _a.avatar, authorUrl = _a.authorUrl, thumbnail = _a.thumbnail, onStart = _a.onStart, onFinish = _a.onFinish, onError = _a.onError;
        this.title = title;
        this.url = url;
        this.author = author;
        this.avatar = avatar;
        this.authorUrl = authorUrl;
        this.thumbnail = thumbnail;
        this.onStart = onStart;
        this.onFinish = onFinish;
        this.onError = onError;
    }
    Track.prototype.createAudioResource = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var process = (0, youtube_dl_exec_1.raw)(_this.url, {
                o: '-',
                q: '',
                f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                r: '100K',
            }, { stdio: ['ignore', 'pipe', 'ignore'] });
            if (!process.stdout) {
                reject(new Error('No stdout'));
                return;
            }
            var stream = process.stdout;
            var onError = function (error) {
                if (!process.killed)
                    process.kill();
                stream.resume();
                reject(error);
            };
            process
                .once('spawn', function () {
                (0, voice_1.demuxProbe)(stream)
                    .then(function (probe) { return resolve((0, voice_1.createAudioResource)(probe.stream, { metadata: _this, inputType: probe.type })); })
                    .catch(onError);
            })
                .catch(onError);
        });
    };
    Track.from = function (title, methods) {
        var wrappedMethods = {
            onStart: function (song) {
                wrappedMethods.onStart = noop;
                methods.onStart(song);
            },
            onFinish: function () {
                wrappedMethods.onStart = noop;
                methods.onFinish();
            },
            onError: function (error) {
                wrappedMethods.onError = noop;
                methods.onError(error);
            },
        };
        return new Track(__assign({ title: title, url: "", author: "", avatar: "", authorUrl: "", thumbnail: "" }, wrappedMethods));
    };
    return Track;
}());
exports.Track = Track;
