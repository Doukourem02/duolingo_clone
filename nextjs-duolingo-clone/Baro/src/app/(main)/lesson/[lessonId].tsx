import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import ConfettiCannon from "react-native-confetti-cannon";

import { colors } from "@/lib/theme";
import { playSound, SOUNDS } from "@/lib/sound";
import { AssetImage } from "@/components/asset-image";
import {
  useLesson,
  useReduceHearts,
  useUpsertChallengeProgress,
  useUserProgress,
  useUserSubscription,
} from "@/lib/queries";
import type { Challenge, ChallengeOption } from "@/lib/types";

type Status = "correct" | "wrong" | "none";

const OptionCard = ({
  option,
  selected,
  status,
  disabled,
  compact,
  onPress,
}: {
  option: ChallengeOption;
  selected: boolean;
  status: Status;
  disabled: boolean;
  compact: boolean;
  onPress: () => void;
}) => {
  return (
    <Pressable
      style={[
        styles.option,
        compact && styles.optionCompact,
        !option.imageSrc && styles.optionPadding,
        selected && styles.optionSelected,
        selected && status === "correct" && styles.optionCorrect,
        selected && status === "wrong" && styles.optionWrong,
        disabled && styles.optionDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {option.imageSrc && (
        <AssetImage
          src={option.imageSrc}
          width="100%"
          height={compact ? 120 : 160}
          style={styles.optionImage}
          contentPosition="top"
        />
      )}
      <Text
        style={[
          styles.optionText,
          option.imageSrc && styles.optionTextWithImage,
          selected && styles.optionTextSelected,
          selected && status === "correct" && styles.optionTextCorrect,
          selected && status === "wrong" && styles.optionTextWrong,
        ]}
      >
        {option.text}
      </Text>
    </Pressable>
  );
};

const Quiz = ({
  lessonId,
  initialChallenges,
  initialHearts,
  hasActiveSubscription,
}: {
  lessonId: number;
  initialChallenges: Challenge[];
  initialHearts: number;
  hasActiveSubscription: boolean;
}) => {
  const router = useRouter();
  const upsertChallengeProgress = useUpsertChallengeProgress();
  const reduceHearts = useReduceHearts();

  const [challenges] = useState(initialChallenges);
  const [hearts, setHearts] = useState(initialHearts);
  const [initialPercentage] = useState(() => {
    const completed = initialChallenges.filter((c) => c.completed).length;
    return initialChallenges.length
      ? Math.round((completed / initialChallenges.length) * 100)
      : 0;
  });
  const [percentage, setPercentage] = useState(() =>
    initialPercentage === 100 ? 0 : initialPercentage,
  );
  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = challenges.findIndex((c) => !c.completed);
    return idx === -1 ? 0 : idx;
  });
  const [selectedOption, setSelectedOption] = useState<number | undefined>();
  const [status, setStatus] = useState<Status>("none");
  const [pending, setPending] = useState(false);
  const finishSoundPlayed = useRef(false);

  const isPractice = initialPercentage === 100;
  const challenge = challenges[activeIndex];

  useEffect(() => {
    if (isPractice) {
      Alert.alert(
        "Leçon d'entraînement",
        "Les leçons d'entraînement te permettent de regagner des cœurs et des points. Tu ne peux pas perdre de cœurs ni de points en mode entraînement.",
        [{ text: "J'ai compris" }],
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!challenge && !finishSoundPlayed.current) {
      finishSoundPlayed.current = true;
      playSound(SOUNDS.finish);
    }
  }, [challenge]);

  const onExit = () => router.replace("/learn");

  const onHeartsExhausted = () => {
    Alert.alert(
      "Tu n'as plus de cœurs !",
      "Passe Pro pour des cœurs illimités, ou achète-en dans la boutique.",
      [
        { text: "Obtenir des cœurs illimités", onPress: () => router.push("/shop") },
        { text: "Non merci", style: "cancel" },
      ],
    );
  };

  const onSelect = (id: number) => {
    if (status !== "none" || pending) return;
    setSelectedOption(id);

    const option = challenge?.challengeOptions.find((o) => o.id === id);
    playSound(option?.audioSrc);
  };

  const onContinue = async () => {
    if (!selectedOption || !challenge) return;

    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    if (status === "correct") {
      setActiveIndex((prev) => prev + 1);
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    const correctOption = challenge.challengeOptions.find((o) => o.correct);
    if (!correctOption) return;

    setPending(true);

    if (correctOption.id === selectedOption) {
      try {
        const result = await upsertChallengeProgress.mutateAsync(challenge.id);
        if ("error" in result) {
          onHeartsExhausted();
        } else {
          playSound(SOUNDS.correct);
          setStatus("correct");
          setPercentage((prev) => prev + 100 / challenges.length);
          if (isPractice) {
            setHearts((prev) => Math.min(prev + 1, 5));
          }
        }
      } catch {
        Alert.alert("Une erreur est survenue", "Veuillez réessayer.");
      } finally {
        setPending(false);
      }
    } else {
      try {
        const result = await reduceHearts.mutateAsync(challenge.id);
        if ("error" in result && result.error === "hearts") {
          onHeartsExhausted();
        } else {
          playSound(SOUNDS.incorrect);
          setStatus("wrong");
          if (!("error" in result)) {
            setHearts((prev) => Math.max(prev - 1, 0));
          }
        }
      } catch {
        Alert.alert("Une erreur est survenue", "Veuillez réessayer.");
      } finally {
        setPending(false);
      }
    }
  };

  if (!challenge) {
    const { width } = Dimensions.get("window");

    return (
      <View style={styles.center}>
        <ConfettiCannon count={180} origin={{ x: width / 2, y: 0 }} fadeOut autoStart />
        <Text style={styles.finishTitle}>Bravo !</Text>
        <Text style={styles.finishSubtitle}>Tu as terminé la leçon.</Text>
        <View style={styles.resultRow}>
          <View style={styles.resultCard}>
            <Text style={styles.resultValue}>{challenges.length * 10}</Text>
            <Text style={styles.resultLabel}>XP</Text>
          </View>
          <View style={styles.resultCard}>
            <Text style={styles.resultValue}>{hearts}</Text>
            <Text style={styles.resultLabel}>Cœurs</Text>
          </View>
        </View>
        <Pressable style={styles.continueButton} onPress={onExit}>
          <Text style={styles.continueButtonText}>Continuer</Text>
        </Pressable>
      </View>
    );
  }

  const title = challenge.type === "ASSIST" ? "Sélectionne la bonne signification" : challenge.question;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onExit}>
          <Text style={styles.exitIcon}>✕</Text>
        </Pressable>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.hearts}>♥ {hasActiveSubscription ? "∞" : hearts}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.question}>{title}</Text>
        {challenge.type === "ASSIST" && (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{challenge.question}</Text>
          </View>
        )}
        <View style={[styles.options, challenge.type === "SELECT" && styles.optionsGrid]}>
          {challenge.challengeOptions.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              selected={selectedOption === option.id}
              status={status}
              disabled={pending || status !== "none"}
              compact={challenge.type === "SELECT"}
              onPress={() => onSelect(option.id)}
            />
          ))}
        </View>
      </View>

      <View
        style={[
          styles.footer,
          status === "correct" && styles.footerCorrect,
          status === "wrong" && styles.footerWrong,
        ]}
      >
        {status === "correct" && <Text style={styles.footerMessageCorrect}>Bien joué !</Text>}
        {status === "wrong" && <Text style={styles.footerMessageWrong}>Réessaie.</Text>}
        <Pressable
          style={[
            styles.checkButton,
            status === "wrong" && styles.checkButtonWrong,
            (pending || !selectedOption) && styles.checkButtonDisabled,
          ]}
          onPress={onContinue}
          disabled={pending || !selectedOption}
        >
          {pending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkButtonText}>
              {status === "none" && "Vérifier"}
              {status === "correct" && "Suivant"}
              {status === "wrong" && "Réessayer"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const numericLessonId = Number(lessonId);

  const lessonQuery = useLesson(numericLessonId);
  const userProgressQuery = useUserProgress();
  const userSubscriptionQuery = useUserSubscription();

  const isLoading = lessonQuery.isLoading || userProgressQuery.isLoading;

  const initialChallenges = useMemo(() => lessonQuery.data?.challenges ?? [], [lessonQuery.data]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!lessonQuery.data || !userProgressQuery.data) {
    return <Redirect href="/learn" />;
  }

  return (
    <Quiz
      key={lessonQuery.data.id}
      lessonId={lessonQuery.data.id}
      initialChallenges={initialChallenges}
      initialHearts={userProgressQuery.data.hearts}
      hasActiveSubscription={!!userSubscriptionQuery.data?.isActive}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  exitIcon: {
    fontSize: 20,
    color: colors.muted,
  },
  progressBar: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.green,
  },
  hearts: {
    color: colors.red,
    fontWeight: "700",
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
  },
  question: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 20,
  },
  bubble: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  bubbleText: {
    color: colors.text,
  },
  options: {
    gap: 10,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  option: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  optionPadding: {
    padding: 16,
  },
  optionCompact: {
    width: "48%",
    marginBottom: 10,
  },
  optionImage: {
    backgroundColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.blue,
    backgroundColor: "#e7f7ff",
  },
  optionCorrect: {
    borderColor: colors.green,
    backgroundColor: "#eaffea",
  },
  optionWrong: {
    borderColor: colors.red,
    backgroundColor: "#ffecec",
  },
  optionDisabled: {
    opacity: 0.8,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  optionTextWithImage: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  optionTextSelected: {
    color: colors.blue,
  },
  optionTextCorrect: {
    color: colors.greenDark,
  },
  optionTextWrong: {
    color: colors.red,
  },
  footer: {
    borderTopWidth: 2,
    borderTopColor: colors.border,
    padding: 16,
    paddingBottom: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerCorrect: {
    backgroundColor: "#eaffea",
    borderTopColor: "transparent",
  },
  footerWrong: {
    backgroundColor: "#ffecec",
    borderTopColor: "transparent",
  },
  footerMessageCorrect: {
    color: colors.greenDark,
    fontWeight: "700",
  },
  footerMessageWrong: {
    color: colors.red,
    fontWeight: "700",
  },
  checkButton: {
    marginLeft: "auto",
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  checkButtonWrong: {
    backgroundColor: colors.red,
  },
  checkButtonDisabled: {
    opacity: 0.5,
  },
  checkButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  finishTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  finishSubtitle: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 24,
    textAlign: "center",
  },
  resultRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  resultCard: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    minWidth: 100,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  resultLabel: {
    color: colors.muted,
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: colors.green,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  continueButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
