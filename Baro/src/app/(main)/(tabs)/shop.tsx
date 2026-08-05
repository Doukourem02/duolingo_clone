import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/lib/theme";
import { POINTS_TO_REFILL } from "@/lib/constants";
import { useRefillHearts, useUserProgress, useUserSubscription } from "@/lib/queries";

export default function ShopScreen() {
  const userProgressQuery = useUserProgress();
  const userSubscriptionQuery = useUserSubscription();
  const refillHearts = useRefillHearts();

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

  const { hearts, points } = userProgressQuery.data;
  const hasActiveSubscription = !!userSubscriptionQuery.data?.isActive;
  const canRefill = hearts < 5 && points >= POINTS_TO_REFILL && !refillHearts.isPending;

  const onRefillHearts = () => {
    if (!canRefill) return;

    refillHearts.mutate(undefined, {
      onError: () => Alert.alert("Une erreur est survenue", "Veuillez réessayer."),
    });
  };

  const onUpgrade = () => {
    Alert.alert("Bientôt disponible", "Les abonnements Pro ne sont pas encore disponibles dans l'app.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="flash" size={16} color={colors.orange} />
          <Text style={styles.badgeTextPoints}>{points}</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="heart" size={16} color={colors.red} />
          <Text style={styles.badgeTextHearts}>{hearts}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <View style={styles.intro}>
          <Ionicons name="bag" size={56} color={colors.blue} />
          <Text style={styles.title}>Boutique</Text>
          <Text style={styles.subtitle}>Dépense tes points pour des trucs sympas.</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="heart" size={40} color={colors.red} />
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>Recharger les cœurs</Text>
          </View>
          <Pressable
            style={[styles.actionButton, !canRefill && styles.actionButtonDisabled]}
            onPress={onRefillHearts}
            disabled={!canRefill}
          >
            {refillHearts.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : hearts === 5 ? (
              <Text style={styles.actionButtonText}>Plein</Text>
            ) : (
              <View style={styles.actionButtonRow}>
                <Ionicons name="flash" size={14} color="#fff" />
                <Text style={styles.actionButtonText}>{POINTS_TO_REFILL}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.row}>
          <Ionicons name="infinite" size={40} color={colors.blue} />
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle}>Cœurs illimités</Text>
          </View>
          <Pressable style={styles.actionButton} onPress={onUpgrade}>
            <Text style={styles.actionButtonText}>
              {hasActiveSubscription ? "Actif" : "Passer Pro"}
            </Text>
          </Pressable>
        </View>
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
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: colors.text,
  },
  actionButton: {
    backgroundColor: colors.blue,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 72,
    alignItems: "center",
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
});
