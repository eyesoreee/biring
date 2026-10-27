import { useRouter } from "expo-router";
import { View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppLogo } from "@/components/ui/AppLogo";
import { BrandButton } from "@/components/ui/BrandButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { OnboardingDots } from "@/features/onboarding/components/OnboardingDots";
import {
  OnboardingSlide,
  type OnboardingSlideContent,
} from "@/features/onboarding/components/OnboardingSlide";

const SLIDES: OnboardingSlideContent[] = [
  {
    icon: "link-outline",
    title: "Track household expenses together",
    subtitle:
      "Add what you spend and see what everyone else adds — one shared list instead of scattered receipts.",
  },
  {
    icon: "cloud-offline-outline",
    title: "Keep logging when you're offline",
    subtitle:
      "No signal, no problem. Expenses save on your device and sync automatically when you're back online.",
  },
  {
    icon: "lock-closed-outline",
    title: "Only your household can see it",
    subtitle:
      "Join with an invite code and keep the books between members. Owners decide who stays.",
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const offset = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    offset.value = event.contentOffset.x;
  });

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-canvas dark:bg-graphite"
    >
      <View className="flex-row items-center justify-between px-6 pt-2">
        <AppLogo />
        <ThemeToggle />
      </View>

      <Animated.ScrollView
        horizontal
        pagingEnabled
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        className="flex-1"
      >
        {SLIDES.map((slide) => (
          <View
            key={slide.title}
            style={{ width }}
            className="items-center justify-center px-8"
          >
            <OnboardingSlide {...slide} />
          </View>
        ))}
      </Animated.ScrollView>

      <View className="gap-4 px-6 pb-2 pt-3">
        <OnboardingDots count={SLIDES.length} offset={offset} width={width} />
        <BrandButton
          fullWidth
          label="Get started"
          onPress={() => router.navigate("/auth")}
        />
      </View>
    </SafeAreaView>
  );
}
