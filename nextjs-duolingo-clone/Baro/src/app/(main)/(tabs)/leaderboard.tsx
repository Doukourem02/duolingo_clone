import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/lib/theme";
import { AssetImage } from "@/components/asset-image";
import { useTopTenUsers, useUserProgress } from "@/lib/queries";

export default function LeaderboardScreen() {
  const userProgressQuery = useUserProgress();
  const leaderboardQuery = useTopTenUsers();

  if (userProgressQuery.isLoading || leaderboardQuery.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!userProgressQuery.data || !userProgressQuery.data.activeCourse) {
    return <Redirect href="/courses" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="flash" size={16} color={colors.orange} />
          <Text style={styles.badgeTextPoints}>{userProgressQuery.data.points}</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="heart" size={16} color={colors.red} />
          <Text style={styles.badgeTextHearts}>{userProgressQuery.data.hearts}</Text>
        </View>
      </View>

      <FlatList
        data={leaderboardQuery.data ?? []}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.intro}>
            <Ionicons name="trophy" size={56} color="#ffc800" />
            <Text style={styles.title}>Classement</Text>
            <Text style={styles.subtitle}>
              Découvre où tu te situes parmi les autres apprenants de la communauté.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{index + 1}</Text>
            <AssetImage src={item.userImageSrc} width={44} height={44} style={styles.avatar} />
            <Text style={styles.name} numberOfLines={1}>
              {item.userName}
            </Text>
            <Text style={styles.points}>{item.points} XP</Text>
          </View>
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
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rank: {
    fontWeight: "800",
    color: colors.greenDark,
    width: 24,
  },
  avatar: {
    borderRadius: 22,
    marginRight: 14,
    backgroundColor: colors.border,
  },
  name: {
    flex: 1,
    fontWeight: "700",
    color: colors.text,
  },
  points: {
    color: colors.muted,
  },
});
