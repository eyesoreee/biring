import { View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { useTheme } from "@/theme/ThemeProvider";

type DotProps = {
  index: number;
  offset: SharedValue<number>;
  width: number;
  activeColor: string;
  inactiveColor: string;
};

function Dot({ index, offset, width, activeColor, inactiveColor }: DotProps) {
  const style = useAnimatedStyle(() => {
    const progress = offset.value / width;
    const range = [index - 1, index, index + 1];
    return {
      backgroundColor: interpolateColor(progress, range, [
        inactiveColor,
        activeColor,
        inactiveColor,
      ]),
      width: interpolate(progress, range, [8, 22, 8], Extrapolation.CLAMP),
    };
  });

  return <Animated.View style={style} className="h-2 rounded-full" />;
}

type OnboardingDotsProps = {
  count: number;
  offset: SharedValue<number>;
  width: number;
};

export function OnboardingDots({ count, offset, width }: OnboardingDotsProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row justify-center gap-2">
      {Array.from({ length: count }, (_, index) => (
        <Dot
          key={index}
          index={index}
          offset={offset}
          width={width}
          activeColor={colors.mint}
          inactiveColor={colors.border}
        />
      ))}
    </View>
  );
}
