import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-canvas dark:bg-graphite">
      <View className="flex-1 items-center justify-center gap-2 px-8">
        <Text className="font-sans-semibold text-2xl text-graphite dark:text-on-graphite">
          {title}
        </Text>
        <Text className="font-sans text-base text-placeholder dark:text-placeholder-dark">
          Coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
