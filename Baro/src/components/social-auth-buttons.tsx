import { useState, type ReactElement } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSSO } from "@clerk/clerk-expo";
import type { OAuthStrategy } from "@clerk/types";

import { colors } from "@/lib/theme";
import { AppleIcon, FacebookIcon, GoogleIcon } from "@/components/social-icons";

const PROVIDERS: {
  strategy: OAuthStrategy;
  label: string;
  Icon: (() => ReactElement) | null;
}[] = [
  { strategy: "oauth_google", label: "Continuer avec Google", Icon: GoogleIcon },
  { strategy: "oauth_facebook", label: "Continuer avec Facebook", Icon: FacebookIcon },
  { strategy: "oauth_apple", label: "Continuer avec Apple", Icon: AppleIcon },
];

export const SocialAuthButtons = ({ onError }: { onError: (message: string) => void }) => {
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [pendingStrategy, setPendingStrategy] = useState<OAuthStrategy | null>(null);

  const onPress = async (strategy: OAuthStrategy) => {
    if (pendingStrategy) return;

    setPendingStrategy(strategy);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/learn");
      }
    } catch (err: any) {
      onError(err?.errors?.[0]?.message ?? "La connexion a échoué. Veuillez réessayer.");
    } finally {
      setPendingStrategy(null);
    }
  };

  return (
    <View style={styles.container}>
      {PROVIDERS.map(({ strategy, label, Icon }) => (
        <Pressable
          key={strategy}
          style={[styles.button, pendingStrategy && styles.buttonDisabled]}
          onPress={() => onPress(strategy)}
          disabled={!!pendingStrategy}
        >
          {pendingStrategy === strategy ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <View style={styles.content}>
              <View style={styles.iconSlot}>{Icon && <Icon />}</View>
              <Text style={styles.label}>{label}</Text>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    width: 250,
  },
  iconSlot: {
    width: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginLeft: 14,
  },
});
