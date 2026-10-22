import { Ionicons } from "@expo/vector-icons";
import { useQuery, useStatus } from "@powersync/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLogo } from "@/components/ui/AppLogo";
import { BrandButton } from "@/components/ui/BrandButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { HouseholdRow } from "@/features/household/components/HouseholdRow";
import { formatMoney, monthBounds, MONTHS } from "@/features/household/format";
import { HOUSEHOLDS_SQL } from "@/features/household/sql";
import type { HouseholdListItem } from "@/features/household/types";
import { useSession } from "@/lib/auth";
import { logout } from "@/powersync/system";
import { useTheme } from "@/theme/ThemeProvider";

export default function HouseholdsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const session = useSession();
  const { connected, hasSynced } = useStatus();

  const now = new Date();
  const { monthStart, monthEnd } = monthBounds(now);
  const { data: households } = useQuery<HouseholdListItem>(HOUSEHOLDS_SQL, [
    monthStart,
    monthEnd,
    session?.user.id ?? "",
  ]);
  const offline = !connected;
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      router.replace("/auth");
    } catch (cause) {
      Alert.alert(
        "Can't sign out",
        cause instanceof Error ? cause.message : "Please try again.",
      );
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-canvas dark:bg-graphite"
    >
      <View className="flex-row items-center justify-between px-6 pt-2">
        <AppLogo />
        <ThemeToggle />
      </View>

      <View className="flex-1 px-6 pt-6">
        <Text className="font-sans-bold text-3xl text-graphite dark:text-on-graphite">
          Your households
        </Text>

        {households.length === 0 ? (
          hasSynced ? (
            <View className="flex-1 items-center justify-center gap-3 px-8">
              <View className="h-14 w-14 items-center justify-center rounded-3xl bg-selected dark:bg-selected-dark">
                <Ionicons name="home-outline" size={28} color={colors.mint} />
              </View>
              <Text className="font-sans-semibold text-xl text-graphite dark:text-on-graphite">
                No households yet
              </Text>
              <Text className="text-center font-sans text-base text-muted dark:text-silver">
                Create one or join with a code to get started.
              </Text>
            </View>
          ) : null
        ) : (
          <View className="mt-3 gap-3">
            {households.map((household) => (
              <HouseholdRow
                key={household.id}
                name={household.name}
                members={household.members}
                month={MONTHS[now.getMonth()]}
                total={formatMoney(
                  household.month_total,
                  household.currency_code,
                )}
                onPress={() =>
                  router.navigate({
                    pathname: "/household/[id]",
                    params: { id: household.id },
                  })
                }
              />
            ))}
          </View>
        )}
      </View>

      <View className="gap-2 px-6 pb-4">
        {offline ? (
          <Text className="text-center font-sans text-lg text-muted dark:text-silver">
            Creating, joining, and signing out need a connection.
          </Text>
        ) : null}
        <BrandButton
          fullWidth
          label="Create household"
          disabled={offline}
          onPress={() => router.navigate("/household/create")}
        />
        <BrandButton
          variant="text"
          label="Join with invite code"
          disabled={offline}
          onPress={() => router.navigate("/household/join")}
        />
        <View className="mt-2 border-t border-edge pt-4 dark:border-graphite-border">
          <BrandButton
            fullWidth
            variant="outlined"
            label={signingOut ? "Signing out…" : "Sign out"}
            disabled={signingOut || offline}
            onPress={signOut}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
