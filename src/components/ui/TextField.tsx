import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

export function TextField({
  error,
  onBlur,
  onFocus,
  secureTextEntry,
  ...props
}: TextInputProps & { error?: string }) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const borderClass = error
    ? "border-destructive-ink dark:border-destructive"
    : focused
      ? "border-mint-ink dark:border-mint"
      : "border-edge dark:border-graphite-border";

  return (
    <View className="gap-1.5">
      <View className="justify-center">
        <TextInput
          {...props}
          accessibilityHint={error}
          secureTextEntry={secureTextEntry && !revealed}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={`h-14 rounded-2xl border bg-surface px-4 font-sans text-lg text-graphite placeholder:text-placeholder dark:bg-graphite-surface dark:text-on-graphite dark:placeholder:text-placeholder-dark ${borderClass} ${
            secureTextEntry ? "pr-12" : ""
          }`}
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

      {error ? (
        <Text className="px-1 font-sans text-sm text-destructive-ink dark:text-destructive">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
