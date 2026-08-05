import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { colors } from "@/lib/theme";
import { translateCourseName } from "@/lib/i18n";
import { AssetImage } from "@/components/asset-image";
import { useCourses, useSelectCourse, useUserProgress } from "@/lib/queries";
import type { Course } from "@/lib/types";

const CourseCard = ({
  course,
  active,
  disabled,
  onPress,
}: {
  course: Course;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) => {
  return (
    <Pressable
      style={[styles.card, disabled && styles.cardDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {active && (
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>✓</Text>
        </View>
      )}
      <AssetImage src={course.imageSrc} width={80} height={60} style={styles.image} />
      <Text style={styles.cardTitle}>{translateCourseName(course.title)}</Text>
    </Pressable>
  );
};

export default function CoursesScreen() {
  const router = useRouter();
  const coursesQuery = useCourses();
  const userProgressQuery = useUserProgress();
  const selectCourse = useSelectCourse();
  const [pendingId, setPendingId] = useState<number | null>(null);

  const onSelect = (id: number) => {
    if (selectCourse.isPending) return;

    if (id === userProgressQuery.data?.activeCourseId) {
      router.push("/learn");
      return;
    }

    setPendingId(id);
    selectCourse.mutate(id, {
      onSuccess: () => router.replace("/learn"),
      onSettled: () => setPendingId(null),
    });
  };

  if (coursesQuery.isLoading || userProgressQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cours de langues</Text>
      <FlatList
        data={coursesQuery.data ?? []}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            active={item.id === userProgressQuery.data?.activeCourseId}
            disabled={selectCourse.isPending && pendingId !== item.id}
            onPress={() => onSelect(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 40,
  },
  row: {
    gap: 12,
  },
  card: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    paddingBottom: 20,
    minHeight: 180,
    marginBottom: 12,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  activeBadge: {
    alignSelf: "flex-end",
    backgroundColor: colors.green,
    borderRadius: 6,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  activeBadgeText: {
    color: "#fff",
    fontWeight: "800",
  },
  image: {
    marginVertical: 12,
  },
  cardTitle: {
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
});
