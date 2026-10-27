import { useState } from "react";
import { Pressable, Text } from "react-native";

type BrandButtonProps = {
  label: string;
  onPress: () => void;
  onPressIn?: () => void;
  variant?: "filled" | "outlined" | "text" | "destructive";
  disabled?: boolean;
  fullWidth?: boolean;
};

export function BrandButton({
  label,
  onPress,
  onPressIn,
  variant = "filled",
  disabled,
  fullWidth,
}: BrandButtonProps) {
  const [pressed, setPressed] = useState(false);

  const isFilled = variant === "filled";
  const isOutlined = variant === "outlined";

  const variantClass = isFilled
    ? pressed
      ? "border-transparent bg-mint-hover"
      : "border-transparent bg-mint"
    : isOutlined
      ? `border-edge bg-transparent dark:border-graphite-border ${pressed ? "opacity-70" : ""}`
      : `border-transparent bg-transparent ${pressed ? "opacity-60" : ""}`;

  const labelClass = isFilled
    ? "text-on-mint"
    : isOutlined
      ? "text-graphite dark:text-on-graphite"
      : variant === "destructive"
        ? "text-destructive-ink dark:text-destructive"
        : "text-mint-ink dark:text-mint";

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      onPressIn={() => {
        setPressed(true);
        onPressIn?.();
      }}
      onPressOut={() => setPressed(false)}
      className={`items-center justify-center rounded-full border px-7 py-3 ${variantClass} ${fullWidth ? "self-stretch" : ""} ${disabled ? "opacity-40" : ""}`}
    >
      <Text className={`font-sans-semibold text-xl ${labelClass}`}>
        {label}
      </Text>
    </Pressable>
  );
}
