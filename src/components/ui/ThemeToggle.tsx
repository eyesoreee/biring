import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/theme/ThemeProvider";

export function ThemeToggle() {
  const { isDark, toggleDark } = useTheme();
  const progress = useSharedValue(isDark ? 0 : 1);

  useEffect(() => {
    progress.set(
      withTiming(isDark ? 0 : 1, {
        duration: 250,
        easing: Easing.cubic,
      }),
    );
  }, [isDark, progress]);

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["#2b3244", "#bfdcff"],
    ),
  }));
  const thumb = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 20 }],
  }));
  const sun = useAnimatedStyle(() => ({ opacity: progress.value }));
  const moon = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));

  return (
    <Pressable onPress={toggleDark}>
      <Animated.View
        style={track}
        className="h-9 w-16 justify-center rounded-full px-2"
      >
        <Animated.View
          style={thumb}
          className="h-7 w-7 items-center justify-center rounded-full bg-white"
        >
          <Animated.View style={moon} className="absolute">
            <Ionicons name="moon" size={16} color="#475569" />
          </Animated.View>
          <Animated.View style={sun} className="absolute">
            <Ionicons name="sunny" size={16} color="#f59e0b" />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
