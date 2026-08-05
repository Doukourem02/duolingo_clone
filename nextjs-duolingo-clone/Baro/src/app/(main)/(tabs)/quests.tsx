import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/lib/theme";
import { QUESTS } from "@/lib/constants";
import { useUserProgress } from "@/lib/queries";

export default function QuestsScreen() {
  const userProgressQuery = useUserProgress();

  if (userProgressQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!userProgressQuery.data || !userProgressQuery.data.activeCourse) {
    return <Redirect href="/courses" />;
  }

  const points = userProgressQuery.data.points;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="flash" size={16} color={colors.orange} />
          <Text style={styles.badgeTextPoints}>{points}</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="heart" size={16} color={colors.red} />
          <Text style={styles.badgeTextHearts}>{userProgressQuery.data.hearts}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.intro}>
          <Ionicons name="rocket" size={56} color={colors.blue} />
          <Text style={styles.title}>Quêtes</Text>
          <Text style={styles.subtitle}>Termine des quêtes en gagnant des points.</Text>
        </View>

        {QUESTS.map((quest) => {
          const progress = Math.min((points / quest.value) * 100, 100);

          return (
            <View key={quest.title} style={styles.row}>
              <Ionicons name="flash" size={32} color={colors.orange} />
              <View style={styles.rowContent}>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
              </View>
            </View>
          );
        })}
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
    justifyContent: "flex-end",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  intro: {
    alignItems: "center",
    paddingVertical: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowContent: {
    flex: 1,
    gap: 8,
  },
  questTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: colors.text,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.green,
  },
});
