import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/lib/theme";
import { CircularProgress } from "@/components/circular-progress";
import { CheckIcon, CrownIcon, StarIcon } from "@/components/lesson-icons";

const BUTTON_SIZE = 70;
const SHADOW_DEPTH = 8;
const RING_SIZE = 96;
const CYCLE_LENGTH = 8;

const getHorizontalOffset = (index: number) => {
  const cycleIndex = index % CYCLE_LENGTH;
  let indentationLevel: number;

  if (cycleIndex <= 2) indentationLevel = cycleIndex;
  else if (cycleIndex <= 6) indentationLevel = 4 - cycleIndex;
  else indentationLevel = cycleIndex - 8;

  return -(indentationLevel * 36);
};

export const LessonNode = ({
  index,
  isLast,
  locked,
  completed,
  current,
  percentage,
  onPress,
}: {
  index: number;
  isLast: boolean;
  locked: boolean;
  completed: boolean;
  current: boolean;
  percentage: number;
  onPress: () => void;
}) => {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!current) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -8,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [current, bounce]);

  const iconColor = locked ? colors.muted : "#fff";
  const icon = completed ? (
    <CheckIcon size={34} color={iconColor} />
  ) : isLast ? (
    <CrownIcon size={30} color={iconColor} />
  ) : (
    <StarIcon size={30} color={iconColor} />
  );

  const offset = getHorizontalOffset(index);

  // Two overlapping circles (darker "shadow" behind, lighter "face" on top,
  // offset upward) instead of borderBottomWidth on a circular Pressable —
  // RN doesn't render a clean bottom-only crescent from per-side border
  // widths on a fully-rounded view the way CSS does, so this is more reliable.
  const button = (
    <View style={styles.buttonWrapper}>
      <View
        style={[
          styles.buttonLayer,
          { top: SHADOW_DEPTH, backgroundColor: locked ? colors.lockedBorder : colors.greenDark },
        ]}
      />
      <Pressable
        onPress={onPress}
        disabled={locked}
        style={[styles.buttonLayer, { backgroundColor: locked ? colors.locked : colors.green }]}
      >
        {icon}
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { transform: [{ translateX: offset }] }]}>
      {current && (
        <Animated.View style={[styles.tooltip, { transform: [{ translateY: bounce }] }]}>
          <Text style={styles.tooltipText}>START</Text>
          <View style={styles.tooltipArrow} />
        </Animated.View>
      )}
      {current ? (
        <CircularProgress size={RING_SIZE} strokeWidth={6} percentage={percentage}>
          {button}
        </CircularProgress>
      ) : (
        button
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 12,
  },
  tooltip: {
    position: "absolute",
    top: -34,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    zIndex: 10,
  },
  tooltipText: {
    color: colors.green,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  tooltipArrow: {
    position: "absolute",
    bottom: -6,
    left: "50%",
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: "#fff",
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.border,
    transform: [{ rotate: "45deg" }],
  },
  buttonWrapper: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE + SHADOW_DEPTH,
  },
  buttonLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
