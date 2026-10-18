import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLogo } from "@/components/ui/AppLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/theme/ThemeProvider";

const HOUSEHOLDS = [
  { id: "dummy-home", name: "Home", members: 3 },
  { id: "dummy-beach", name: "Beach house", members: 5 },
];

export default function HouseholdsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-canvas dark:bg-graphite"
    >
      <View className="flex-row items-center justify-between px-6 pt-2">
        <AppLogo />
        <ThemeToggle />
      </View>

      <View className="flex-1 gap-3 px-6 pt-6">
        <Text className="font-sans-bold text-3xl text-graphite dark:text-on-graphite">
          Your households
        </Text>

        {HOUSEHOLDS.map((household) => (
          <Pressable
            key={household.id}
            onPress={() =>
              router.push({
                pathname: "/household/[id]",
                params: { id: household.id },
              })
            }
            className="active:opacity-80 flex-row items-center justify-between rounded-2xl border border-edge bg-surface px-5 py-4 dark:border-graphite-border dark:bg-graphite-surface"
          >
            <View>
              <Text className="font-sans-semibold text-lg text-graphite dark:text-on-graphite">
                {household.name}
              </Text>
              <Text className="font-sans text-sm text-muted dark:text-silver">
                {household.members} members
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ))}

        <Text className="mt-1 text-center font-sans text-sm text-placeholder dark:text-placeholder-dark">
          Real households from your account land here next.
        </Text>
      </View>
    </SafeAreaView>
  );
}
