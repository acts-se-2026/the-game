import bullethitSrc from "../../sfx/bullethit.mp3";
import deathSrc from "../../sfx/death.mp3";
import gunshotSrc from "../../sfx/gunshot.mp3";
import newRoundSrc from "../../sfx/new_round.mp3";
import startGameSrc from "../../sfx/start_game.mp3";
import winSrc from "../../sfx/win.mp3";

export type SfxName =
    | "bullethit"
    | "death"
    | "gunshot"
    | "new_round"
    | "start_game"
    | "win";

const SOUND_SOURCES: Record<SfxName, string> = {
    bullethit: bullethitSrc,
    death: deathSrc,
    gunshot: gunshotSrc,
    new_round: newRoundSrc,
    start_game: startGameSrc,
    win: winSrc,
};

const sounds = new Map<SfxName, HTMLAudioElement>();

function getSound(name: SfxName): HTMLAudioElement | null {
    if (typeof window === "undefined" || typeof Audio === "undefined") {
        return null;
    }

    const existingSound = sounds.get(name);
    if (existingSound) {
        return existingSound;
    }

    const sound = new Audio(SOUND_SOURCES[name]);
    sound.preload = "auto";
    sounds.set(name, sound);
    return sound;
}

export function preloadSfx() {
    (Object.keys(SOUND_SOURCES) as SfxName[]).forEach((name) => {
        const sound = getSound(name);
        sound?.load();
    });
}

export function playSfx(name: SfxName) {
    const sound = getSound(name);
    if (!sound) {
        return;
    }

    sound.currentTime = 0;
    void sound.play().catch(() => {});
}
