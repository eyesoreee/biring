import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLogo } from "@/components/ui/AppLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useHousehold } from "@/lib/household";

export default function HomeScreen() {
  const { id } = useHousehold();

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
    </SafeAreaView>
  );
}
