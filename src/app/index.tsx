import { useQuery, useStatus } from "@powersync/react";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppLogo } from "@/components/ui/AppLogo";
import { BrandButton } from "@/components/ui/BrandButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { HouseholdRow } from "@/features/household/components/HouseholdRow";
import { formatMoney, monthBounds, MONTHS } from "@/features/household/format";
import { HOUSEHOLDS_SQL } from "@/features/household/sql";
import type { HouseholdListItem } from "@/features/household/types";
import { useSession } from "@/lib/auth";
import { logout } from "@/powersync/system";

export default function HouseholdsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <SafeAreaView edges={["top"]} className="flex-1 bg-graphite">
      <View className="gap-5 px-6 pb-6 pt-2">
        <View className="flex-row items-center justify-between">
          <AppLogo tone="dark" />
          <ThemeToggle />
        </View>
        <Text className="font-sans-bold text-3xl text-on-graphite">
          Your households
        </Text>
      </View>

      <View className="flex-1 overflow-hidden rounded-t-3xl bg-surface dark:bg-graphite-surface">
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow px-6 pt-2"
          showsVerticalScrollIndicator={false}
        >
          {households.length === 0 ? (
            hasSynced ? (
              <View className="flex-1 justify-center">
                <EmptyState
                  icon="home-outline"
                  title="No households yet"
                  body="Create one or join with a code to get started."
                />
              </View>
            ) : null
          ) : (
            households.map((household, index) => (
              <HouseholdRow
                key={household.id}
                name={household.name}
                members={household.members}
                month={MONTHS[now.getMonth()]}
                total={formatMoney(
                  household.month_total,
                  household.currency_code,
                )}
                divider={index < households.length - 1}
                onPress={() =>
                  router.navigate({
                    pathname: "/household/[id]",
                    params: { id: household.id },
                  })
                }
              />
            ))
          )}
        </ScrollView>

        <View
          className="gap-2 border-t border-edge px-6 pt-4 dark:border-graphite-border"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          {offline ? (
            <Text className="pb-1 text-center font-sans text-sm text-muted dark:text-silver">
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
          <Pressable
            disabled={signingOut || offline}
            accessibilityRole="button"
            accessibilityState={{ disabled: signingOut || offline }}
            onPress={signOut}
            className={`active:opacity-60 items-center py-2.5 ${
              signingOut || offline ? "opacity-40" : ""
            }`}
          >
            <Text className="font-sans-medium text-sm text-muted dark:text-silver">
              {signingOut ? "Signing out…" : "Sign out"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
