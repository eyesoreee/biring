import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLogo } from "@/components/ui/AppLogo";
import { BrandButton } from "@/components/ui/BrandButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { logout } from "@/powersync/system";

export default function HomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
      router.replace("/auth");
    } catch (cause) {
      Alert.alert(
        "Can't log out",
        cause instanceof Error ? cause.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas dark:bg-graphite">
      <View className="flex-row items-center justify-between px-6 pt-2">
        <AppLogo />
        <ThemeToggle />
      </View>

      <View className="flex-1 items-center justify-center gap-3 px-8">
        <Text className="font-sans-bold text-4xl text-graphite dark:text-on-graphite">
          You&apos;re in
        </Text>
        {id ? (
          <Text className="font-sans text-lg text-muted dark:text-silver">
            {id}
          </Text>
        ) : null}
        <Text className="text-center font-sans text-base text-placeholder dark:text-placeholder-dark">
          Household dashboard lands here next.
        </Text>
      </View>

      <View className="px-6 pb-4">
        <BrandButton
          fullWidth
          variant="outlined"
          label={busy ? "Logging out…" : "Log out"}
          disabled={busy}
          onPress={handleLogout}
        />
      </View>
    </SafeAreaView>
  );
}
