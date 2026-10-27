import { Image, Text, View } from "react-native";

const icon = require("../../../assets/images/icon.png");

type AppLogoProps = {
  size?: number;
  showWordmark?: boolean;
  tone?: "light" | "dark";
};

export function AppLogo({
  size = 36,
  showWordmark = true,
  tone = "light",
}: AppLogoProps) {
  return (
    <View className="flex-row items-center gap-3">
      <Image
        source={icon}
        className={
          tone === "dark"
            ? "border border-graphite-border"
            : "dark:border dark:border-graphite-border"
        }
        style={{
          borderRadius: size * 0.25,
          height: size,
          width: size,
        }}
      />

      {showWordmark ? (
        <Text
          className={`font-sans-semibold text-xl ${
            tone === "dark"
              ? "text-on-graphite"
              : "text-graphite dark:text-on-graphite"
          }`}
        >
          biring
        </Text>
      ) : null}
    </View>
  );
}
