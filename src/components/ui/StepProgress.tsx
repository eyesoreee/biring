import { Text, View } from "react-native";

type StepProgressProps = {
  completed: number;
  total: number;
};

export function StepProgress({ completed, total }: StepProgressProps) {
  return (
    <View className="gap-2">
      <Text className="font-sans-medium text-xs text-muted dark:text-silver">
        {completed} of {total} complete
      </Text>
      <View className="flex-row gap-1.5">
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index < completed ? "bg-mint" : "bg-edge dark:bg-graphite-border"
            }`}
          />
        ))}
      </View>
    </View>
  );
}
