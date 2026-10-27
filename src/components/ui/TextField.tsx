import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

export function TextField({
  onBlur,
  onFocus,
  secureTextEntry,
  ...props
}: TextInputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <View className="justify-center">
      <TextInput
        {...props}
        secureTextEntry={secureTextEntry && !revealed}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        className={`h-14 rounded-2xl border bg-surface px-4 font-sans text-lg text-graphite placeholder:text-placeholder dark:bg-graphite-surface dark:text-on-graphite dark:placeholder:text-placeholder-dark ${
          focused
            ? "border-mint-ink dark:border-mint"
            : "border-edge dark:border-graphite-border"
        } ${secureTextEntry ? "pr-12" : ""}`}
      />

      {secureTextEntry ? (
        <Pressable
          onPress={() => setRevealed((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={revealed ? "Hide password" : "Show password"}
          className="active:opacity-60 absolute right-1 h-12 w-12 items-center justify-center"
        >
          <Ionicons
            name={revealed ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
