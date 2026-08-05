import { createAudioPlayer } from "expo-audio";

const ASSETS_BASE_URL = process.env.EXPO_PUBLIC_ASSETS_BASE_URL ?? "http://localhost:3000";

export const SOUNDS = {
  correct: "/correct.wav",
  incorrect: "/incorrect.wav",
  finish: "/finish.mp3",
} as const;

/** Fire-and-forget playback of a sound served from nextjs-duolingo-clone's /public folder. */
export const playSound = (path: string | null | undefined) => {
  if (!path) return;

  try {
    const uri = path.startsWith("http") ? path : `${ASSETS_BASE_URL}${path}`;
    const player = createAudioPlayer(uri);

    const subscription = player.addListener("playbackStatusUpdate", (status) => {
      if (status.didJustFinish) {
        subscription.remove();
        player.remove();
      }
    });

    player.play();
  } catch {
    // ignore playback errors (no audio hardware, offline asset, etc.)
  }
};
