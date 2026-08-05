const ASSETS_BASE_URL = process.env.EXPO_PUBLIC_ASSETS_BASE_URL ?? "http://localhost:3000";

/**
 * imageSrc/audioSrc from the shared DB are relative paths served from
 * nextjs-duolingo-clone's /public folder (e.g. "/es.svg").
 */
export const resolveAssetUri = (path: string | null | undefined) => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${ASSETS_BASE_URL}${path}`;
};
