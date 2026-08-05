import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/lib/theme";
import { translateCourseName } from "@/lib/i18n";
import { useCourseProgress, useLessonPercentage, useUnits, useUserProgress } from "@/lib/queries";
import { LessonNode } from "@/components/lesson-node";
import type { Unit } from "@/lib/types";

const UnitBanner = ({
  unit,
  onContinue,
}: {
  unit: Unit;
  onContinue: () => void;
}) => {
  return (
    <View style={styles.unitBanner}>
      <View style={styles.unitBannerText}>
        <Text style={styles.unitTitle}>{unit.title}</Text>
        <Text style={styles.unitDescription}>{unit.description}</Text>
      </View>
      <Pressable style={styles.continueButton} onPress={onContinue}>
        <Ionicons name="book-outline" size={16} color={colors.green} />
        <Text style={styles.continueButtonText}>Continuer</Text>
      </Pressable>
    </View>
  );
};

export default function LearnScreen() {
  const router = useRouter();
  const userProgressQuery = useUserProgress();
  const unitsQuery = useUnits();
  const courseProgressQuery = useCourseProgress();
  const lessonPercentageQuery = useLessonPercentage();

  const isLoading =
    userProgressQuery.isLoading || unitsQuery.isLoading || courseProgressQuery.isLoading;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!userProgressQuery.data || !userProgressQuery.data.activeCourse) {
    return <Redirect href="/courses" />;
  }

  const activeLessonId = courseProgressQuery.data?.activeLessonId ?? null;

  const onContinue = () => {
    if (activeLessonId) {
      router.push(`/lesson/${activeLessonId}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/courses")}>
          <Ionicons name="chevron-back" size={24} color={colors.muted} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {translateCourseName(userProgressQuery.data.activeCourse.title)}
        </Text>
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Ionicons name="flash" size={16} color={colors.orange} />
            <Text style={styles.badgeTextPoints}>{userProgressQuery.data.points}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="heart" size={16} color={colors.red} />
            <Text style={styles.badgeTextHearts}>{userProgressQuery.data.hearts}</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {(unitsQuery.data ?? []).map((unit) => (
          <View key={unit.id} style={styles.unit}>
            <UnitBanner unit={unit} onContinue={onContinue} />
            <View style={styles.path}>
              {unit.lessons.map((lesson, index) => {
                const isCurrent = lesson.id === activeLessonId;
                const isLocked = !lesson.completed && !isCurrent;
                const isLast = index === unit.lessons.length - 1;

                return (
                  <LessonNode
                    key={lesson.id}
                    index={index}
                    isLast={isLast}
                    locked={isLocked}
                    completed={lesson.completed}
                    current={isCurrent}
                    percentage={lessonPercentageQuery.data ?? 0}
                    onPress={() => router.push(`/lesson/${lesson.id}`)}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },
  badges: {
    flexDirection: "row",
    gap: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeTextPoints: {
    color: colors.orange,
    fontWeight: "800",
    fontSize: 14,
  },
  badgeTextHearts: {
    color: colors.red,
    fontWeight: "800",
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    alignItems: "center",
  },
  unit: {
    width: "100%",
    marginBottom: 24,
  },
  unitBanner: {
    backgroundColor: colors.green,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  unitBannerText: {
    flex: 1,
    marginRight: 12,
  },
  unitTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  unitDescription: {
    color: "#fff",
    fontSize: 14,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  continueButtonText: {
    color: colors.green,
    fontWeight: "800",
    fontSize: 13,
  },
  path: {
    alignItems: "center",
    paddingTop: 24,
  },
});
