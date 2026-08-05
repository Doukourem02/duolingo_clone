import type { ViewStyle } from "react-native";
import { Image } from "expo-image";
import { SvgUri } from "react-native-svg";

import { resolveAssetUri } from "@/lib/assets";

type Props = {
  src: string | null | undefined;
  width: number | `${number}%`;
  height: number | `${number}%`;
  style?: ViewStyle;
  /** Bias for `cover` cropping — e.g. "top" keeps faces/heads in frame for portrait character art. */
  contentPosition?: "center" | "top" | "bottom";
};

/**
 * nextjs-duolingo-clone's course/character assets are .svg files, which
 * expo-image's native decoders (SDWebImage/Glide) can't render from a
 * remote URI. react-native-svg's SvgUri fetches + renders SVG natively;
 * everything else (Clerk avatars, etc.) goes through expo-image as usual.
 */
export const AssetImage = ({ src, width, height, style, contentPosition = "center" }: Props) => {
  const uri = resolveAssetUri(src);
  if (!uri) return null;

  if (uri.endsWith(".svg")) {
    return <SvgUri uri={uri} width={width} height={height} style={style} />;
  }

  return (
    <Image
      source={{ uri }}
      style={[{ width, height }, style] as any}
      contentFit="cover"
      contentPosition={contentPosition}
    />
  );
};
