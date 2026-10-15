import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-canvas dark:bg-graphite">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-mint">
        <Text className="text-lg font-bold text-on-mint">b</Text>
      </View>
      <Text className="mt-4 text-xl font-semibold text-graphite dark:text-on-graphite">
        biring
      </Text>
      <Text className="mt-1 text-sm text-silver">Start building</Text>
    </View>
  );
}
