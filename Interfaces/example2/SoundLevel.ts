export interface SoundLevel {
    readonly MAX_VOLUME: number;
    currentVolume: number;
    isMuted?: boolean;

    toggleMute(): void;
    turnUp(): void;
    turnDown(): void;
}