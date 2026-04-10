import { _decorator, AudioSource, AudioClip, resources, Node, director } from 'cc';
const { ccclass } = _decorator;

export enum AudioType {
    BGM = 'bgm',
    SFX = 'sfx',
}

@ccclass('AudioManager')
export default class AudioManager {
    private _bgmSource: AudioSource = null!;
    private _sfxSource: AudioSource = null!;
    private _bgmVolume = 0.8;
    private _sfxVolume = 1;
    private _bgmCache: Map<string, AudioClip> = new Map();
    private _sfxCache: Map<string, AudioClip> = new Map();

    constructor() {
        this.initAudioSources();
    }

    private initAudioSources() {
        const bgmNode = new Node('BGMNode');
        director.addPersistRootNode(bgmNode);
        this._bgmSource = bgmNode.addComponent(AudioSource);
        this._bgmSource.loop = true;
        this._bgmSource.volume = this._bgmVolume;

        const sfxNode = new Node('SFXNode');
        director.addPersistRootNode(sfxNode);
        this._sfxSource = sfxNode.addComponent(AudioSource);
        this._sfxSource.loop = false;
        this._sfxSource.volume = this._sfxVolume;
    }

    private async loadAudio(type: AudioType, name: string): Promise<AudioClip> {
        const cache = type === AudioType.BGM ? this._bgmCache : this._sfxCache;
        if (cache.has(name)) {
            return cache.get(name)!;
        }

        const clip = await resources.load<AudioClip>(`audio/${type}/${name}`);
        cache.set(name, clip);
        return clip;
    }

    public async playBGM(name: string, loop = true) {
        try {
            const clip = await this.loadAudio(AudioType.BGM, name);
            this._bgmSource.clip = clip;
            this._bgmSource.loop = loop;
            this._bgmSource.volume = this._bgmVolume;
            this._bgmSource.play();
        } catch (e) {
            console.error('[AudioManager] 播放 BGM 失败:', e);
        }
    }

    public async playSFX(name: string) {
        try {
            const clip = await this.loadAudio(AudioType.SFX, name);
            this._sfxSource.playOneShot(clip, this._sfxVolume);
        } catch (e) {
            console.error('[AudioManager] 播放 SFX 失败:', e);
        }
    }

    public stopBGM() {
        this._bgmSource.stop();
    }

    public pauseAll() {
        this._bgmSource.pause();
        this._sfxSource.pause();
    }

    public resumeAll() {
        this._bgmSource.play();
    }

    public setBGMVolume(volume: number) {
        this._bgmVolume = volume;
        this._bgmSource.volume = volume;
    }

    public setSFXVolume(volume: number) {
        this._sfxVolume = volume;
        this._sfxSource.volume = volume;
    }

    public getBGMVolume(): number {
        return this._bgmVolume;
    }

    public getSFXVolume(): number {
        return this._sfxVolume;
    }
}
