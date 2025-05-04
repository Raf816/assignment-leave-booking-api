import { SoundLevel } from "./SoundLevel";

export class Speaker implements SoundLevel {
    readonly MAX_VOLUME: number = 11;
    isMuted?: boolean = false;
    currentVolume: number = 0;

    constructor(private readonly id: string) {
        this.id = id;
    }

    get volume(): number {
        return this.currentVolume;
    }

    toggleMute(): void {
        this.isMuted = !this.isMuted;
    }

    turnUp(): void {
        if (this.currentVolume < this.MAX_VOLUME) {
            this.currentVolume++;
        }
    }

    turnDown(): void {
        if (this.currentVolume > 0) {
            this.currentVolume--;
        }
    }

    toString(): string {
        if (this.isMuted) {
            return "On mute";
        } else {
            return `${this.id} volume level is ${this.currentVolume}...`;
        }
    }
}